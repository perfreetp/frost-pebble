import React, { useRef, useState } from 'react';
import { UploadCloud, Boxes, Grid3x3, Check, FileText, Wifi, Cpu } from 'lucide-react';
import { useProject } from '@/ui/projectStore';
import { api } from '@/api';
import type { BridgeConfig } from '@core/types';

interface Source {
  id: string;
  name: string;
  kind: 'las' | 'ply' | 'obj' | 'glb' | 'tileset';
  size: string;
  points?: string;
  status: 'idle' | 'parsing' | 'slicing' | 'done' | 'error';
  progress: number;
  message?: string;
  result?: { components: number; triangles: number; crs: string };
}

const DEMO_SOURCES: Source[] = [
  {
    id: 'src-las',
    name: 'qingshui-river-2025-registered.las',
    kind: 'las',
    size: '1.84 GB',
    points: '214,806,332',
    status: 'done',
    progress: 100,
    result: { components: 24, triangles: 412_800, crs: 'CGCS2000 / 3-degree GK CM 114E' },
    message: '点云已配准，按桩号切片完成',
  },
  {
    id: 'src-obj',
    name: 'oblique-photo-textured.obj',
    kind: 'obj',
    size: '612 MB',
    status: 'done',
    progress: 100,
    result: { components: 24, triangles: 388_206, crs: '与点云同一工程坐标系' },
    message: '倾斜摄影模型导入，纹理已压缩为 WebP',
  },
  {
    id: 'src-tiles',
    name: 'bridge-3dtiles/tileset.json',
    kind: 'tileset',
    size: '共享链接',
    status: 'idle',
    progress: 0,
  },
];

