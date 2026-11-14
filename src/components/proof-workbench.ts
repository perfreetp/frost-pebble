// 打样工作台：上传原图 -> 自研编码器压缩 -> 三维场景并排对比
// 质量档 30-95 实时可调，实时显示文件体积与失真指标
import { store, STATUS_LABEL, type Order } from '../store';
import { compressImage, analyzeImage, type CompressResult, type BlockAnalysis } from '../codec/codec';
import { CompareScene } from '../three/compare-scene';
import {
  SHARED_CSS, el, fmtSize, fmtTime,
  imageDataToCanvas, makeBlockZoomCanvas, loadImageFile, makeTestImage,
} from '../ui/shared';

export class ProofWorkbench extends HTMLElement {
  private scene: CompareScene | null = null;
  private viewport = el('div', 'viewport');
  private infoBox = el('div');
  private metricsBox = el('div', 'metrics');
  private warnBox = el('div', 'warns');
  private submitBtn = el('button', 'ok', '提交质检');
  private slider = el('input') as HTMLInputElement;
  private qualityLabel = el('span', 'qval', '80');

  private original: ImageData | null = null;
  private originalName = '';
  private originalFileSize = 0;
  private analysis: BlockAnalysis | null = null;
  private result: CompressResult | null = null;
  private quality = 80;
  private debounceTimer = 0;
  private loadedOrderId: string | null = null;

  private onChange = (): void => this.refreshOrder();

  connectedCallback(): void {
    this.buildDom();
    store.addEventListener('change', this.onChange);
    this.scene = new CompareScene(this.viewport);
    this.scene.setImages([null, null, null], ['原图', '压缩图', '块效应放大']);
    this.refreshOrder();
  }

  disconnectedCallback(): void {
    store.removeEventListener('change', this.onChange);
    this.scene?.dispose();
    this.scene = null;
  }

  private currentOrder(): Order | null {
    const o = store.selectedOrderId ? store.get(store.selectedOrderId) : null;
    return o && (o.status === 'making') ? o : null;
  }

  private buildDom(): void {
    this.innerHTML = '';
    const style = el('style');
    style.textContent = SHARED_CSS + `
      .layout { display: grid; grid-template-columns: 340px 1fr; gap: 14px; }
      .viewport { height: 480px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e6ec; background: #14181f; }
      .qrow { display: flex; align-items: center; gap: 10px; margin: 12px 0 4px; }
      .qrow input[type=range] { flex: 1; padding: 0; }
      .qval { font-size: 20px; font-weight: 700; color: #2f6fdd; min-width: 40px; text-align: center; }
      .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
      .metric { background: #f4f6f9; border-radius: 8px; padding: 8px 10px; }
      .metric .v { font-size: 17px; font-weight: 700; color: #1c2430; }
      .metric .k { font-size: 11px; color: #8a94a3; }
      .warns { margin: 8px 0; }
      .warns .w { background: #fde8e8; color: #b03030; border-radius: 6px; padding: 7px 10px; font-size: 12px; margin-bottom: 6px; }
      .warns .okbox { background: #e2f6e9; color: #1e7a41; }
      .btns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
      .empty { padding: 40px 20px; text-align: center; color: #8a94a3; }
      input[type=file] { display: none; }
    `;
    this.append(style);

    const layout = el('div', 'layout');
    const left = el('div', 'panel');
    left.innerHTML = `<h2>打样工作台</h2>`;
    left.append(this.infoBox);

    // 上传区
    const fileInput = el('input') as HTMLInputElement;
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = () => {
      const f = fileInput.files?.[0];
      if (f) this.loadFile(f);
      fileInput.value = '';
    };
    const uploadBtn = el('button', 'ghost', '上传原图');
    uploadBtn.onclick = () => fileInput.click();
    const testBtn = el('button', 'ghost', '生成测试图');
    testBtn.onclick = () => this.loadTestImage();
    const btnRow = el('div', 'btns');
    btnRow.append(uploadBtn, testBtn, fileInput);
    left.append(btnRow);

    // 质量档
    const qrow = el('div', 'qrow');
    this.slider.type = 'range';
    this.slider.min = '30';
    this.slider.max = '95';
    this.slider.step = '1';
    this.slider.value = String(this.quality);
    this.slider.oninput = () => {
      this.quality = Number(this.slider.value);
      this.qualityLabel.textContent = String(this.quality);
      this.scheduleCompress();
    };
    qrow.append(el('label', '', '质量档'), this.slider, this.qualityLabel);
    left.append(qrow);
    left.append(el('div', 'muted', '30（最小体积）— 95（最高保真），拖动即时重编码'));

    left.append(this.metricsBox, this.warnBox);

    this.submitBtn.disabled = true;
    this.submitBtn.onclick = () => this.submit();
    const submitRow = el('div', 'btns');
    submitRow.append(this.submitBtn);
    left.append(submitRow);

    const right = el('div');
    right.append(this.viewport);
    layout.append(left, right);
    this.append(layout);
  }

