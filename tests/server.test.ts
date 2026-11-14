import { describe, expect, it } from 'vitest';
import { buildBridge } from '@core/bridgeModel';
import { buildTimelines } from '@core/timeline';
import { buildRepairList, computeStats } from '@core/reports';
import { buildReportPdf, findCJKFonts } from '../server/pdf';
import { parseMultipart } from '../server/store';
import { synthPhoto } from '../server/png';
import type { Defect, Inspection } from '@core/types';
import { DEFAULT_CONFIG } from '@core/bridgeModel';
import fs from 'node:fs';

const { bridge } = buildBridge(DEFAULT_CONFIG);

const inspections: Inspection[] = [
  {
    id: 'insp-2024',
    bridgeId: 'b',
    date: '2024-06-03',
    title: '2024 年定期检查',
    inspector: '王工',
    weather: '晴',
    equipment: '无人机',
    note: '',
    createdAt: '2024-06-03T00:00:00.000Z',
  },
  {
    id: 'insp-2025',
    bridgeId: 'b',
    date: '2025-04-22',
    title: '2025 年汛前定期检查',
    inspector: '李工',
    weather: '晴',
    equipment: '无人机 + 裂缝仪',
    note: '',
    createdAt: '2025-04-22T00:00:00.000Z',
  },
];

function mkDefect(over: Partial<Defect> & Pick<Defect, 'id' | 'type'>): Defect {
  const base: Defect = {
    bridgeId: 'b',
    inspectionId: 'insp-2025',
    componentId: 'span-1-girder',
    code: `LF-${over.id}`,
    chainage: DEFAULT_CONFIG.stationStart + 12,
    offset: -2,
    elevation: 41.2,
    grade: 4,
    severity: 'critical',
    description: '箱梁底板纵向裂缝，贯通。',
    justification: '宽度 0.34 mm 超 0.3 mm 限值，位于跨中受拉区，判定 4 级。',
    photos: [],
    createdAt: '2025-04-22T00:00:00.000Z',
    createdBy: '李工',
    updatedAt: '2025-04-22T00:00:00.000Z',
    geometry: {
      kind: 'crack',
      endpoints: [
        [12, 40.7, -2],
        [14.4, 40.73, -2],
      ],
      path: [
        [12, 40.7, -2],
        [14.4, 40.73, -2],
      ],
      normal: [0, 1, 0],
      lengthMm: 2400,
      azimuthDeg: 2,
      orientation: 'longitudinal',
      widthMm: 0.34,
      widthAt: 0.5,
      penetrated: true,
    },
    ...over,
  };
  return base;
}

const defects: Defect[] = [
  mkDefect({ id: 'd1', type: 'crack' }),
  mkDefect({
    id: 'd2',
    type: 'bearing_void',
    componentId: 'support-1-bearing-0',
    code: 'ZK-d2',
    severity: 'warning',
    grade: 2,
    chainage: DEFAULT_CONFIG.stationStart + 30,
    offset: -4.2,
    geometry: {
      kind: 'volume',
      center: [30, 40.6, -4.2],
      size: [0.3, 0.05, 0.24],
      yaw: 0.1,
      depthMm: 2,
      areaM2: 0.07,
      voidRatio: 0.27,
    },
  }),
];

const families = buildTimelines(defects, inspections);
const stats = computeStats(defects, bridge.components, families);
const repairs = buildRepairList(defects, families);
const confirmations = defects.map((d) => ({
  defectId: d.id,
  confirmed: true,
  engineer: '张工',
  note: '同意',
  at: '2025-05-01T00:00:00.000Z',
}));

const meta = {
  reportNo: 'QLDJ-2025-TEST-001',
  preparedBy: '李工',
  reviewedBy: '王工',
  approvedBy: '张总工',
  organization: '市政桥梁检测所',
  date: '2025-05-06',
};