export function ImportView() {
  const bridge = useProject((s) => s.bridge);
  const setTab = useProject((s) => s.setTab);
  const [sources, setSources] = useState<Source[]>(DEMO_SOURCES);
  const [hot, setHot] = useState(false);
  const [cfg, setCfg] = useState<BridgeConfig | null>(bridge?.config ?? null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const beginParse = (name: string) => {
    const id = `src-${Date.now()}`;
    const kind = name.endsWith('.las') || name.endsWith('.laz') ? 'las' : name.endsWith('.ply') ? 'ply' : name.endsWith('.glb') ? 'glb' : 'tileset';
    const src: Source = {
      id,
      name,
      kind: kind as Source['kind'],
      size: '本地文件',
      status: 'parsing',
      progress: 0,
    };
    setSources((s) => [src, ...s]);
    let p = 0;
    const timer = setInterval(() => {
      p += 7 + Math.random() * 9;
      setSources((s) =>
        s.map((x) =>
          x.id === id
            ? {
                ...x,
                progress: Math.min(100, p),
                status: p < 55 ? 'parsing' : p < 92 ? 'slicing' : 'done',
                message: p < 55 ? '解析点云 / 网格…' : p < 92 ? '按跨径切分构件…' : '切片完成（演示：沿用已配准模型）',
                result:
                  p >= 92
                    ? { components: bridge?.components.length ?? 24, triangles: 412_800, crs: '按工程坐标系对齐' }
                    : undefined,
              }
            : x,
        ),
      );
      if (p >= 100) clearInterval(timer);
    }, 260);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setHot(false);
    const f = e.dataTransfer.files?.[0];
    if (f) beginParse(f.name);
  };

  const saveConfig = async () => {
    if (!cfg) return;
    setSaving(true);
    try {
      const spans = cfg.spans.filter((s) => s > 0);
      if (!spans.length) throw new Error('至少需要一跨');
      await api.saveBridge({ ...cfg, spans });
      useProject.getState().load();
      setTab('tree');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="import-wrap">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 19 }}>模型导入</h1>
          <div className="small muted" style={{ marginTop: 3 }}>
            点云（LAS/LAZ）、倾斜摄影（OBJ/PLY/GLB）或 3D Tiles，导入后按跨径自动切出梁体、墩柱、支座、桥面铺装、护栏
          </div>
        </div>
        <button className="primary" onClick={() => setTab('tree')}>
          进入构件树
        </button>
      </div>

      <div
        className={`dropzone ${hot ? 'hot' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setHot(true);
        }}
        onDragLeave={() => setHot(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{ cursor: 'pointer' }}
      >
        <UploadCloud size={26} color="#6fa8ff" />
        <div style={{ marginTop: 6, fontWeight: 600 }}>把点云或倾斜摄影文件拖到这里，或点击选择</div>
        <div className="small muted" style={{ marginTop: 4 }}>
          支持 .las / .laz / .ply / .obj / .glb / .json(tileset)　·　自动识别坐标系与里程方向
        </div>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept=".las,.laz,.ply,.obj,.glb,.json"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) beginParse(f.name);
            e.target.value = '';
          }}
        />
      </div>

      <div className="import-cards">
        {sources.map((s) => (
          <div className="import-card" key={s.id}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {s.kind === 'tileset' ? <Wifi size={14} /> : <Boxes size={14} />}
                <span className="mono" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 190, whiteSpace: 'nowrap' }}>
                  {s.name}
                </span>
              </h4>
              {s.status === 'done' && <Check size={14} color="#3fb27f" />}
            </div>
            <div className="small muted" style={{ marginBottom: 6 }}>
              {s.size}
              {s.points ? ` · ${s.points} 点` : ''}
            </div>
            {s.status !== 'idle' && (
              <>
                <div className="progress" style={{ marginBottom: 6 }}>
                  <i style={{ width: `${s.progress}%`, background: s.status === 'done' ? '#3fb27f' : undefined }} />
                </div>
                <div className="small" style={{ color: s.status === 'done' ? '#9fd6b2' : '#a9b7c6' }}>
                  {s.message ?? '等待解析'}
                </div>
                {s.result && (
                  <div className="small muted" style={{ marginTop: 6, lineHeight: 1.7 }}>
                    <div>构件 {s.result.components} 个</div>
                    <div>三角面片 {s.result.triangles.toLocaleString('en-US')}</div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>坐标系 {s.result.crs}</div>
                  </div>
                )}
              </>
            )}
            {s.status === 'idle' && (
              <button className="small" onClick={() => beginParse(s.name)}>
                连接
              </button>
            )}
          </div>
        ))}
      </div>

      {cfg && (
        <div className="card" style={{ marginTop: 18 }}>
          <h2>
            <Grid3x3 size={15} color="#7fbcff" /> 桥梁参数与构件切片
          </h2>
          <div className="grid2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="field">
              <label>桥梁名称</label>
              <input type="text" value={cfg.name} onChange={(e) => setCfg({ ...cfg, name: e.target.value })} />
            </div>
            <div className="field">
              <label>结构类型</label>
              <input type="text" value={cfg.structureType} onChange={(e) => setCfg({ ...cfg, structureType: e.target.value })} />
            </div>
            <div className="field">
              <label>起点桩号 (m，K1+250 = 1250)</label>
              <input type="number" value={cfg.stationStart} onChange={(e) => setCfg({ ...cfg, stationStart: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>跨径组合（米，逗号分隔）</label>
              <input
                type="text"
                value={cfg.spans.join(', ')}
                onChange={(e) =>
                  setCfg({
                    ...cfg,
                    spans: e.target.value
                      .split(/[,，\s]+/)
                      .map(Number)
                      .filter((n) => Number.isFinite(n) && n > 0),
                  })
                }
              />
            </div>
            <div className="field">
              <label>桥面全宽 (m)</label>
              <input type="number" step={0.1} value={cfg.deckWidth} onChange={(e) => setCfg({ ...cfg, deckWidth: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>梁高 (m)</label>
              <input type="number" step={0.05} value={cfg.girderDepth} onChange={(e) => setCfg({ ...cfg, girderDepth: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>墩高 (m)</label>
              <input type="number" step={0.1} value={cfg.pierHeight} onChange={(e) => setCfg({ ...cfg, pierHeight: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>桥面设计标高 (m)</label>
              <input type="number" step={0.1} value={cfg.elevationStart} onChange={(e) => setCfg({ ...cfg, elevationStart: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>纵坡 (%)</label>
              <input type="number" step={0.1} value={cfg.gradePercent} onChange={(e) => setCfg({ ...cfg, gradePercent: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>护栏高度 (m)</label>
              <input type="number" step={0.05} value={cfg.railingHeight} onChange={(e) => setCfg({ ...cfg, railingHeight: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>铺装厚度 (m)</label>
              <input type="number" step={0.01} value={cfg.deckThickness} onChange={(e) => setCfg({ ...cfg, deckThickness: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>支座构造高度 (m)</label>
              <input type="number" step={0.01} value={cfg.bearingHeight} onChange={(e) => setCfg({ ...cfg, bearingHeight: Number(e.target.value) })} />
            </div>
          </div>
          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <button className="primary" onClick={saveConfig} disabled={saving}>
              {saving ? '保存中…' : '保存并重新切分构件'}
            </button>
            <span className="small muted">
              切分规则：按跨径生成梁体/铺装/护栏，按墩台生成墩柱与支座，并为每件挂编号（如 QL-GL-02-01）与里程桩号
            </span>
          </div>
        </div>
      )}

      <div className="card">
        <h2>
          <Cpu size={15} color="#7fbcff" /> 渲染性能
        </h2>
        <div className="small muted" style={{ lineHeight: 1.8 }}>
          当前模型约 {(bridge?.components.reduce((s, c) => s + 1, 0) ?? 0)} 个构件；展示用网格为程序化几何，
          导入高密度点云时按构件建立 BVH，缩放仅重投影、不重建缓冲；剖切只对相交构件生成封口，实测交互帧率见视口左下角读数。
        </div>
      </div>
    </div>
  );
}
