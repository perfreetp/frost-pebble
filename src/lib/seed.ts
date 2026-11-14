import { autoCutout } from './cutout';
import { compositeMask } from './mask-engine';
import type { BrushStroke } from './types';
import { composeFromSources } from './compose';
import { drawSamplePhoto } from './sample';
import type {
  Batch, ComposeSettings, Inspection, Measurement, Photo, Version,
} from './types';
import { OPERATOR } from './types';
import { evaluateMeasurements } from './store-eval';

const DAY = 86400000;
const today = new Date('2026-11-14T09:00:00+08:00');

function iso(daysAgo: number, hour = 9, minute = 0): string {
  const d = new Date(today.getTime() - daysAgo * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

interface SeedBatch {
  batch: Batch;
  photos: (Photo & { spec: Parameters<typeof drawSamplePhoto>[0] })[];
  sample?: Measurement[];
  notes?: string;
  versions?: number;
}

const fault = (no: number, d: number, h: number): Measurement => ({ no, diameterCm: d, heightCm: h });

function mkBatch(p: Partial<Batch> & Pick<Batch, 'code' | 'variety' | 'cultivar'>): Batch {
  return {
    id: `seed-${p.code}`,
    code: p.code,
    variety: p.variety,
    cultivar: p.cultivar,
    ageYears: p.ageYears ?? 2,
    diameterMin: p.diameterMin ?? 0.8,
    diameterMax: p.diameterMax ?? 1.4,
    heightMin: p.heightMin ?? 60,
    heightMax: p.heightMax ?? 100,
    quantity: p.quantity ?? 800,
    block: p.block ?? '东区 3 号床',
    createdAt: p.createdAt ?? iso(20),
    createdBy: OPERATOR.technician,
    note: p.note ?? '',
    status: p.status ?? 'draft',
    archivedAt: p.archivedAt,
    dispatchMonth: p.dispatchMonth,
  };
}

export function seedData(settings: ComposeSettings): {
  batches: Batch[];
  photos: Photo[];
  versions: Version[];
  inspections: Inspection[];
  activeBatchId: string | null;
  activePhotoId: string | null;
  settings: ComposeSettings;
} {
  const defs: SeedBatch[] = [
    {
      batch: mkBatch({
        code: 'MC-2026-紫薇-018',
        variety: '紫薇',
        cultivar: '速生紫薇',
        ageYears: 3,
        diameterMin: 1.2,
        diameterMax: 2.0,
        heightMin: 90,
        heightMax: 140,
        quantity: 460,
        block: '南区 7 号床',
        createdAt: iso(14, 8, 20),
        status: 'archived',
        archivedAt: iso(5, 16, 10),
        dispatchMonth: '2026-11',
      }),
      photos: [
        {
          id: 'seed-photo-zw-a',
          batchId: 'seed-MC-2026-紫薇-018',
          name: 'A 号样苗',
          dataUrl: '',
          width: 560,
          height: 760,
          createdAt: iso(13, 9, 5),
          sampleNote: '东侧第 4 行',
          spec: { seed: 11, bg: 'soil', leaf: 'broad', clutter: true, heightRatio: 1 },
        },
      ],
      sample: [fault(1, 1.6, 118), fault(2, 1.5, 112), fault(3, 1.7, 124), fault(4, 1.55, 116), fault(5, 1.62, 121)],
      notes: '五株样苗地径、苗高均在区间内，树冠完整，无病虫害。',
      versions: 2,
    },
    {
      batch: mkBatch({
        code: 'MC-2026-女贞-021',
        variety: '女贞',
        cultivar: '金叶女贞',
        ageYears: 2,
        diameterMin: 0.6,
        diameterMax: 1.1,
        heightMin: 45,
        heightMax: 75,
        quantity: 1200,
        block: '西区 2 号床',
        createdAt: iso(10, 10, 0),
        status: 'failed',
        note: '第 2 株地径偏细，需复检。',
      }),
      photos: [
        {
          id: 'seed-photo-nz-a',
          batchId: 'seed-MC-2026-女贞-021',
          name: 'A 号样苗',
          dataUrl: '',
          width: 560,
          height: 760,
          createdAt: iso(9, 11, 30),
          spec: { seed: 27, bg: 'wall', leaf: 'broad', clutter: false, heightRatio: 0.95 },
        },
      ],
      sample: [fault(1, 0.78, 61), fault(2, 0.51, 58), fault(3, 0.82, 63), fault(4, 0.74, 66), fault(5, 0.69, 60)],
      notes: '2 号样苗地径 0.51 cm 低于下限 0.6 cm；抽检达标率 80%，未达 90% 阈值，不出圃。',
      versions: 1,
    },
    {
      batch: mkBatch({
        code: 'MC-2026-鸡爪槭-025',
        variety: '鸡爪槭',
        cultivar: '红枫',
        ageYears: 4,
        diameterMin: 1.5,
        diameterMax: 2.6,
        heightMin: 110,
        heightMax: 170,
        quantity: 320,
        block: '北区 5 号床',
        createdAt: iso(8, 14, 10),
        status: 'ready',
      }),
      photos: [
        {
          id: 'seed-photo-jzm-a',
          batchId: 'seed-MC-2026-鸡爪槭-025',
          name: 'A 号样苗',
          dataUrl: '',
          width: 560,
          height: 760,
          createdAt: iso(7, 9, 40),
          spec: { seed: 42, bg: 'net', leaf: 'maple', clutter: true, heightRatio: 1.05 },
        },
        {
          id: 'seed-photo-jzm-b',
          batchId: 'seed-MC-2026-鸡爪槭-025',
          name: 'B 号样苗',
          dataUrl: '',
          width: 560,
          height: 760,
          createdAt: iso(7, 9, 52),
          spec: { seed: 63, bg: 'bench', leaf: 'maple', clutter: false, heightRatio: 0.9 },
        },
      ],
      sample: [fault(1, 1.9, 132), fault(2, 2.1, 146), fault(3, 2.3, 151), fault(4, 1.8, 128), fault(5, 2.0, 139)],
      notes: '五株样苗地径 1.8–2.3 cm、苗高 128–151 cm，均在出圃区间内；主干通直。',
      versions: 2,
    },
    {
      batch: mkBatch({
        code: 'MC-2026-银杏-030',
        variety: '银杏',
        cultivar: '实生苗',
        ageYears: 3,
        diameterMin: 1.0,
        diameterMax: 1.8,
        heightMin: 80,
        heightMax: 130,
        quantity: 600,
        block: '东区 9 号床',
        createdAt: iso(3, 8, 0),
        status: 'ready',
      }),
      photos: [
        {
          id: 'seed-photo-yx-a',
          batchId: 'seed-MC-2026-银杏-030',
          name: 'A 号样苗',
          dataUrl: '',
          width: 560,
          height: 760,
          createdAt: iso(2, 15, 20),
          spec: { seed: 71, bg: 'white', leaf: 'ginkgo', clutter: false, heightRatio: 1.1 },
        },
      ],
    },
    {
      batch: mkBatch({
        code: 'MC-2026-桂花-033',
        variety: '桂花',
        cultivar: '金桂',
        ageYears: 5,
        diameterMin: 1.8,
        diameterMax: 3.0,
        heightMin: 130,
        heightMax: 200,
        quantity: 150,
        block: '中区 1 号床',
        createdAt: iso(1, 7, 30),
        status: 'draft',
      }),
      photos: [],
    },
  ];

  const batches: Batch[] = [];
  const photos: Photo[] = [];
  const versions: Version[] = [];
  const inspections: Inspection[] = [];

  for (const def of defs) {
    batches.push(def.batch);
    for (const ph of def.photos) {
      const drawn = drawSamplePhoto(ph.spec);
      const photo: Photo = { ...ph };
      delete (photo as unknown as Record<string, unknown>).spec;
      photo.dataUrl = drawn.dataUrl;
      photos.push(photo);
      (photo as unknown as Record<string, unknown>).__canvas = drawn.canvas;
    }
  }

  // 演示版本：用真实加工管线生成，保证打开即有可比对的成品
  const versionSources: { batch: Batch; photo: Photo; canvas: HTMLCanvasElement; count: number }[] = [];
  for (const def of defs) {
    if (!def.versions) continue;
    const photo = photos.find((p) => p.id === def.photos[0].id);
    if (!photo) continue;
    const canvas = (photo as unknown as Record<string, HTMLCanvasElement>).__canvas;
    versionSources.push({ batch: def.batch, photo, canvas, count: def.versions });
  }

  for (const src of versionSources) {
    const baseMask = autoCutout(src.canvas, { tolerance: 46, softness: 16, minArea: 14, feather: 0 });
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = baseMask.width;
    maskCanvas.height = baseMask.height;
    const mctx = maskCanvas.getContext('2d')!;
    mctx.filter = 'blur(1.1px)';
    mctx.drawImage(baseMask, 0, 0);
    const maskUrl = maskCanvas.toDataURL('image/png');

    for (let v = 1; v <= src.count; v++) {
      const presetId = v === 1 ? 'studio' : 'field';
      // 从第二版开始演示「擦除背景杂物」：花盆与石块被橡皮擦掉
      const strokes: BrushStroke[] = v === 1 ? [] : [
        // 花盆：按盆体与盆沿分两笔擦净
        { mode: 'erase', size: 0.055, points: [[0.07, 0.785], [0.14, 0.775], [0.21, 0.785]] },
        { mode: 'erase', size: 0.06, points: [[0.085, 0.8], [0.085, 0.845], [0.1, 0.868], [0.14, 0.876], [0.18, 0.868], [0.195, 0.845], [0.195, 0.8]] },
        // 石块
        { mode: 'erase', size: 0.05, points: [[0.79, 0.898], [0.86, 0.89], [0.93, 0.9]] },
        // 掉落的枝条
        { mode: 'erase', size: 0.028, points: [[0.74, 0.938], [0.84, 0.922], [0.95, 0.93]] },
      ];
      const appliedMask = compositeMask(maskCanvas, strokes, 0);
      const set: ComposeSettings = {
        ...settings,
        background: presetId as ComposeSettings['background'],
        shadow: v === 1 ? 0.5 : 0.42,
        measuredHeightCm: Math.round((src.batch.heightMin + src.batch.heightMax) / 2),
        measuredDiameterMm: Math.round(((src.batch.diameterMin + src.batch.diameterMax) / 2) * 10),
      };
      const res = composeFromSources(
        { source: src.canvas, width: src.canvas.width, height: src.canvas.height },
        appliedMask,
        set, {
        batch: src.batch,
        versionNo: v,
        photoName: src.photo.name,
        sampleNote: src.photo.sampleNote,
        savedAt: iso(src.count === 2 ? 6 - v : 4, 10 + v, 5),
        savedBy: OPERATOR.technician,
        heightCm: set.measuredHeightCm,
        diameterMm: set.measuredDiameterMm,
        feather: set.feather,
        shadow: set.shadow,
      });
      versions.push({
        id: `seed-ver-${src.batch.id}-${v}`,
        batchId: src.batch.id,
        photoId: src.photo.id,
        no: v,
        createdAt: iso(src.count === 2 ? 6 - v : 4, 10 + v, 5),
        specUrl: res.specUrl,
        inspectUrl: res.inspectUrl,
        thumbUrl: res.thumbUrl,
        settings: set,
        strokes,
        note: v === 1 ? '标准棚拍首版，用于规格图' : '换清晨圃地背景，擦除花盆石块',
        savedBy: OPERATOR.technician,
      });
    }
  }

  for (const def of defs) {
    if (!def.sample) continue;
    const threshold = 90;
    const result = evaluateMeasurements(def.batch, def.sample, threshold);
    inspections.push({
      id: `seed-insp-${def.batch.id}`,
      batchId: def.batch.id,
      inspector: OPERATOR.inspector,
      sampledAt: iso(def.batch.status === 'archived' ? 5 : 2, 14, 30),
      sampleSize: def.sample.length,
      threshold,
      passCount: result.passCount,
      passRate: result.passRate,
      verdict: result.verdict,
      reasons: result.reasons,
      notes: def.notes ?? '',
      measurements: def.sample,
    });
  }

  // 清理临时挂载的画布引用
  for (const p of photos) delete (p as unknown as Record<string, unknown>).__canvas;

  return {
    batches,
    photos,
    versions,
    inspections,
    activeBatchId: batches[2]?.id ?? batches[0]?.id ?? null,
    activePhotoId: photos.find((p) => p.batchId === (batches[2]?.id ?? ''))?.id ?? null,
    settings,
  };
}
