import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Bridge, Confirmation, Defect, Inspection, ReportMeta } from '../src/core/types';
import { DEFAULT_CONFIG } from '../src/core/bridgeModel';

export interface ProjectState {
  bridgeConfig: typeof DEFAULT_CONFIG;
  inspections: Inspection[];
  activeInspectionId: string;
  defects: Defect[];
  confirmations: Confirmation[];
  reportMeta: Omit<ReportMeta, 'date'> & { date: string };
  updatedAt: string;
}

export interface ShareRecord {
  token: string;
  createdAt: string;
  snapshot: unknown;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const SHARE_DIR = path.join(DATA_DIR, 'shares');
const REPORT_DIR = path.join(DATA_DIR, 'reports');

export const paths = { DATA_DIR, DB_FILE, UPLOAD_DIR, SHARE_DIR, REPORT_DIR };

export function ensureDirs() {
  for (const d of [DATA_DIR, UPLOAD_DIR, SHARE_DIR, REPORT_DIR]) {
    fs.mkdirSync(d, { recursive: true });
  }
}

export function newId(prefix = 'id'): string {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

function atomicWrite(file: string, data: string) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, data, 'utf8');
  fs.renameSync(tmp, file);
}

export function saveState(state: ProjectState) {
  ensureDirs();
  atomicWrite(DB_FILE, JSON.stringify(state, null, 2));
}

export function loadState(): ProjectState | null {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw) as ProjectState;
  } catch {
    return null;
  }
}

export function saveShare(rec: ShareRecord) {
  ensureDirs();
  atomicWrite(path.join(SHARE_DIR, `${rec.token}.json`), JSON.stringify(rec, null, 2));
}

export function loadShare(token: string): ShareRecord | null {
  // 防目录穿越：token 只允许字母数字和短横线
  if (!/^[a-zA-Z0-9-]{6,64}$/.test(token)) return null;
  const file = path.join(SHARE_DIR, `${token}.json`);
  if (!file.startsWith(SHARE_DIR)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as ShareRecord;
  } catch {
    return null;
  }
}

export function listShares(): { token: string; createdAt: string; bridgeName: string; total: number }[] {
  ensureDirs();
  const out: { token: string; createdAt: string; bridgeName: string; total: number }[] = [];
  for (const f of fs.readdirSync(SHARE_DIR)) {
    if (!f.endsWith('.json')) continue;
    try {
      const rec = JSON.parse(fs.readFileSync(path.join(SHARE_DIR, f), 'utf8')) as ShareRecord;
      const snap = rec.snapshot as { bridge?: Bridge; defects?: Defect[] };
      out.push({
        token: rec.token,
        createdAt: rec.createdAt,
        bridgeName: snap?.bridge?.config?.name ?? '—',
        total: snap?.defects?.length ?? 0,
      });
    } catch {
      /* ignore corrupt */
    }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** 多部分照片上传：只接受图片，限制 8 MB，文件名不可控 */
export const UPLOAD_LIMIT = 8 * 1024 * 1024;

export function saveUpload(name: string, mime: string, buf: Buffer): { id: string; url: string } {
  ensureDirs();
  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  if (!allowed.includes(mime)) throw new Error(`不支持的文件类型：${mime}`);
  if (buf.length > UPLOAD_LIMIT) throw new Error('照片超过 8 MB 限制');
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : mime === 'image/gif' ? 'gif' : 'jpg';
  const id = newId('ph');
  const file = `${id}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, file), buf);
  return { id, url: `/uploads/${file}` };
}

/** 极简 multipart 解析（避免额外依赖，单文件即可） */
export function parseMultipart(
  contentType: string,
  body: Buffer,
): { fields: Record<string, string>; file?: { name: string; mime: string; data: Buffer } } {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  if (!m) throw new Error('缺少 multipart boundary');
  const boundary = Buffer.from(`--${(m[1] || m[2]).trim()}`);
  const fields: Record<string, string> = {};
  let file: { name: string; mime: string; data: Buffer } | undefined;

  let idx = body.indexOf(boundary);
  while (idx !== -1) {
    const start = idx + boundary.length;
    if (body.slice(start, start + 2).toString() === '--') break;
    const headerEnd = body.indexOf('\r\n\r\n', start);
    if (headerEnd === -1) break;
    const header = body.slice(start, headerEnd).toString('utf8');
    const next = body.indexOf(boundary, headerEnd);
    if (next === -1) break;
    const data = body.slice(headerEnd + 4, next - 2 >= headerEnd + 4 ? next - 2 : next);
    const nameMatch = /name="([^"]+)"/i.exec(header);
    const fileMatch = /filename="([^"]*)"/i.exec(header);
    const typeMatch = /Content-Type:\s*([^\r\n]+)/i.exec(header);
    if (fileMatch) {
      file = { name: path.basename(fileMatch[1] || 'photo'), mime: (typeMatch?.[1] || 'application/octet-stream').trim(), data };
    } else if (nameMatch) {
      fields[nameMatch[1]] = data.toString('utf8');
    }
    idx = next;
  }
  return { fields, file };
}

export function readStateOrFail(): ProjectState {
  const s = loadState();
  if (!s) throw new Error('项目数据未初始化');
  return s;
}
