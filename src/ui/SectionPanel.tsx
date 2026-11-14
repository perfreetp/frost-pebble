import React from 'react';
import { Scissors, RotateCcw, Tag } from 'lucide-react';
import { useProject } from '@/ui/projectStore';
import { useViewer } from '@/ui/Viewport';

const AXES: { key: 'x' | 'y' | 'z'; label: string; hint: string }[] = [
  { key: 'z', label: '纵剖 Z', hint: '沿里程方向剖开，观察箱梁内部' },
  { key: 'x', label: '横剖 X', hint: '垂直于里程剖切，看断面' },
  { key: 'y', label: '水平剖 Y', hint: '水平剖开桥面' },
];

export function SectionPanel() {
  const bridge = useProject((s) => s.bridge);
  const section = useProject((s) => s.section);
  const setSection = useProject((s) => s.setSection);
  const clipEnabled = useProject((s) => s.clipEnabled);
  const setClip = useProject((s) => s.setClip);
  const readout = useProject((s) => s.sectionReadout);
  const viewer = useViewer().viewer;

  if (!bridge) return null;

  const range =
    section.axis === 'x'
      ? { min: -2, max: bridge.length + 2, step: 0.1 }
      : section.axis === 'y'
        ? { min: 0, max: 52, step: 0.1 }
        : { min: -bridge.config.deckWidth / 2 - 1, max: bridge.config.deckWidth / 2 + 1, step: 0.05 };

  return (
    <div className="section-panel">
      <div className="dock-head" style={{ borderBottom: 'none' }}>
        <Scissors size={14} color="#7fbcff" />
        <strong style={{ fontSize: 12.5 }}>剖切查看</strong>
        <label className="row small muted" style={{ marginLeft: 'auto', gap: 4 }}>
          <input
            type="checkbox"
            checked={clipEnabled}
            onChange={(e) => {
              if (!e.target.checked) setClip(false);
              else setSection({ enabled: true });
            }}
          />
          启用
        </label>
      </div>
      <div style={{ padding: '0 12px 10px' }} className="col">
        <div className="row" style={{ gap: 4 }}>
          {AXES.map((a) => (
            <button
              key={a.key}
              className={section.axis === a.key ? 'primary' : ''}
              style={{ flex: 1, padding: '4px 0', fontSize: 11 }}
              title={a.hint}
              onClick={() => {
                // 切轴时把剖切位置放到该轴的可见结构中部，否则会落在空处
                const pos =
                  a.key === 'x'
                    ? bridge.length / 2
                    : a.key === 'y'
                      ? (bridge.components.find((c) => c.type === 'pier')?.elevMax ?? 40) - 4
                      : 0;
                // 纵剖/横剖默认翻转成“看朝向相机的一侧”，水平剖默认保留下半部分
                setSection({ axis: a.key, pos, flip: a.key !== 'y', enabled: true });
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="field">
          <label className="row" style={{ justifyContent: 'space-between' }}>
            <span>剖切位置</span>
            <span className="mono" style={{ color: '#a8ccff' }}>
              {section.axis === 'x'
                ? `K${Math.floor((bridge.config.stationStart + section.pos) / 1000)}+${((bridge.config.stationStart + section.pos) % 1000).toFixed(1).padStart(5, '0')}`
                : section.axis === 'y'
                  ? `${section.pos.toFixed(2)} m 标高`
                  : `${section.pos.toFixed(2)} m 偏距`}
            </span>
          </label>
          <input
            type="range"
            min={range.min}
            max={range.max}
            step={range.step}
            value={section.pos}
            onChange={(e) => setSection({ pos: Number(e.target.value), enabled: true })}
          />
        </div>
        <div className="row" style={{ gap: 4 }}>
          <button
            style={{ flex: 1, fontSize: 11 }}
            onClick={() => setSection({ flip: !section.flip })}
            title="切换保留侧"
          >
            <RotateCcw size={11} /> 翻转保留侧
          </button>
          <button
            style={{ flex: 1, fontSize: 11 }}
            className={section.showLabels ? 'primary' : ''}
            onClick={() => setSection({ showLabels: !section.showLabels })}
          >
            <Tag size={11} /> 截面标注
          </button>
        </div>
        <div className="row small muted" style={{ gap: 4 }}>
          <button className="ghost small" onClick={() => {
            // 沿桥长自动巡览剖切
            if (!viewer) return;
            const start = performance.now();
            const from = range.min;
            const to = range.max;
            const dur = 5200;
            const step = () => {
              const t = (performance.now() - start) / dur;
              if (t > 1) return;
              const p = from + (to - from) * (0.5 - 0.5 * Math.cos(t * Math.PI * 2));
              setSection({ pos: Number(p.toFixed(2)), enabled: true });
              requestAnimationFrame(step);
            };
            step();
          }}>
            自动巡览剖切
          </button>
        </div>
      </div>
      {clipEnabled && readout && (
        <div className="readout">
          <div className="readout-row">
            <span className="k" style={{ color: 'var(--ink-3)' }}>截面标高</span>
            <span className="e">{readout.elevation.toFixed(2)} m</span>
          </div>
          <div className="readout-row">
            <span className="k" style={{ color: 'var(--ink-3)' }}>桩号</span>
            <span className="e">
              K{Math.floor(readout.chainage / 1000)}+{(readout.chainage % 1000).toFixed(1).padStart(5, '0')}
            </span>
          </div>
          <div className="small muted" style={{ marginTop: 2 }}>与剖切面相交的构件：</div>
          {readout.components.map((name) => (
            <div className="readout-row" key={name}>
              <span className="n">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