  private refreshOrder(): void {
    const o = this.currentOrder();
    this.infoBox.innerHTML = '';
    if (!o) {
      this.infoBox.append(el('div', 'empty', '请先在「工单流转」中接单或选择一张制作中的工单'));
      this.submitBtn.disabled = true;
      return;
    }
    const overdue = store.isOverdue(o);
    this.infoBox.innerHTML = `
      <div class="badge info">${o.id}</div>
      <span class="badge">${STATUS_LABEL[o.status]}</span>
      ${overdue ? '<span class="badge warn">已超期</span>' : ''}
      <h3 style="margin-top:8px">${o.customer} · ${o.sizeW}×${o.sizeH}cm · ${o.paperWeight}g · ${o.colors}色</h3>
      <div class="muted">师傅：${o.master} · 交期 ${fmtTime(o.dueAt)} · 已返工 ${o.rework} 次</div>
    `;
    // 打回重做的工单预加载上次原图
    if (o.proof && this.loadedOrderId !== o.id) {
      this.loadedOrderId = o.id;
      this.quality = o.proof.quality;
      this.slider.value = String(this.quality);
      this.qualityLabel.textContent = String(this.quality);
      const image = new Image();
      image.onload = () => {
        const c = document.createElement('canvas');
        c.width = image.width;
        c.height = image.height;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(image, 0, 0);
        this.setOriginal(ctx.getImageData(0, 0, image.width, image.height), o.proof!.imageName, 0);
      };
      image.src = o.proof.imageDataUrl;
    }
    this.updateSubmitState();
  }

  private async loadFile(file: File): Promise<void> {
    try {
      const { img } = await loadImageFile(file);
      this.setOriginal(img, file.name, file.size);
    } catch {
      alert('图片读取失败，请换一张试试');
    }
  }

  private loadTestImage(): void {
    this.setOriginal(makeTestImage(512), '测试图（系统生成）', 0);
  }

  private setOriginal(img: ImageData, name: string, fileSize: number): void {
    this.original = img;
    this.originalName = name;
    this.originalFileSize = fileSize;
    this.analysis = analyzeImage(img);
    this.renderWarnings();
    this.runCompress();
  }

  private scheduleCompress(): void {
    window.clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => this.runCompress(), 120);
  }

  private runCompress(): void {
    if (!this.original) return;
    this.result = compressImage(this.original, this.quality);
    this.renderMetrics();
    this.updateScene();
    this.updateSubmitState();
  }

  private renderMetrics(): void {
    this.metricsBox.innerHTML = '';
    if (!this.result || !this.original) return;
    const r = this.result;
    const rawBytes = this.original.width * this.original.height * 3;
    const ratio = (rawBytes / r.bytes.length).toFixed(1);
    const items: Array<[string, string]> = [
      ['压缩后体积', fmtSize(r.bytes.length)],
      ['压缩比', `${ratio} : 1`],
      ['PSNR', r.psnr === Infinity ? '无损' : `${r.psnr.toFixed(2)} dB`],
      ['MSE', r.mse.toFixed(2)],
      ['分块数', `${r.yBlocks} 亮度 + ${r.cBlocks} 色度`],
      ['原始像素体积', fmtSize(rawBytes)],
    ];
    if (this.originalFileSize > 0) {
      items.push(['上传文件体积', fmtSize(this.originalFileSize)]);
    }
    for (const [k, v] of items) {
      const box = el('div', 'metric');
      box.append(el('div', 'v', v), el('div', 'k', k));
      this.metricsBox.append(box);
    }
  }

  private renderWarnings(): void {
    this.warnBox.innerHTML = '';
    if (!this.analysis) return;
    if (this.analysis.warnings.length === 0) {
      const ok = el('div', 'w okbox');
      ok.textContent = `图像适合压缩（纯色块 ${(this.analysis.flatRatio * 100).toFixed(0)}%，碎细节块 ${(this.analysis.busyRatio * 100).toFixed(0)}%）`;
      this.warnBox.append(ok);
    } else {
      for (const w of this.analysis.warnings) {
        const box = el('div', 'w');
        box.textContent = `⚠ ${w}`;
        this.warnBox.append(box);
      }
    }
  }

  private updateScene(): void {
    if (!this.scene || !this.original || !this.result) return;
    this.scene.setImages(
      [imageDataToCanvas(this.original), imageDataToCanvas(this.result.decompressed), makeBlockZoomCanvas(this.result.decompressed)],
      ['原图', `压缩图 Q${this.quality}`, '块效应放大 ×4'],
    );
  }

  private updateSubmitState(): void {
    this.submitBtn.disabled = !(this.currentOrder() && this.result);
  }

  private submit(): void {
    const o = this.currentOrder();
    if (!o || !this.result || !this.original) return;
    const dataUrl = imageDataToCanvas(this.original).toDataURL('image/png');
    store.saveProof(o.id, {
      imageName: this.originalName,
      imageDataUrl: dataUrl,
      width: this.original.width,
      height: this.original.height,
      quality: this.quality,
      fileSize: this.result.bytes.length,
      psnr: this.result.psnr === Infinity ? 99 : this.result.psnr,
      mse: this.result.mse,
      warnings: this.analysis?.warnings ?? [],
    });
    store.submitQc(o.id, store.operators.master);
    this.result = null;
    this.original = null;
    this.analysis = null;
    this.metricsBox.innerHTML = '';
    this.warnBox.innerHTML = '';
    this.scene?.setImages([null, null, null], ['原图', '压缩图', '块效应放大']);
    document.dispatchEvent(new CustomEvent('app-navigate', { detail: 'board' }));
  }
}

customElements.define('proof-workbench', ProofWorkbench);