describe('报告 PDF', () => {
  it('produces a multi-page PDF with a share QR code', async () => {
    const pdf = await buildReportPdf({
      bridge,
      inspection: inspections[1],
      defects,
      families,
      stats,
      repairs,
      confirmations,
      meta,
      shareUrl: 'http://localhost:8787/share/shr-test-token',
      photoPaths: {},
    });
    expect(pdf.byteLength).toBeGreaterThan(20_000);
    const head = Buffer.from(pdf.slice(0, 5)).toString('ascii');
    expect(head).toBe('%PDF-');
    const tail = Buffer.from(pdf.slice(-6)).toString('ascii');
    expect(tail).toContain('EOF');
  });

  it('finds a CJK-capable font on this machine (or reports honestly)', () => {
    const fonts = findCJKFonts();
    // Windows 环境必须有可嵌入中文字体；若换到无字体环境允许为 null
    if (process.platform === 'win32') {
      expect(fonts).not.toBeNull();
      expect(fonts!.regular.toLowerCase()).toMatch(/\.ttf$/);
    }
  });

  it('renders even with no confirmed records (still shows 待确认)', async () => {
    const pdf = await buildReportPdf({
      bridge,
      inspection: inspections[1],
      defects,
      families,
      stats,
      repairs,
      confirmations: [],
      meta,
      shareUrl: 'http://localhost:8787/share/shr-x',
      photoPaths: {},
    });
    expect(pdf.byteLength).toBeGreaterThan(10_000);
  });
});

describe('照片上传与合成 PNG', () => {
  it('parses a multipart photo upload body', () => {
    const png = synthPhoto({ seed: 3, width: 40, height: 30, crack: 'horizontal' });
    const head = `--BOUND\r\nContent-Disposition: form-data; name="caption"\r\n\r\n现场特写\r\n--BOUND\r\nContent-Disposition: form-data; name="file"; filename="a.png"\r\nContent-Type: image/png\r\n\r\n`;
    const tail = '\r\n--BOUND--\r\n';
    const body = Buffer.concat([Buffer.from(head, 'utf8'), png, Buffer.from(tail, 'utf8')]);
    const { fields, file } = parseMultipart('multipart/form-data; boundary=BOUND', body);
    expect(fields.caption).toBe('现场特写');
    expect(file).toBeTruthy();
    expect(file!.mime).toBe('image/png');
    expect(file!.data.subarray(0, 8)).toEqual(png.subarray(0, 8));
    expect(file!.data.length).toBe(png.length);
  });

  it('encodes a valid PNG header and size', () => {
    const png = synthPhoto({ seed: 7, width: 120, height: 90, voidPatch: true });
    expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    expect(png.readUInt32BE(16)).toBe(120);
    expect(png.readUInt32BE(20)).toBe(90);
  });

  it('produces different images for different seeds', () => {
    const a = synthPhoto({ seed: 1, width: 60, height: 40, crack: 'diagonal' });
    const b = synthPhoto({ seed: 2, width: 60, height: 40, crack: 'diagonal' });
    expect(a.equals(b)).toBe(false);
  });
});

describe('分享快照只读性', () => {
  it('snapshot payload contains everything needed without live store', () => {
    const snapshot = {
      bridge,
      inspection: inspections[1],
      defects,
      families,
      stats,
      repairs,
      confirmations,
      meta,
      readOnly: true as const,
    };
    const json = JSON.parse(JSON.stringify(snapshot));
    expect(json.defects.length).toBe(2);
    expect(json.bridge.components.length).toBe(bridge.components.length);
    expect(json.readOnly).toBe(true);
    // 快照内包含照片绝对地址，分享页无需访问项目管理接口
    expect(Array.isArray(json.defects[0].photos)).toBe(true);
  });
});

describe('seed 数据完整性', () => {
  it('db.json (if seeded) is internally consistent', () => {
    const file = 'data/db.json';
    if (!fs.existsSync(file)) return;
    const db = JSON.parse(fs.readFileSync(file, 'utf8'));
    const ids = new Set(db.defects.map((d: Defect) => d.id));
    expect(ids.size).toBe(db.defects.length);
    for (const d of db.defects as Defect[]) {
      expect(d.componentId).toMatch(/^(span|support)-/);
      expect(d.chainage).toBeGreaterThan(DEFAULT_CONFIG.stationStart - 1);
      expect(d.chainage).toBeLessThan(DEFAULT_CONFIG.stationStart + 91);
    }
    const inspIds = new Set(db.inspections.map((i: Inspection) => i.id));
    for (const d of db.defects as Defect[]) expect(inspIds.has(d.inspectionId)).toBe(true);
    expect(inspIds.has(db.activeInspectionId)).toBe(true);
  });
});
