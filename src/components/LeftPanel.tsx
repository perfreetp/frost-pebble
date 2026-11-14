import { useStore, selectActiveDesign, type ToolMode } from '../store/useStore';
import { computeStats } from '../lib/diff';

const TOOLS: { id: ToolMode; label: string; icon: string }[] = [
  { id: 'select', label: '选择/查看', icon: '▣' },
  { id: 'single', label: '单孔', icon: '◉' },
  { id: 'row', label: '排孔', icon: '◈' },
  { id: 'array', label: '整排阵列', icon: '▦' },
];

export function LeftPanel() {
  const design = useStore(selectActiveDesign);
  const tool = useStore((s) => s.tool);
  const setTool = useStore((s) => s.setTool);
  const draft = useStore((s) => s.draft);
  const setDraft = useStore((s) => s.setDraft);
  const toggleLayer = useStore((s) => s.toggleLayer);
  const updateChargeParams = useStore((s) => s.updateChargeParams);
  const renderMode = useStore((s) => s.renderMode);
  const setRenderMode = useStore((s) => s.setRenderMode);

  if (!design) return <aside className="panel left-panel"><p className="muted">无活动设计</p></aside>;
  const stats = computeStats(design);
  const readOnly = design.status === 'archived';

  return (
    <aside className="panel left-panel">
      <section>
        <h3>布设工具</h3>
        <div className="tool-grid">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`tool-btn ${tool === t.id ? 'active' : ''}`}
              onClick={() => setTool(t.id)}
              disabled={readOnly}
              title={readOnly ? '已归档版本为只读' : t.label}
            >
              <span className="tool-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        {readOnly && <p className="warn-text">归档版本只读，需「另存新版本」后才能修改</p>}
      </section>

      {tool !== 'select' && (
        <section>
          <h3>布设参数</h3>
          <div className="form-grid">
            {tool === 'array' && (
              <label>排数
                <input type="number" min={1} max={500} value={draft.rows}
                  onChange={(e) => setDraft({ rows: Number(e.target.value) })} />
              </label>
            )}
            {(tool === 'row' || tool === 'array') && (
              <label>每排孔数
                <input type="number" min={1} max={500} value={draft.holesPerRow}
                  onChange={(e) => setDraft({ holesPerRow: Number(e.target.value) })} />
              </label>
            )}
            {(tool === 'row' || tool === 'array') && (
              <label>孔间距 (m)
                <input type="number" step={0.1} min={0.5} value={draft.spacing}
                  onChange={(e) => setDraft({ spacing: Number(e.target.value) })} />
              </label>
            )}
            {tool === 'array' && (
              <label>排距 (m)
                <input type="number" step={0.1} min={0.5} value={draft.burden}
                  onChange={(e) => setDraft({ burden: Number(e.target.value) })} />
              </label>
            )}
            {(tool === 'row' || tool === 'array') && (
              <label>方向角 (°)
                <input type="number" step={5} value={draft.angleDeg}
                  onChange={(e) => setDraft({ angleDeg: Number(e.target.value) })} />
              </label>
            )}
          </div>
          <p className="hint-text">默认间距与排距均为 1.2m；落点碰到边坡线、空区或管线时自动避开并在孔表注明原因。</p>
        </section>
      )}

      <section>
        <h3>图层开关</h3>
        <div className="layer-list">
          {design.layerStates.map((l) => (
            <label key={l.id} className="layer-item">
              <input type="checkbox" checked={l.visible} onChange={() => toggleLayer(l.id)} />
              <span>{l.name}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3>渲染后端</h3>
        <div className="seg-control">
          <button className={renderMode === 'webgpu' ? 'active' : ''}
            onClick={() => setRenderMode('webgpu')}>WebGPU</button>
          <button className={renderMode === 'canvas2d' ? 'active' : ''}
            onClick={() => setRenderMode('canvas2d')}>Canvas2D</button>
        </div>
        <p className="hint-text">WebGPU 下单次 draw call 实例化渲染全部孔点，视口外孔位在着色器阶段裁剪；浏览器不支持时自动回退。</p>
      </section>

      <section>
        <h3>装药参数（改动全量重算）</h3>
        <div className="form-grid">
          <label>孔径 (mm)
            <input type="number" value={design.chargeParams.diameter} disabled={readOnly}
              onChange={(e) => updateChargeParams({ diameter: Number(e.target.value) })} />
          </label>
          <label>设计孔深 (m)
            <input type="number" step={0.5} value={design.chargeParams.defaultDepth} disabled={readOnly}
              onChange={(e) => updateChargeParams({ defaultDepth: Number(e.target.value) })} />
          </label>
          <label>超深 (m)
            <input type="number" step={0.1} value={design.chargeParams.subdrill} disabled={readOnly}
              onChange={(e) => updateChargeParams({ subdrill: Number(e.target.value) })} />
          </label>
          <label>堵塞 (m)
            <input type="number" step={0.1} value={design.chargeParams.stemming} disabled={readOnly}
              onChange={(e) => updateChargeParams({ stemming: Number(e.target.value) })} />
          </label>
          <label>单位装药 (kg/m)
            <input type="number" step={0.1} value={design.chargeParams.chargePerMeter} disabled={readOnly}
              onChange={(e) => updateChargeParams({ chargePerMeter: Number(e.target.value) })} />
          </label>
          <label>倾角 (°)
            <input type="number" value={design.chargeParams.inclination} disabled={readOnly}
              onChange={(e) => updateChargeParams({ inclination: Number(e.target.value) })} />
          </label>
        </div>
      </section>

      <section className="stats-box">
        <h3>实时统计</h3>
        <div className="stat-row"><span>设计孔位</span><b>{stats.totalHoles}</b></div>
        <div className="stat-row"><span>有效孔</span><b className="ok-text">{stats.effectiveHoles}</b></div>
        <div className="stat-row"><span>避让跳过</span><b className="err-text">{stats.skippedHoles}</b></div>
        <div className="stat-row"><span>总装药量</span><b>{stats.totalCharge} kg</b></div>
        <div className="stat-row"><span>平均孔深</span><b>{stats.avgDepth} m</b></div>
        <div className="stat-row"><span>总进尺</span><b>{stats.totalMeters} m</b></div>
      </section>
    </aside>
  );
}
