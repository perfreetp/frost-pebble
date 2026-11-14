import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Camera, Trash2, XCircle, Ruler, Save, MousePointerClick, Eraser } from 'lucide-react';
import { useAnnotate } from '@/ui/annotateStore';
import { useProject } from '@/ui/projectStore';
import { useViewer } from '@/ui/Viewport';
import type { ScenePick } from '@/three/sampler';
import type { Defect, CrackGeometry, Vec3 } from '@core/types';
import { DEFECT_TYPE_LABEL, SEVERITY_LEVEL_LABEL } from '@core/types';
import { measureCrack, measureVolumeDefect, makeDefectCode, crackPointAt, sideLabel, offsetLabel, placementOf } from '@core/annotation';
import { api } from '@/api';
import type { MeshSampler } from '@/three/sampler';
import { formatChainage } from '@core/math';

const REFERENCE_BEARING_AREA = 0.26;

export function AnnotateDock() {
  const viewer = useViewer().viewer;
  const bridge = useProject((s) => s.bridge);
  const componentId = useAnnotate((s) => s.componentId);
  const setComponent = useAnnotate((s) => s.setComponent);
  const tool = useAnnotate((s) => s.tool);
  const points = useAnnotate((s) => s.points);
  const addPoint = useAnnotate((s) => s.addPoint);
  const clearPoints = useAnnotate((s) => s.clearPoints);
  const measurement = useAnnotate((s) => s.measurement);
  const setMeasurement = useAnnotate((s) => s.setMeasurement);
  const widthMm = useAnnotate((s) => s.widthMm);
  const setWidth = useAnnotate((s) => s.setWidth);
  const penetrated = useAnnotate((s) => s.penetrated);
  const setPenetrated = useAnnotate((s) => s.setPenetrated);
  const depthMm = useAnnotate((s) => s.depthMm);
  const setDepth = useAnnotate((s) => s.setDepth);
  const voidRatio = useAnnotate((s) => s.voidRatio);
  const setVoidRatio = useAnnotate((s) => s.setVoidRatio);
  const justification = useAnnotate((s) => s.justification);
  const setJustification = useAnnotate((s) => s.setJustification);
  const description = useAnnotate((s) => s.description);
  const setDescription = useAnnotate((s) => s.setDescription);
  const photos = useAnnotate((s) => s.photos);
  const addPhoto = useAnnotate((s) => s.addPhoto);
  const removePhoto = useAnnotate((s) => s.removePhoto);
  const updatePhoto = useAnnotate((s) => s.updatePhoto);
  const validation = useAnnotate((s) => s.validate);
  const gradeFn = useAnnotate((s) => s.grade);
  const toast = useAnnotate((s) => s.toast);
  const setToast = useAnnotate((s) => s.setToast);
  const editingDefectId = useAnnotate((s) => s.editingDefectId);
  const seedFromDefectId = useAnnotate((s) => s.seedFromDefectId);
  const reset = useAnnotate((s) => s.reset);

  const allDefects = useProject((s) => s.defects);
  const activeInspectionId = useProject((s) => s.activeInspectionId);
  const activeDefects = useMemo(
    () => allDefects.filter((d) => d.inspectionId === activeInspectionId),
    [allDefects, activeInspectionId],
  );
  const inspections = useProject((s) => s.inspections);
  const upsertDefect = useProject((s) => s.upsertDefect);
  const selectComponent = useProject((s) => s.selectComponent);
  const setTab = useProject((s) => s.setTab);
  const showToast = useAnnotate((s) => s.setToast);

  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const component = bridge?.components.find((c) => c.id === componentId) ?? null;
  const crackGeo = measurement.crack?.geometry;
  const volumeGeo = measurement.volume?.geometry;

  // 点击两次后自动测量（points 变化触发）
  useEffect(() => {
    if (!viewer || points.length !== 2 || measurement.crack || measurement.volume) return;
    const id = componentId;
    if (!id) return;
    const sampler = viewer.getSampler(id);
    if (!sampler) return;
    const st = useAnnotate.getState();
    const project = (p: Vec3) => sampler.hit(p, 1.2);
    if (st.tool === 'crack') {
      const m = measureCrack({
        a: points[0],
        b: points[1],
        widthMm: st.widthMm,
        widthAt: st.widthAt,
        penetrated: st.penetrated,
        project,
      });
      setMeasurement({ crack: { ...m, endpointsScreen: [points[0], points[1]] } });
    } else if (st.tool === 'volume') {
      const v = measureVolumeDefect({
        a: points[0],
        b: points[1],
        depthMm: st.depthMm,
        referenceAreaM2: REFERENCE_BEARING_AREA,
      });
      setMeasurement({ volume: { geometry: v.geometry, normals: v.normals as Vec3[], preview: true } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length, viewer, componentId]);

  // 宽度变化时重新定级（走向/长度不变）
  const graded = useMemo(
    () => gradeFn(component?.type),
    [gradeFn, component?.type, widthMm, penetrated, depthMm, voidRatio, measurement],
  );
  // photos 的内容（url）变化才算变化；只依赖 length 会在上传完成前后得到同样的 memo 结果
  const photoSignature = photos.map((p) => p.url || 'pending').join('|');
  const check = useMemo(
    () => validation(component?.type),
    [validation, component?.type, widthMm, penetrated, depthMm, voidRatio, justification, photoSignature, measurement, points.length],
  );

  const placement = useMemo(() => {
    if (!bridge) return null;
    if (crackGeo) return placementOf(crackPointAt(crackGeo, 0.5), bridge.config, bridge.components);
    if (volumeGeo) return placementOf(volumeGeo.center, bridge.config, bridge.components);
    return null;
  }, [bridge, crackGeo, volumeGeo]);

  const volumeType = useAnnotate((s) => s.volumeType);
  const setVolumeType = useAnnotate((s) => s.setVolumeType);

  const defectType = useMemo(() => {
    if (tool === 'crack') return 'crack' as const;
    if (volumeType !== 'auto') return volumeType;
    return componentId?.includes('bearing') ? ('bearing_void' as const) : ('joint_seepage' as const);
  }, [tool, componentId, volumeType]);

  // 体块面积已知时，脱空率按“面积 / 支承面面积”自动给出（仍可手动改）
  const measuredArea = measurement.volume?.geometry.areaM2 ?? 0;
  useEffect(() => {
    if (defectType !== 'bearing_void' || !measuredArea) return;
    const auto = Math.min(1, measuredArea / REFERENCE_BEARING_AREA);
    if (Math.abs(auto - useAnnotate.getState().voidRatio) > 0.02) {
      useAnnotate.getState().setVoidRatio(Number(auto.toFixed(3)));
    }
  }, [measuredArea, defectType]);

  const canSave = check.ok && check.graded.severity === graded.severity;

  const uploadPhoto = async (file: File) => {
    const uid = `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    addPhoto({ uid, url: '', caption: file.name.replace(/\.[^.]+$/, ''), uploading: true });
    try {
      const res = await api.uploadPhoto(file, file.name.replace(/\.[^.]+$/, ''));
      updatePhoto(uid, { url: res.url, id: res.id, uploading: false });
    } catch (e) {
      removePhoto(uid);
      setToast({ kind: 'error', text: `照片上传失败：${(e as Error).message}` });
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) void uploadPhoto(f);
    e.target.value = '';
  };

  const save = async () => {
    if (!bridge || !component || !placement) {
      setToast({ kind: 'error', text: '请先在模型上点选构件并完成测量' });
      return;
    }
    if (!check.ok) {
      setToast({ kind: 'error', text: check.errors[0] });
      return;
    }
    setSaving(true);
    try {
      const inspectionId = activeInspectionId;
      const insp = inspections.find((i) => i.id === inspectionId);
      const existing = editingDefectId ? activeDefects.find((d) => d.id === editingDefectId) : null;
      const geometry = crackGeo ?? volumeGeo!;
      const base: Defect = {
        id: existing?.id ?? `def_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        bridgeId: bridge.config.id,
        inspectionId,
        componentId: component.id,
        type: defectType,
        code:
          existing?.code ??
          makeDefectCode(
            activeDefects,
            defectType,
            insp?.date ?? new Date().toISOString().slice(0, 10),
            component.id,
          ),
        geometry,
        chainage: placement.chainage,
        offset: placement.offset,
        elevation: placement.elevation,
        grade: check.graded.grade,
        severity: check.graded.severity,
        description: description || defaultDescription(defectType, component.name, geometry, placement),
        justification,
        photos: photos
          .filter((p) => p.url)
          .map((p) => ({ id: p.id ?? p.uid, url: p.url, caption: p.caption })),
        treatmentKey: undefined,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        createdBy: existing?.createdBy ?? insp?.inspector ?? '检测员',
        updatedAt: new Date().toISOString(),
      };
      const res = await api.saveDefect(base);
      upsertDefect(res.defect);
      setToast({
        kind: 'success',
        text: `已保存 ${res.defect.code}（${SEVERITY_LEVEL_LABEL[res.defect.severity]} · ${res.defect.grade} 级）`,
      });
      reset();
      setComponent(null);
      selectComponent(null);
    } catch (e) {
      const err = e as Error & { code?: string };
      setToast({ kind: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toolName =
    tool === 'crack' ? '裂缝标注' : tool === 'volume' ? '体块标注（脱空 / 渗水）' : tool === 'section' ? '剖切' : '选择构件';

  if (!expanded) {
    return (
      <button className="ghost" style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 4 }} onClick={() => setExpanded(true)}>
        展开标注台
      </button>
    );
  }

  return (
    <div className="dock">
      <div className="dock-head">
        <MousePointerClick size={14} color="#7fbcff" />
        <strong style={{ fontSize: 12.5 }}>{toolName}</strong>
        <span className="badge" style={{ marginLeft: 'auto' }}>
          {component ? component.name : '未选构件'}
        </span>
        <button className="ghost" style={{ padding: '0 4px', height: 20 }} onClick={() => setExpanded(false)}>
          ×
        </button>
      </div>

      <div className="dock-body">
        {tool === 'volume' && (
          <div className="row" style={{ gap: 4 }}>
            <span className="small muted" style={{ width: 56 }}>病害类型</span>
            {(['auto', 'bearing_void', 'joint_seepage'] as const).map((k) => (
              <button
                key={k}
                className={volumeType === k ? 'primary' : 'ghost'}
                style={{ fontSize: 11, padding: '2px 7px' }}
                onClick={() => setVolumeType(k)}
              >
                {k === 'auto' ? '按构件自动' : DEFECT_TYPE_LABEL[k]}
              </button>
            ))}
          </div>
        )}
        <div className="hint">
          {tool === 'crack' ? (
            <>
              点击裂缝的 <b>两个端点</b>，系统沿构件表面采样展开，给出真实长度与走向。
              {points.length === 0 && ' 第一次点击选定起点。'}
              {points.length === 1 && ' 已记录起点，请点击终点。'}
            </>
          ) : tool === 'volume' ? (
            <>
              拖出病害范围的两个角点（脱空/渗水区域），生成半透明体块。
              {points.length === 0 && ' 第一次点击选定一角。'}
              {points.length === 1 && ' 请点击对角位置。'}
            </>
          ) : (
            '点击模型中的构件进行选择。'
          )}
        </div>

        {!component && (
          <div className="gate error">未选择构件：请先点击模型上的梁体 / 墩柱 / 支座 / 桥面铺装 / 护栏。</div>
        )}
        {component && (
          <div className="row" style={{ flexWrap: 'wrap', gap: 5 }}>
            <span className="chip accent">{component.assetCode}</span>
            <span className="chip">
              {formatChainage(component.chainageStart)} – {formatChainage(component.chainageEnd)}
            </span>
            <span className="chip">{component.elevMin.toFixed(2)}–{component.elevMax.toFixed(2)} m</span>
          </div>
        )}

        {(crackGeo || volumeGeo) && placement && (
          <>
            <div className="measure">
              {crackGeo ? (
                <>
                  <div className="cell">
                    <div className="k">展开长度</div>
                    <div className="v">{(crackGeo.lengthMm / 1000).toFixed(3)} m</div>
                  </div>
                  <div className="cell">
                    <div className="k">走向 / 分类</div>
                    <div className="v" style={{ fontSize: 12 }}>
                      {crackGeo.azimuthDeg.toFixed(0)}°{' '}
                      {crackGeo.orientation === 'longitudinal' ? '纵向' : crackGeo.orientation === 'transverse' ? '横向' : '斜向'}
                    </div>
                  </div>
                  <div className="cell">
                    <div className="k">里程桩号</div>
                    <div className="v" style={{ fontSize: 12 }}>{formatChainage(placement.chainage)}</div>
                  </div>
                  <div className="cell">
                    <div className="k">横向位置</div>
                    <div className="v" style={{ fontSize: 12 }}>
                      {sideLabel(placement.offset, bridge!.config.deckWidth)}
                    </div>
                  </div>
                  <div className="cell">
                    <div className="k">偏距 / 标高</div>
                    <div className="v" style={{ fontSize: 11.5 }}>
                      {placement.offset.toFixed(2)} m / {placement.elevation.toFixed(2)} m
                    </div>
                  </div>
                  <div className="cell">
                    <div className="k">曲面采样点</div>
                    <div className="v" style={{ fontSize: 12 }}>{measurement.crack?.samples ?? 0}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="cell">
                    <div className="k">体块面积</div>
                    <div className="v">{volumeGeo!.areaM2.toFixed(3)} m²</div>
                  </div>
                  <div className="cell">
                    <div className="k">{defectType === 'bearing_void' ? '脱空率' : '影响长度'}</div>
                    <div className="v">
                      {defectType === 'bearing_void'
                        ? `${((volumeGeo!.voidRatio ?? 0) * 100).toFixed(0)}%`
                        : `${(Math.max(volumeGeo!.size[0], volumeGeo!.size[2])).toFixed(2)} m`}
                    </div>
                  </div>
                  <div className="cell">
                    <div className="k">里程桩号</div>
                    <div className="v" style={{ fontSize: 12 }}>{formatChainage(placement.chainage)}</div>
                  </div>
                  <div className="cell">
                    <div className="k">偏距 / 标高</div>
                    <div className="v" style={{ fontSize: 11.5 }}>
                      {placement.offset.toFixed(2)} / {placement.elevation.toFixed(2)} m
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="divider" />

            {crackGeo ? (
              <div className="col" style={{ gap: 8 }}>
                <div className="row">
                  <div className="field" style={{ flex: 1 }}>
                    <label>实测最大宽度 (mm)</label>
                    <input
                      type="number"
                      step={0.01}
                      min={0.01}
                      value={widthMm}
                      onChange={(e) => setWidth(Number(e.target.value))}
                    />
                  </div>
                  <div className="field" style={{ width: 116 }}>
                    <label>宽度位置</label>
                    <select
                      value={useAnnotate.getState().widthAt}
                      onChange={(e) => useAnnotate.getState().setWidthAt(Number(e.target.value))}
                    >
                      <option value={0.25}>1/4 处</option>
                      <option value={0.5}>跨中</option>
                      <option value={0.75}>3/4 处</option>
                      <option value={0}>起点</option>
                      <option value={1}>终点</option>
                    </select>
                  </div>
                </div>
                <div className="row">
                  <label className="row small" style={{ gap: 5 }}>
                    <input type="checkbox" checked={penetrated} onChange={(e) => setPenetrated(e.target.checked)} />
                    贯通裂缝
                  </label>
                  <div className="row" style={{ marginLeft: 'auto' }}>
                    <span className={`sev-dot ${graded.severity}`} />
                    <span className="small" style={{ color: graded.severity === 'critical' ? '#ffb3b6' : graded.severity === 'warning' ? '#ffd98a' : '#9fd6b2' }}>
                      {SEVERITY_LEVEL_LABEL[graded.severity]} · {graded.grade} 级
                    </span>
                  </div>
                </div>
                <div className="small muted">{graded.thresholdLabel}</div>
              </div>
            ) : (
              <div className="col" style={{ gap: 8 }}>
                <div className="row">
                  <div className="field" style={{ flex: 1 }}>
                    <label>{defectType === 'bearing_void' ? '脱空深度 (mm)' : '渗水深度 (mm)'}</label>
                    <input type="number" step={0.1} min={0} value={depthMm} onChange={(e) => setDepth(Number(e.target.value))} />
                  </div>
                  {defectType === 'bearing_void' && (
                    <div className="field" style={{ flex: 1 }}>
                      <label>脱空率 (%) · 支承面 {REFERENCE_BEARING_AREA.toFixed(2)} m²</label>
                      <input
                        type="number"
                        step={1}
                        min={0}
                        max={100}
                        value={Math.round(voidRatio * 100)}
                        onChange={(e) => setVoidRatio(Math.max(0, Math.min(1, Number(e.target.value)) / 100))}
                      />
                    </div>
                  )}
                </div>
                <div className="row">
                  <span className={`sev-dot ${graded.severity}`} />
                  <span className="small">{SEVERITY_LEVEL_LABEL[graded.severity]} · {graded.grade} 级</span>
                  <span className="small muted" style={{ marginLeft: 'auto' }}>{graded.thresholdLabel}</span>
                </div>
              </div>
            )}

            <ul className="small muted" style={{ margin: 0, paddingLeft: 16 }}>
              {graded.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>

            {graded.requiresPhotos && (
              <div className={`gate ${check.ok ? 'ok' : 'error'}`}>
                {check.ok ? (
                  <span className="row" style={{ gap: 5 }}>
                    <CheckCircle2 size={13} /> 严重级资料齐全，可保存
                  </span>
                ) : (
                  <>
                    <div className="row" style={{ gap: 5, fontWeight: 600 }}>
                      <AlertTriangle size={13} /> 严重级（{graded.grade} 级）必须补齐以下资料
                    </div>
                    <ul className="err-list">
                      {check.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            <div className="field">
              <label>
                判定依据 <span style={{ color: graded.requiresJustification ? '#ffb3b6' : 'inherit' }}>{graded.requiresJustification ? '（必填）' : ''}</span>
              </label>
              <textarea
                value={justification}
                placeholder="引用规范条款 + 实测值 + 所在受力部位，例如：宽度 0.34 mm 超 0.3 mm 限值，位于跨中受拉区，按 JTG/T H21-2011 判 4 级"
                onChange={(e) => setJustification(e.target.value)}
                style={{ minHeight: 58 }}
              />
            </div>

            <div className="field">
              <label>病害描述（可选，留空自动生成）</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="自动生成" />
            </div>

            <div className="field">
              <label>
                特写照片{' '}
                {graded.requiresPhotos && (
                  <span style={{ color: photos.filter((p) => p.url).length ? '#9fd6b2' : '#ffb3b6' }}>
                    （严重级至少 1 张）
                  </span>
                )}
              </label>
              <div className="photo-grid">
                {photos.map((p) => (
                  <div className="photo-item" key={p.uid}>
                    {p.url ? <img src={p.url} alt={p.caption} /> : <div style={{ height: 68, display: 'grid', placeItems: 'center', fontSize: 10 }}>上传中…</div>}
                    <div className="cap">{p.caption || '未命名'}</div>
                    <button className="del" onClick={() => removePhoto(p.uid)} title="删除">
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                <div className="photo-add" onClick={() => fileRef.current?.click()}>
                  <span className="row" style={{ gap: 5 }}>
                    <Camera size={13} /> 添加照片
                  </span>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFileChange} />
            </div>

            {check.warnings.length > 0 && check.ok && (
              <div className="gate">
                {check.warnings.map((w, i) => (
                  <div key={i}>· {w}</div>
                ))}
              </div>
            )}

            <div className="row" style={{ gap: 6 }}>
              <button className="primary" style={{ flex: 1 }} onClick={save} disabled={saving || !check.ok}>
                <span className="row" style={{ gap: 5, justifyContent: 'center' }}>
                  <Save size={13} /> {saving ? '保存中…' : editingDefectId ? '更新病害' : '保存病害'}
                </span>
              </button>
              <button onClick={() => { clearPoints(); reset(); }} title="清空本次标注">
                <Eraser size={13} />
              </button>
            </div>
            {!check.ok && (
              <div className="small" style={{ color: '#ffb3b6' }}>
                {check.errors[0]}
              </div>
            )}
          </>
        )}

        {points.length > 0 && !crackGeo && !volumeGeo && (
          <div className="row">
            <span className="small muted">已记录 1 个点</span>
            <button className="ghost small" onClick={clearPoints} style={{ marginLeft: 'auto' }}>
              撤销
            </button>
          </div>
        )}

        {toast && (
          <div className={`gate ${toast.kind === 'error' ? 'error' : toast.kind === 'success' ? 'ok' : ''}`}>
            {toast.text}
          </div>
        )}

        {seedFromDefectId && (
          <div className="small muted">已从上期病害沿用位置：本次将作为同一病害线的新观测记录。</div>
        )}
      </div>
    </div>
  );
}

function defaultDescription(
  type: Defect['type'],
  compName: string,
  g: Defect['geometry'],
  placement: { chainage: number; offset: number },
): string {
  const where = `${compName}，桩号 ${formatChainage(placement.chainage)}，${offsetLabel(placement.offset, 12)}`;
  if (g.kind === 'crack') {
    const ori = g.orientation === 'longitudinal' ? '纵向' : g.orientation === 'transverse' ? '横向' : '斜向';
    return `${where}，${ori}裂缝，展开长度 ${(g.lengthMm / 1000).toFixed(2)} m，最大宽度 ${g.widthMm.toFixed(2)} mm${g.penetrated ? '，贯通' : ''}。`;
  }
  if (type === 'bearing_void') {
    return `${where}，支座脱空，脱空面积 ${g.areaM2.toFixed(2)} m²，最大深度 ${g.depthMm.toFixed(1)} mm。`;
  }
  return `${where}，铰缝渗水，影响范围 ${g.areaM2.toFixed(2)} m²，渗水深度 ${g.depthMm.toFixed(0)} mm。`;
}
