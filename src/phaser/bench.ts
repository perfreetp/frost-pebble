import Phaser from 'phaser';
import { paintScene } from '../lib/compose';
import { presetInfo, type BgPresetId, type BrushStroke } from '../lib/types';

export const BENCH_W = 900;
export const BENCH_H = 720;
const MARGIN = 30;

export interface BenchCallbacks {
  onStrokes: (strokes: BrushStroke[]) => void;
  onMask: (mask: HTMLCanvasElement) => void;
  onToolSize: (size: number) => void;
  onHint: (text: string) => void;
  /** 场景 create 完成，可安全调用其余接口 */
  onReady?: () => void;
}

type ToolMode = 'restore' | 'erase';

function cv(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export class BenchScene extends Phaser.Scene {
  private cb: BenchCallbacks;

  private photo: HTMLCanvasElement | null = null;
  private baseMask: HTMLCanvasElement | null = null;
  private restoreCanvas: HTMLCanvasElement | null = null;
  private eraseCanvas: HTMLCanvasElement | null = null;
  private workMask: HTMLCanvasElement | null = null;
  private subjectCanvas: HTMLCanvasElement | null = null;
  private shadowCanvas: HTMLCanvasElement | null = null;
  private maskPreview: HTMLCanvasElement | null = null;

  private strokes: BrushStroke[] = [];
  private activeStroke: BrushStroke | null = null;

  private bgImg!: Phaser.GameObjects.Image;
  private shadowImg!: Phaser.GameObjects.Image;
  private subjectImg!: Phaser.GameObjects.Image;
  private maskImg!: Phaser.GameObjects.Image;
  private compareImg!: Phaser.GameObjects.Image;
  private brushG!: Phaser.GameObjects.Graphics;
  private frameG!: Phaser.GameObjects.Graphics;
  private borderG!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private plateLabel!: Phaser.GameObjects.Text;

  private tool: ToolMode = 'restore';
  private brushSize = 0.05;
  private feather = 1.1;
  private shadow = 0.5;
  private preset: BgPresetId = 'studio';
  private showMask = false;
  private compareAlpha = 0.5;
  private compareMode: 'overlay' | 'diff' = 'overlay';

  private rect = { x: 0, y: 0, w: 100, h: 100 };
  private plate = { x: MARGIN, y: MARGIN + 26, w: BENCH_W - MARGIN * 2, h: BENCH_H - MARGIN * 2 - 26 };
  private drawing = false;
  private rafPending = false;
  private dirty = false;

  constructor(cb: BenchCallbacks) {
    super({ key: 'bench' });
    this.cb = cb;
  }

  create(): void {
    this.plate = {
      x: MARGIN,
      y: MARGIN + 30,
      w: BENCH_W - MARGIN * 2,
      h: BENCH_H - MARGIN * 2 - 30,
    };

    const bgCanvas = paintScene(this.preset, 476, 604);
    this.frameG = this.add.graphics().setDepth(-10);
    this.bgImg = this.add.image(0, 0, this.ensureCanvasTexture('bench-bg', bgCanvas)).setOrigin(0).setDepth(1);
    this.shadowImg = this.add.image(0, 0, this.ensureCanvasTexture('bench-shadow', cv(4, 4))).setOrigin(0, 0).setDepth(2);
    this.subjectImg = this.add.image(0, 0, this.ensureCanvasTexture('bench-subject', cv(4, 4))).setOrigin(0, 0).setDepth(3);
    this.maskImg = this.add.image(0, 0, this.ensureCanvasTexture('bench-mask', cv(4, 4))).setOrigin(0, 0).setDepth(4).setVisible(false);
    this.compareImg = this.add.image(0, 0, this.ensureCanvasTexture('bench-compare', cv(4, 4))).setOrigin(0).setDepth(5).setVisible(false);
    this.brushG = this.add.graphics().setDepth(20);
    this.borderG = this.add.graphics().setDepth(10);

    this.label = this.add.text(MARGIN + 4, MARGIN - 2, '', {
      fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
      fontSize: '15px',
      color: '#cfd8cf',
    }).setDepth(30);
    this.plateLabel = this.add.text(MARGIN + 4, BENCH_H - MARGIN + 6, '', {
      fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
      fontSize: '14px',
      color: '#8fa092',
    }).setDepth(30);
    this.hintText = this.add.text(BENCH_W / 2, BENCH_H / 2, '选择一批样苗照片后开始加工', {
      fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
      fontSize: '18px',
      color: '#94a596',
    }).setOrigin(0.5).setDepth(30);

    this.layoutPlate();
    this.drawFrame();

    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.on('pointerupoutside', this.onPointerUp, this);

    this.events.on('shutdown', () => {
      this.input.off('pointerdown', this.onPointerDown, this);
      this.input.off('pointermove', this.onPointerMove, this);
      this.input.off('pointerup', this.onPointerUp, this);
      this.input.off('pointerupoutside', this.onPointerUp, this);
    });

    this.cb.onReady?.();
  }

  private ensureCanvasTexture(key: string, canvas: HTMLCanvasElement): string {
    if (this.textures.exists(key)) {
      const tex = this.textures.get(key) as Phaser.Textures.CanvasTexture;
      if (tex.getSourceImage() !== canvas) {
        this.textures.remove(key);
        this.textures.addCanvas(key, canvas);
      }
      return key;
    }
    this.textures.addCanvas(key, canvas);
    return key;
  }

  /** 让纹理直接引用指定画布，后续 refres​h 才会反映绘制结果 */
  private registerTexture(key: string, canvas: HTMLCanvasElement): void {
    if (this.textures.exists(key)) this.textures.remove(key);
    this.textures.addCanvas(key, canvas);
  }

  private tex(key: string): Phaser.Textures.CanvasTexture {
    return this.textures.get(key) as Phaser.Textures.CanvasTexture;
  }

  private layoutPlate(): void {
    this.bgImg.setPosition(this.plate.x, this.plate.y).setDisplaySize(this.plate.w, this.plate.h);
    this.drawFrame();
  }

  private drawFrame(): void {
    const p = this.plate;
    this.frameG.clear();
    this.frameG.fillStyle(0x0d1210, 1);
    this.frameG.fillRect(0, 0, BENCH_W, BENCH_H);
    this.frameG.fillStyle(0x151d19, 1);
    this.frameG.fillRoundedRect(8, 8, BENCH_W - 16, BENCH_H - 16, 10);
    this.frameG.lineStyle(1, 0x2e3a34, 1);
    this.frameG.strokeRoundedRect(8, 8, BENCH_W - 16, BENCH_H - 16, 10);
    this.borderG.clear();
    this.borderG.lineStyle(1, 0x3d4c44, 1);
    this.borderG.strokeRect(p.x, p.y, p.w, p.h);
    this.borderG.lineStyle(1, 0x2b352f, 1);
    this.borderG.strokeRect(p.x + 7, p.y + 7, p.w - 14, p.h - 14);
  }

  /* ---------------- 外部接口 ---------------- */

  setPhoto(canvas: HTMLCanvasElement): void {
    this.photo = canvas;
    const cw = canvas.width;
    const ch = canvas.height;
    this.restoreCanvas = cv(cw, ch);
    this.eraseCanvas = cv(cw, ch);
    this.workMask = cv(cw, ch);
    this.subjectCanvas = cv(cw, ch);
    this.shadowCanvas = cv(Math.ceil(cw / 4), Math.ceil(ch / 4));
    this.maskPreview = cv(cw, ch);
    this.strokes = [];
    this.activeStroke = null;

    this.registerTexture('bench-subject', this.subjectCanvas);
    this.registerTexture('bench-shadow', this.shadowCanvas);
    this.registerTexture('bench-mask', this.maskPreview);
    this.subjectImg.setTexture('bench-subject');
    this.shadowImg.setTexture('bench-shadow');
    this.maskImg.setTexture('bench-mask');

    const maxW = this.plate.w - 56;
    const maxH = this.plate.h - 40;
    const scale = Math.min(maxW / cw, maxH / ch);
    const w = cw * scale;
    const h = ch * scale;
    this.rect = {
      x: this.plate.x + (this.plate.w - w) / 2,
      y: this.plate.y + this.plate.h - h - 22,
      w,
      h,
    };

    this.subjectImg.setPosition(this.rect.x, this.rect.y).setDisplaySize(this.rect.w, this.rect.h);
    this.shadowImg.setPosition(this.rect.x, this.rect.y).setDisplaySize(this.rect.w, this.rect.h);
    this.maskImg.setPosition(this.rect.x, this.rect.y).setDisplaySize(this.rect.w, this.rect.h);
    this.compareImg.setPosition(this.rect.x, this.rect.y).setDisplaySize(this.rect.w, this.rect.h);
    this.maskImg.setVisible(this.showMask);
    this.hintText.setVisible(false);
    this.updateLabels();
    this.rebuild(false);
  }

  setBaseMask(mask: HTMLCanvasElement): void {
    this.baseMask = mask;
    this.rebuild(true);
  }

  setStrokes(strokes: BrushStroke[]): void {
    this.strokes = strokes.map((s) => ({ ...s, points: s.points.map((p) => [p[0], p[1]] as [number, number]) }));
    this.repaintStrokeLayers();
    this.rebuild(true);
  }

  getStrokes(): BrushStroke[] {
    return this.strokes;
  }

  undo(): void {
    this.strokes.pop();
    this.repaintStrokeLayers();
    this.rebuild(true);
    this.cb.onStrokes(this.strokes);
  }

  clearStrokes(): void {
    this.strokes = [];
    this.repaintStrokeLayers();
    this.rebuild(true);
    this.cb.onStrokes(this.strokes);
  }

  setTool(mode: ToolMode): void {
    this.tool = mode;
    this.updateLabels();
  }

  setBrushSize(size: number): void {
    this.brushSize = size;
    this.cb.onToolSize(size);
  }

  setFeather(v: number): void {
    this.feather = v;
    this.rebuild(true);
  }

  setShadow(v: number): void {
    this.shadow = v;
    this.applyShadow();
  }

  setPreset(id: BgPresetId): void {
    this.preset = id;
    const bgCanvas = paintScene(id, 476, 604);
    const tex = this.tex('bench-bg');
    const ctx = (tex.getSourceImage() as HTMLCanvasElement).getContext('2d')!;
    const target = tex.getSourceImage() as HTMLCanvasElement;
    target.width = 476;
    target.height = 604;
    ctx.drawImage(bgCanvas, 0, 0);
    tex.refresh();
    this.bgImg.setDisplaySize(this.plate.w, this.plate.h);
    this.applyShadow();
    this.updateLabels();
  }

  setShowMask(on: boolean): void {
    this.showMask = on;
    this.maskImg.setVisible(on && !!this.maskPreview);
  }

  setCompare(url: string | null, alpha = 0.5, mode: 'overlay' | 'diff' = 'overlay'): void {
    this.compareAlpha = alpha;
    this.compareMode = mode;
    if (!url) {
      this.compareImg.setVisible(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const key = 'bench-compare';
      if (this.textures.exists(key)) this.textures.remove(key);
      this.textures.addImage(key, img);
      this.compareImg
        .setTexture(key)
        .setPosition(this.rect.x, this.rect.y)
        .setDisplaySize(this.rect.w, this.rect.h)
        .setAlpha(alpha)
        .setBlendMode(mode === 'diff' ? Phaser.BlendModes.DIFFERENCE : Phaser.BlendModes.NORMAL)
        .setVisible(true);
    };
    img.src = url;
  }

  /** 直接用画布做叠加层：上一版主体与当前照片同源，可精确对齐 */
  setCompareCanvas(canvas: HTMLCanvasElement | null, alpha = 0.5): void {
    this.compareAlpha = alpha;
    if (!canvas) {
      this.compareImg.setVisible(false);
      return;
    }
    this.registerTexture('bench-compare', canvas);
    this.compareImg
      .setTexture('bench-compare')
      .setPosition(this.rect.x, this.rect.y)
      .setDisplaySize(this.rect.w, this.rect.h)
      .setAlpha(alpha)
      .setBlendMode(Phaser.BlendModes.NORMAL)
      .setVisible(true);
  }

  setCompareAlpha(alpha: number): void {
    this.compareAlpha = alpha;
    this.compareImg.setAlpha(alpha);
  }

  getWorkMask(): HTMLCanvasElement | null {
    return this.workMask;
  }

  /* ---------------- 内部 ---------------- */

  private updateLabels(): void {
    const p = presetInfo(this.preset);
    const toolName = this.tool === 'restore' ? '补回枝叶' : '擦除杂物';
    const br = Math.round(this.brushSize * 100);
    this.label.setText(
      `色温 ${p.tempK}K · ${p.temp}（${p.name}）　投影 ${p.shadowDx >= 0 ? '右' : '左'}向 ${Math.round(this.shadow * 100)}%　画笔 ${toolName} ${br}`,
    );
    this.plateLabel.setText(
      this.photo ? `样苗原图 ${this.photo.width}×${this.photo.height}px　·　笔触 ${this.strokes.length} 条　·　空格切换补/擦` : '',
    );
    this.input.keyboard?.off('keydown-SPACE');
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.setTool(this.tool === 'restore' ? 'erase' : 'restore');
      this.cb.onHint(this.tool === 'restore' ? '已切换为画笔：补回被切掉的枝叶' : '已切换为橡皮：擦除背景杂物');
    });
  }

  private toPhoto(p: Phaser.Math.Vector2): [number, number] {
    return [
      Phaser.Math.Clamp((p.x - this.rect.x) / this.rect.w, 0, 1),
      Phaser.Math.Clamp((p.y - this.rect.y) / this.rect.h, 0, 1),
    ];
  }

  private inside(p: { x: number; y: number }): boolean {
    return p.x >= this.rect.x - 2 && p.x <= this.rect.x + this.rect.w + 2
      && p.y >= this.rect.y - 2 && p.y <= this.rect.y + this.rect.h + 2;
  }

  private onPointerDown(p: Phaser.Input.Pointer): void {
    if (!this.photo || !this.inside(p)) return;
    this.drawing = true;
    const stroke: BrushStroke = { mode: this.tool, size: this.brushSize, points: [this.toPhoto(p.position)] };
    this.activeStroke = stroke;
    this.strokes.push(stroke);
    this.paintSegment(stroke, null, stroke.points[0]);
    this.schedule();
  }

  private onPointerMove(p: Phaser.Input.Pointer): void {
    if (!this.photo) return;
    this.drawCursor(p);
    if (!this.drawing || !this.activeStroke) return;
    const last = this.activeStroke.points[this.activeStroke.points.length - 1];
    const next = this.toPhoto(p.position);
    if (Math.hypot(next[0] - last[0], next[1] - last[1]) < 0.0022) return;
    this.activeStroke.points.push(next);
    this.paintSegment(this.activeStroke, last, next);
    this.schedule();
  }

  private onPointerUp(): void {
    if (!this.drawing) return;
    this.drawing = false;
    this.activeStroke = null;
    this.rebuild(true);
    this.cb.onStrokes(this.strokes);
    this.brushG.clear();
    this.updateLabels();
    this.plateLabel.setText(
      this.photo ? `样苗原图 ${this.photo.width}×${this.photo.height}px　·　笔触 ${this.strokes.length} 条　·　空格切换补/擦` : '',
    );
  }

  private drawCursor(p: Phaser.Input.Pointer): void {
    if (!this.photo) return;
    const r = this.brushSize * Math.min(this.rect.w, this.rect.h);
    this.brushG.clear();
    if (!this.inside(p.position)) return;
    const color = this.tool === 'restore' ? 0x8fe0a0 : 0xff9c8a;
    this.brushG.lineStyle(1.5, color, 0.95);
    this.brushG.strokeCircle(p.x, p.y, r);
    this.brushG.fillStyle(color, 0.08);
    this.brushG.fillCircle(p.x, p.y, r);
    this.brushG.lineStyle(1, color, 0.45);
    this.brushG.beginPath();
    this.brushG.moveTo(p.x - 7, p.y);
    this.brushG.lineTo(p.x + 7, p.y);
    this.brushG.moveTo(p.x, p.y - 7);
    this.brushG.lineTo(p.x, p.y + 7);
    this.brushG.strokePath();
  }

  private paintSegment(stroke: BrushStroke, from: [number, number] | null, to: [number, number]): void {
    const layer = stroke.mode === 'restore' ? this.restoreCanvas : this.eraseCanvas;
    if (!layer) return;
    const ctx = layer.getContext('2d')!;
    const W = layer.width;
    const H = layer.height;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, stroke.size * Math.min(W, H) * 2);
    ctx.strokeStyle = stroke.mode === 'restore' ? '#ffffff' : '#ffffff';
    if (!from) {
      ctx.beginPath();
      ctx.arc(to[0] * W, to[1] * H, (ctx.lineWidth / 2) * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(from[0] * W, from[1] * H);
      ctx.lineTo(to[0] * W, to[1] * H);
      ctx.stroke();
    }
    ctx.restore();
  }

  private repaintStrokeLayers(): void {
    if (!this.restoreCanvas || !this.eraseCanvas) return;
    const rctx = this.restoreCanvas.getContext('2d')!;
    const ectx = this.eraseCanvas.getContext('2d')!;
    rctx.clearRect(0, 0, this.restoreCanvas.width, this.restoreCanvas.height);
    ectx.clearRect(0, 0, this.eraseCanvas.width, this.eraseCanvas.height);
    for (const s of this.strokes) {
      for (let i = 0; i < s.points.length; i++) {
        this.paintSegment(s, i === 0 ? null : s.points[i - 1], s.points[i]);
      }
    }
  }

  private schedule(): void {
    if (this.rafPending) {
      this.dirty = true;
      return;
    }
    this.rafPending = true;
    requestAnimationFrame(() => {
      this.rafPending = false;
      this.rebuild(false);
      if (this.dirty) {
        this.dirty = false;
        this.schedule();
      }
    });
  }

  private rebuild(withFeather: boolean): void {
    if (!this.photo || !this.baseMask || !this.workMask || !this.subjectCanvas) return;
    const W = this.workMask.width;
    const H = this.workMask.height;
    const ctx = this.workMask.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.baseMask, 0, 0, W, H);
    if (this.restoreCanvas) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(this.restoreCanvas, 0, 0);
    }
    if (this.eraseCanvas) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(this.eraseCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }

    let finalMask: HTMLCanvasElement = this.workMask;
    if (withFeather && this.feather > 0) {
      const soft = document.createElement('canvas');
      soft.width = W;
      soft.height = H;
      const sctx = soft.getContext('2d')!;
      sctx.filter = `blur(${this.feather}px)`;
      sctx.drawImage(this.workMask, 0, 0);
      finalMask = soft;
    }

    // 主体
    const sctx = this.subjectCanvas.getContext('2d')!;
    sctx.clearRect(0, 0, W, H);
    sctx.globalCompositeOperation = 'source-over';
    sctx.drawImage(this.photo, 0, 0, W, H);
    sctx.globalCompositeOperation = 'destination-in';
    sctx.drawImage(finalMask, 0, 0);
    sctx.globalCompositeOperation = 'source-over';
    this.tex('bench-subject').refresh();
    this.subjectImg.setVisible(true);

    // 蒙版预览（蓝色叠加）
    if (this.maskPreview) {
      const pctx = this.maskPreview.getContext('2d')!;
      pctx.clearRect(0, 0, W, H);
      pctx.globalCompositeOperation = 'source-over';
      pctx.fillStyle = 'rgba(96,214,255,0.95)';
      pctx.fillRect(0, 0, W, H);
      pctx.globalCompositeOperation = 'destination-in';
      pctx.drawImage(finalMask, 0, 0);
      pctx.globalCompositeOperation = 'source-over';
      this.tex('bench-mask').refresh();
      this.maskImg.setDisplaySize(this.rect.w, this.rect.h);
      this.maskImg.setAlpha(0.4);
      this.maskImg.setTint(0xffffff);
      this.maskImg.setVisible(this.showMask);
    }

    this.applyShadow(finalMask);
    this.cb.onMask(this.workMask);
    this.plateLabel.setText(
      this.photo ? `样苗原图 ${this.photo.width}×${this.photo.height}px　·　笔触 ${this.strokes.length} 条　·　空格切换补/擦` : '',
    );
  }

  private applyShadow(mask?: HTMLCanvasElement): void {
    if (!this.shadowCanvas || !this.photo) return;
    const source = mask ?? this.workMask;
    if (!source) return;
    const w = this.shadowCanvas.width;
    const h = this.shadowCanvas.height;
    const ctx = this.shadowCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);
    ctx.filter = 'blur(2.5px)';
    ctx.drawImage(source, 0, 0, w, h);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
    this.tex('bench-shadow').refresh();

    const preset = presetInfo(this.preset);
    const dx = (preset.shadowDx / 560) * this.rect.w;
    const dy = (preset.shadowDy / 760) * this.rect.h;
    this.shadowImg
      .setPosition(this.rect.x + dx, this.rect.y + dy)
      .setDisplaySize(this.rect.w, this.rect.h)
      .setAlpha(Math.min(0.72, this.shadow * 0.8))
      .setVisible(this.shadow > 0.02);
  }

  setCompareVisible(on: boolean): void {
    if (!on) this.compareImg.setVisible(false);
    else if (this.compareImg.texture.key !== 'bench-compare') this.compareImg.setVisible(false);
    else this.compareImg.setVisible(true);
  }

  setBlend(mode: 'overlay' | 'diff'): void {
    this.compareMode = mode;
    this.compareImg.setBlendMode(mode === 'diff' ? Phaser.BlendModes.DIFFERENCE : Phaser.BlendModes.NORMAL);
    this.compareImg.setAlpha(mode === 'diff' ? 1 : this.compareAlpha);
  }
}
