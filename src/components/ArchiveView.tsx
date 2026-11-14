import { useMemo, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { STATUS_LABEL, type BlastDesign, type DesignStatus, type MiningArea } from '../types';
import { computeStats } from '../lib/diff';

interface Filters {
  areaId: string;
  designer: string;
  status: DesignStatus | '';
  dateFrom: string;
  dateTo: string;
  keyword: string;
}

const EMPTY_FILTERS: Filters = { areaId: '', designer: '', status: '', dateFrom: '', dateTo: '', keyword: '' };

export function ArchiveView({ onBack }: { onBack: () => void }) {
  const areas = useStore((s) => s.areas);
  const designs = useStore((s) => s.designs);
  const openDesign = useStore((s) => s.openDesign);
  const createArea = useStore((s) => s.createArea);
  const createDesign = useStore((s) => s.createDesign);
  const loadSample = useStore((s) => s.loadSample);
  const importDesign = useStore((s) => s.importDesign);
  const resetAll = useStore((s) => s.resetAll);
  const fileRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [showDesignForm, setShowDesignForm] = useState(false);
  const [areaForm, setAreaForm] = useState({ code: '', name: '', location: '', designer: '' });
  const [designForm, setDesignForm] = useState({ areaId: '', name: '' });

  const designers = useMemo(
    () => [...new Set(designs.map((d) => d.designer))],
    [designs],
  );

  const filtered = useMemo(() => {
    return designs
      .filter((d) => {
        if (filters.areaId && d.areaId !== filters.areaId) return false;
        if (filters.designer && d.designer !== filters.designer) return false;
        if (filters.status && d.status !== filters.status) return false;
        if (filters.keyword && !`${d.name} V${d.version}`.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
        const day = new Date(d.updatedAt).toISOString().slice(0, 10);
        if (filters.dateFrom && day < filters.dateFrom) return false;
        if (filters.dateTo && day > filters.dateTo) return false;
        return true;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [designs, filters]);

  const areaName = (id: string) => areas.find((a) => a.id === id)?.name ?? '（采区已删除）';
  const areaCode = (id: string) => areas.find((a) => a.id === id)?.code ?? '—';

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text) as { design: BlastDesign; area: MiningArea } | BlastDesign;
      // 兼容两种导出：完整设计对象，或 {area, design} 包
      if ('benchPolygon' in json) {
        const area = areas.find((a) => a.id === json.areaId);
        if (!area) {
          alert('该设计所属采区不存在，请先导入采区档案。');
          return;
        }
        importDesign(json, area);
      } else {
        importDesign(json.design, json.area);
      }
      alert('导入成功');
    } catch (err) {
      alert(`导入失败：${(err as Error).message}`);
    }
  };

  return (
    <div className="archive-view">
      <div className="archive-head">
        <button className="btn" onClick={onBack}>← 返回图纸</button>
        <h2>采区档案与设计检索</h2>
        <div className="archive-actions">
          <button className="btn primary" onClick={() => setShowAreaForm((v) => !v)}>采区建档</button>
          <button className="btn primary" onClick={() => setShowDesignForm((v) => !v)} disabled={areas.length === 0}>
            新建设计
          </button>
          <button className="btn" onClick={loadSample}>载入示例采区（8000+孔）</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>导入 JSON</button>
          <input
            ref={fileRef} type="file" accept="application/json,.json" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ''; }}
          />
          <button className="btn danger" onClick={() => { if (confirm('确认清空全部本地档案？')) resetAll(); }}>
            清空数据
          </button>
        </div>
      </div>

      {showAreaForm && (
        <div className="inline-form">
          <h4>采区建档编号</h4>
          <div className="form-grid">
            <label>采区编号
              <input placeholder="如 CQ-2026-018" value={areaForm.code}
                onChange={(e) => setAreaForm({ ...areaForm, code: e.target.value })} />
            </label>
            <label>采区名称
              <input value={areaForm.name} onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })} />
            </label>
            <label>位置
              <input value={areaForm.location} onChange={(e) => setAreaForm({ ...areaForm, location: e.target.value })} />
            </label>
            <label>设计员
              <input value={areaForm.designer} onChange={(e) => setAreaForm({ ...areaForm, designer: e.target.value })} />
            </label>
          </div>
          <button
            className="btn primary"
            disabled={!areaForm.code || !areaForm.name}
            onClick={() => {
              createArea(areaForm);
              setAreaForm({ code: '', name: '', location: '', designer: '' });
              setShowAreaForm(false);
            }}
          >保存采区</button>
        </div>
      )}

      {showDesignForm && (
        <div className="inline-form">
          <h4>新建爆破设计（基于台阶平面模板生成，建档后在图上布设炮孔）</h4>
          <div className="form-grid">
            <label>所属采区
              <select value={designForm.areaId} onChange={(e) => setDesignForm({ ...designForm, areaId: e.target.value })}>
                <option value="">请选择</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.code} {a.name}</option>)}
              </select>
            </label>
            <label>设计名称
              <input value={designForm.name} onChange={(e) => setDesignForm({ ...designForm, name: e.target.value })} />
            </label>
          </div>
          <button
            className="btn primary"
            disabled={!designForm.areaId || !designForm.name}
            onClick={() => {
              const id = createDesign(designForm.areaId, designForm.name);
              setShowDesignForm(false);
              openDesign(id);
              onBack();
            }}
          >创建并打开</button>
        </div>
      )}

      <div className="filter-bar">
        <label>采区
          <select value={filters.areaId} onChange={(e) => setFilters({ ...filters, areaId: e.target.value })}>
            <option value="">全部</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.code} {a.name}</option>)}
          </select>
        </label>
        <label>设计员
          <select value={filters.designer} onChange={(e) => setFilters({ ...filters, designer: e.target.value })}>
            <option value="">全部</option>
            {designers.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label>状态
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as DesignStatus | '' })}>
            <option value="">全部</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>起始日期
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
        </label>
        <label>截止日期
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
        </label>
        <label>关键字
          <input placeholder="设计名称" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
        </label>
        <button className="btn" onClick={() => setFilters(EMPTY_FILTERS)}>重置</button>
        <span className="filter-count">命中 {filtered.length} / {designs.length} 份</span>
      </div>

      <div className="table-wrap">
        <table className="archive-table">
          <thead>
            <tr>
              <th>采区编号</th><th>采区</th><th>设计名称</th><th>版本</th><th>设计员</th>
              <th>孔数(有效/跳过)</th><th>总装药(kg)</th><th>平均孔深(m)</th><th>状态</th>
              <th>更新时间</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const s = computeStats(d);
              return (
                <tr key={d.id} className={d.status === 'rejected' ? 'row-bad' : ''}>
                  <td>{areaCode(d.areaId)}</td>
                  <td>{areaName(d.areaId)}</td>
                  <td>{d.name}</td>
                  <td>V{d.version}</td>
                  <td>{d.designer}</td>
                  <td>{s.totalHoles}（{s.effectiveHoles}/{s.skippedHoles}）</td>
                  <td>{s.totalCharge}</td>
                  <td>{s.avgDepth}</td>
                  <td><span className={`status-tag st-${d.status}`}>{STATUS_LABEL[d.status]}</span></td>
                  <td>{new Date(d.updatedAt).toLocaleString('zh-CN')}</td>
                  <td>
                    <button className="btn small" onClick={() => { openDesign(d.id); onBack(); }}>打开</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="muted center">没有符合条件的档案</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
