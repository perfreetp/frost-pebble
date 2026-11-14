import { useState } from 'react';
import { useStore, selectActiveDesign } from '../store/useStore';
import { STATUS_LABEL, type DesignStatus } from '../types';
import { ReviewDialog } from './ReviewDialog';
import { VersionDiffDialog } from './VersionDiffDialog';
import {
  buildChargeCsv, buildChargeTableHtml, buildDelayCsv,
  buildDelayTableHtml, buildDesignReportHtml, downloadCsv, openPrintWindow,
} from '../lib/reports';

const STATUS_CLASS: Record<DesignStatus, string> = {
  draft: 'st-draft', submitted: 'st-submitted', approved: 'st-approved',
  rejected: 'st-rejected', archived: 'st-archived',
};

export function TopBar({ onGoArchive }: { onGoArchive: () => void }) {
  const design = useStore(selectActiveDesign);
  const submitReview = useStore((s) => s.submitReview);
  const approve = useStore((s) => s.approve);
  const reject = useStore((s) => s.reject);
  const archive = useStore((s) => s.archive);
  const saveAsNewVersion = useStore((s) => s.saveAsNewVersion);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);

  if (!design) {
    return (
      <header className="topbar">
        <div className="brand">⛏ 矿山爆破设计 · 炮孔布置与档案管理系统</div>
        <button className="btn" onClick={onGoArchive}>档案管理</button>
      </header>
    );
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${design.name}_V${design.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="topbar">
      <div className="brand">⛏ {design.name} <span className="ver-tag">V{design.version}</span></div>
      <span className={`status-tag ${STATUS_CLASS[design.status]}`}>{STATUS_LABEL[design.status]}</span>
      {design.rejectReason && (
        <span className="reject-chip" title={design.rejectReason}>驳回原因：{design.rejectReason}</span>
      )}
      <div className="topbar-actions">
        <button className="btn" onClick={onGoArchive}>档案管理</button>
        <button className="btn" onClick={() => openPrintWindow(buildChargeTableHtml(design))}>单孔装药表</button>
        <button className="btn" onClick={() => openPrintWindow(buildDelayTableHtml(design))}>雷管段位表</button>
        <button className="btn" onClick={() => openPrintWindow(buildDesignReportHtml(design))}>设计报告</button>
        <button className="btn" onClick={() => downloadCsv(`${design.name}_装药表.csv`, buildChargeCsv(design))}>装药CSV</button>
        <button className="btn" onClick={() => downloadCsv(`${design.name}_雷管段位.csv`, buildDelayCsv(design))}>段位CSV</button>
        <button className="btn" onClick={exportJson}>导出JSON</button>
        <button className="btn" onClick={() => setDiffOpen(true)}>版本对比</button>
        <button className="btn" onClick={() => saveAsNewVersion()}>另存新版本</button>
        {design.status === 'draft' || design.status === 'rejected' ? (
          <button className="btn primary" onClick={() => setReviewOpen(true)}>提交审核</button>
        ) : null}
        {design.status === 'submitted' && (
          <>
            <button className="btn success" onClick={() => approve('李矿长', '审核通过')}>审核通过</button>
            <button className="btn danger" onClick={() => setReviewOpen(true)}>驳回</button>
          </>
        )}
        <button
          className={`btn ${design.status === 'approved' ? 'primary' : 'disabled-btn'}`}
          disabled={design.status !== 'approved'}
          title={design.status !== 'approved' ? '仅审核通过的设计可归档' : '定稿归档'}
          onClick={archive}
        >
          定稿归档
        </button>
      </div>
      {reviewOpen && (
        <ReviewDialog
          mode={design.status === 'submitted' ? 'reject' : 'submit'}
          onClose={() => setReviewOpen(false)}
          onSubmit={(reviewer, comment) => {
            if (design.status === 'submitted') reject(reviewer, comment);
            else submitReview(reviewer, comment);
            setReviewOpen(false);
          }}
        />
      )}
      {diffOpen && <VersionDiffDialog onClose={() => setDiffOpen(false)} />}
    </header>
  );
}
