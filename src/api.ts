import type {
  Bridge,
  ComponentInfo,
  Confirmation,
  Defect,
  Inspection,
  ReportMeta,
  ReportStats,
  RepairItem,
} from '@core/types';
import type { DefectFamily, TimelineSummary } from '@core/timeline';
import type { RepairRow } from '@core/reports';

export interface ProjectResponse {
  bridgeConfig: Bridge['config'];
  bridge: Bridge;
  inspections: Inspection[];
  activeInspectionId: string;
  defects: Defect[];
  confirmations: Confirmation[];
  reportMeta: ReportMeta;
  updatedAt: string;
}

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: any = null;
    try {
      body = await res.json();
    } catch {
      /* 非 JSON 错误体 */
    }
    const err = new Error(body?.error ?? `请求失败（${res.status}）`) as Error & {
      status?: number;
      code?: string;
      payload?: unknown;
    };
    err.status = res.status;
    err.code = body?.code;
    err.payload = body;
    throw err;
  }
  return res.json() as Promise<T>;
}

export const api = {
  project: () => fetch('/api/project').then((r) => j<ProjectResponse>(r)),
  saveBridge: (bridgeConfig: Bridge['config']) =>
    fetch('/api/project/bridge', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bridgeConfig }),
    }).then((r) => j<{ bridge: Bridge }>(r)),
  inspections: () => fetch('/api/inspections').then((r) => j<{ inspections: Inspection[]; activeInspectionId: string }>(r)),
  createInspection: (body: Partial<Inspection>) =>
    fetch('/api/inspections', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => j<Inspection>(r)),
  activateInspection: (id: string) =>
    fetch(`/api/inspections/${id}/activate`, { method: 'POST' }).then((r) => j<{ activeInspectionId: string }>(r)),
  saveDefect: (defect: Defect) =>
    fetch('/api/defects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(defect),
    }).then((r) => j<{ ok: true; defect: Defect }>(r)),
  deleteDefect: (id: string) => fetch(`/api/defects/${id}`, { method: 'DELETE' }).then((r) => j<{ ok: true }>(r)),
  uploadPhoto: async (file: File, caption: string) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('caption', caption);
    const res = await fetch('/api/photos', { method: 'POST', body: fd });
    return j<{ id: string; url: string; caption: string }>(res);
  },
  confirm: (defectId: string, confirmed: boolean, engineer: string, note: string) =>
    fetch('/api/confirmations', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ defectId, confirmed, engineer, note }),
    }).then((r) => j<Confirmation>(r)),
  reportPreview: () => fetch('/api/report/preview').then((r) =>
    j<{
      bridge: Bridge;
      inspection: Inspection;
      defects: Defect[];
      families: DefectFamily[];
      stats: ReportStats;
      repairs: RepairRow[];
      confirmations: Confirmation[];
      meta: ReportMeta;
    }>(r)),
  exportPdf: async () => {
    const res = await fetch('/api/report/pdf');
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const err = new Error(body.error ?? '导出失败') as Error & { code?: string; pending?: unknown };
      err.code = body.code;
      err.pending = body.pending;
      throw err;
    }
    const blob = await res.blob();
    const shareUrl = res.headers.get('X-Share-Url') ?? '';
    return { blob, shareUrl };
  },
  share: (token: string) =>
    fetch(`/api/share/${token}`).then((r) =>
      j<{
        token: string;
        createdAt: string;
        snapshot: {
          bridge: Bridge;
          inspection: Inspection;
          defects: Defect[];
          families: DefectFamily[];
          stats: ReportStats;
          repairs: RepairRow[];
          confirmations: Confirmation[];
          meta: ReportMeta;
          readOnly: true;
        };
      }>(r)),
};

export type { ComponentInfo, Defect, Inspection, RepairItem, DefectFamily, TimelineSummary };
