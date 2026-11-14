import { useMemo, useState } from 'react';
import { useStore, selectActiveDesign } from '../store/useStore';
import { diffDesigns } from '../lib/diff';

export function VersionDiffDialog({ onClose }: { onClose: () => void }) {
  const design = useStore(selectActiveDesign)!;
  const designs = useStore((s) => s.designs);
  // 同采区、同名图纸的历史版本
  const siblings = useMemo(
    () => designs
      .filter((d) => d.areaId === design.areaId && d.name === design.name && d.id !== design.id)
      .sort((a, b) => b.version - a.version),
    [designs, design],
  );
  const [compareId, setCompareId] = useState(siblings[0]?.id ?? '');
  const other = siblings.find((d) => d.id === compareId);
  const diff = other ? diffDesigns(other, design) : null;

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <h3>版本对比</h3>
        <div className="diff-head">
          <span>当前版本：<b>V{design.version}（{design.status}）</b></span>
          <label>对比版本：
            <select value={compareId} onChange={(e) => setCompareId(e.target.value)}>
              {siblings.length === 0 && <option value="">无历史版本</option>}
              {siblings.map((d) => (
                <option key={d.id} value={d.id}>V{d.version}（{d.status}）</option>
              ))}
            </select>
          </label>
        </div>

        {!diff && <p className="muted">没有可对比的历史版本。请先使用「另存新版本」生成新版本。</p>}

        {diff && (
          <>
            <p className="hint-text">
              孔位变化：新增 {diff.addedHoles} 个，移除 {diff.removedHoles} 个；
              超出允许偏差的指标以<span className="err-text">红色</span>标出。
            </p>
            <table className="diff-table">
              <thead>
                <tr>
                  <th>指标</th><th>V{diff.oldVersion}</th><th>V{diff.newVersion}</th>
                  <th>差值</th><th>允许偏差</th><th>判定</th>
                </tr>
              </thead>
              <tbody>
                {diff.metrics.map((m) => (
                  <tr key={m.key} className={m.outOfTolerance ? 'row-bad' : ''}>
                    <td>{m.label}</td>
                    <td>{m.oldValue} {m.unit}</td>
                    <td>{m.newValue} {m.unit}</td>
                    <td className={m.outOfTolerance ? 'err-text' : ''}>
                      {m.delta > 0 ? '+' : ''}{m.delta} {m.unit}
                    </td>
                    <td>±{m.tolerance} {m.unit}</td>
                    <td>{m.outOfTolerance ? <b className="err-text">超差</b> : <b className="ok-text">合格</b>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <div className="modal-actions">
          <button className="btn primary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}
