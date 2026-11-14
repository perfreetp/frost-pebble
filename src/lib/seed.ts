import type {
  GenParams,
  GlyphRecord,
  GlyphSkeleton,
  GlyphVersion,
  ReviewComment,
  StrokeState,
} from './types';
import { DEFAULT_PARAMS, generateGlyph, composeGlyph, renderStroke } from './generator';
import { getSkeleton } from './skeletons';
import type { Ring } from './geometry';

export const LIBRARIES = ['点画宋', '玄墨黑', '朱记手楷'] as const;

export const WEIGHTS = [
  { name: '细体 300', value: 300, width: 56 },
  { name: '常规 400', value: 400, width: 84 },
  { name: '中黑 500', value: 500, width: 108 },
  { name: '粗黑 700', value: 700, width: 138 },
];

export function weightNameFor(value: number): string {
  let best = WEIGHTS[0];
  for (const w of WEIGHTS) if (Math.abs(w.value - value) < Math.abs(best.value - value)) best = w;
  return best.name;
}

export function widthForWeight(value: number): number {
  return WEIGHTS.reduce((b, w) => (Math.abs(w.value - value) < Math.abs(b.value - value) ? w : b)).width;
}

const pad = (n: number, w = 3) => String(n).padStart(w, '0');

export function makeRecordId(seq: number, dateIso: string): string {
  const d = new Date(dateIso);
  return `GF-${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1, 2)}-${pad(seq, 4)}`;
}

function makeVersion(
  char: string,
  id: number,
  createdAt: string,
  params: GenParams,
  strokes: StrokeState[],
  note: string,
  author = '设计员 · 沈砚',
): GlyphVersion {
  const comp = composeGlyph(strokes, params);
  const gen = generateGlyph({ char, skeleton: getSkeleton(char)!, params, previous: strokes.filter((s) => s.manual) });
  return {
    id,
    label: `v${id}`,
    createdAt,
    params,
    strokes,
    metrics: comp.metrics,
    svgPath: comp.path,
    polys: comp.polys.map((poly) => poly.map((ring) => ring.map((p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 })))),
    fingerprint: gen.fingerprint,
    note,
    author,
    lockedCount: strokes.filter((s) => s.manual).length,
  };
}

function manualize(
  strokes: StrokeState[],
  params: GenParams,
  strokeIndex: number,
  offset: { x: number; y: number },
  nodeIndex = 1,
): StrokeState[] {
  const out = strokes.map((s) => ({
    ...s,
    nodes: s.nodes.map((p) => ({ ...p })),
    baseNodes: s.baseNodes.map((p) => ({ ...p })),
    poly: s.poly?.map((p) => ({ ...p })),
  }));
  const target = out[strokeIndex % out.length];
  const idx = Math.min(nodeIndex, Math.max(0, target.nodes.length - 2));
  target.nodes[idx] = { x: target.nodes[idx].x + offset.x, y: target.nodes[idx].y + offset.y };
  const ring: Ring = renderStroke({ ...target, manual: false, poly: undefined }, params);
  target.manual = true;
  target.poly = ring;
  return out;
}

function comment(
  id: string,
  x: number,
  y: number,
  tag: string,
  body: string,
  author: string,
  createdAt: string,
  status: ReviewComment['status'] = '待处理',
  replies: ReviewComment['replies'] = [],
  resolvedAt?: string,
): ReviewComment {
  return { id, x, y, tag, body, author, createdAt, status, replies, resolvedAt };
}

interface Spec {
  char: string;
  library: string;
  weightName: string;
  weight: number;
  status: GlyphRecord['status'];
  createdAt: string;
  seed: number;
  params: Partial<GenParams>;
  versions: number;
  manualAt?: number;
  comments?: ReviewComment[];
  archivedAt?: string;
}

const D = (s: string) => new Date(s + 'T09:00:00+08:00').toISOString();

const SPECS: Spec[] = [
  {
    char: '永',
    library: '点画宋',
    weightName: '常规 400',
    weight: 400,
    status: '已归档',
    createdAt: '2026-08-04',
    seed: 88421,
    params: { weight: 86, contrast: 0.34, corner: 24, terminal: 'flat', slant: 0 },
    versions: 3,
    manualAt: 1,
    archivedAt: D('2026-08-27'),
    comments: [
      comment(
        'c-yong-1',
        560,
        690,
        '结构',
        '竖钩与横画的交接略偏右，收紧 8–10 em 后重心会更稳。',
        '审稿 · 林岫',
        D('2026-08-12'),
        '已处理',
        [
          { author: '设计员 · 沈砚', body: 'v2 已将竖钩中心线左移 9 em，并收窄钩尾。', createdAt: D('2026-08-14') },
          { author: '审稿 · 林岫', body: '复核通过。', createdAt: D('2026-08-15') },
        ],
        D('2026-08-15'),
      ),
      comment(
        'c-yong-2',
        236,
        320,
        '笔画',
        '提画起笔过尖，宋体味道不足，建议加一点顿角。',
        '审稿 · 林岫',
        D('2026-08-13'),
        '已处理',
        [{ author: '设计员 · 沈砚', body: '提画起笔宽度 +12%，并在 v3 增大圆角。', createdAt: D('2026-08-18') }],
        D('2026-08-20'),
      ),
    ],
  },
  {
    char: '一',
    library: '点画宋',
    weightName: '细体 300',
    weight: 300,
    status: '待审',
    createdAt: '2026-09-02',
    seed: 10231,
    params: { weight: 58, contrast: 0.52, corner: 18, terminal: 'flat', slant: 0 },
    versions: 2,
    comments: [
      comment(
        'c-yi-1',
        780,
        560,
        '收笔',
        '收笔三角偏短，横向字势没有托住，建议延长 10%。',
        '审稿 · 周慕',
        D('2026-10-22'),
      ),
      comment(
        'c-yi-2',
        300,
        520,
        '重心',
        '整笔中段略下坠，重心应在 520 之上。',
        '审稿 · 周慕',
        D('2026-10-22'),
      ),
    ],
  },
  {
    char: '十',
    library: '点画宋',
    weightName: '中黑 500',
    weight: 500,
    status: '修订中',
    createdAt: '2026-09-08',
    seed: 55311,
    params: { weight: 108, contrast: 0.38, corner: 26, terminal: 'oblique', slant: 0 },
    versions: 3,
    manualAt: 1,
    comments: [
      comment(
        'c-shi-1',
        512,
        840,
        '笔画',
        '竖画起笔的斜切方向与横画冲突，改为平切。',
        '审稿 · 林岫',
        D('2026-10-03'),
        '已处理',
        [{ author: '设计员 · 沈砚', body: '已将全局收笔改为平切，并在 v3 手工修整起笔端点。', createdAt: D('2026-10-06') }],
        D('2026-10-07'),
      ),
      comment(
        'c-shi-2',
        190,
        420,
        '间距',
        '横画左右出头不均，左侧多出 6 em。',
        '审稿 · 周慕',
        D('2026-10-08'),
      ),
    ],
  },
  {
    char: '人',
    library: '朱记手楷',
    weightName: '常规 400',
    weight: 400,
    status: '待审',
    createdAt: '2026-09-19',
    seed: 77120,
    params: { weight: 92, contrast: 0.18, corner: 40, terminal: 'round', slant: 4 },
    versions: 2,
    manualAt: 1,
    comments: [
      comment(
        'c-ren-1',
        480,
        760,
        '重心',
        '撇捺交点偏高，整字显得头重，交点下移 12 em。',
        '审稿 · 周慕',
        D('2026-10-30'),
      ),
    ],
  },
  {
    char: '大',
    library: '玄墨黑',
    weightName: '粗黑 700',
    weight: 700,
    status: '草稿',
    createdAt: '2026-10-06',
    seed: 33007,
    params: { weight: 132, contrast: 0.12, corner: 14, terminal: 'flat', slant: 0 },
    versions: 1,
  },
  {
    char: '天',
    library: '玄墨黑',
    weightName: '中黑 500',
    weight: 500,
    status: '待审',
    createdAt: '2026-10-11',
    seed: 91827,
    params: { weight: 106, contrast: 0.1, corner: 10, terminal: 'flat', slant: 0 },
    versions: 2,
    manualAt: 1,
    comments: [
      comment(
        'c-tian-1',
        500,
        590,
        '笔画',
        '第二横与撇捺的交点关系不清，建议第二横上提 10 em。',
        '审稿 · 林岫',
        D('2026-11-02'),
      ),
    ],
  },
  {
    char: '中',
    library: '点画宋',
    weightName: '常规 400',
    weight: 400,
    status: '已归档',
    createdAt: '2026-08-21',
    seed: 60013,
    params: { weight: 84, contrast: 0.4, corner: 22, terminal: 'flat', slant: 0 },
    versions: 3,
    manualAt: 2,
    archivedAt: D('2026-09-14'),
    comments: [
      comment(
        'c-zhong-1',
        330,
        500,
        '结构',
        '口部左右竖不对称，左竖应更细。',
        '审稿 · 周慕',
        D('2026-09-01'),
        '已处理',
        [{ author: '设计员 · 沈砚', body: '左竖 widthScale 调至 0.86，右竖保持 1.0。', createdAt: D('2026-09-03') }],
        D('2026-09-05'),
      ),
    ],
  },
  {
    char: '山',
    library: '玄墨黑',
    weightName: '细体 300',
    weight: 300,
    status: '修订中',
    createdAt: '2026-10-18',
    seed: 44019,
    params: { weight: 62, contrast: 0.16, corner: 8, terminal: 'flat', slant: 0 },
    versions: 2,
    manualAt: 1,
    comments: [],
  },
  {
    char: '心',
    library: '朱记手楷',
    weightName: '常规 400',
    weight: 400,
    status: '待审',
    createdAt: '2026-10-27',
    seed: 20277,
    params: { weight: 88, contrast: 0.2, corner: 44, terminal: 'round', slant: 3 },
    versions: 2,
    manualAt: 1,
    comments: [
      comment(
        'c-xin-1',
        760,
        470,
        '笔画',
        '右点与卧钩距离过近，粘在一起了。',
        '审稿 · 林岫',
        D('2026-11-06'),
      ),
      comment(
        'c-xin-2',
        420,
        210,
        '结构',
        '卧钩弧度过大，收笔应更贴合字面框底部。',
        '审稿 · 周慕',
        D('2026-11-06'),
      ),
    ],
  },
  {
    char: '口',
    library: '点画宋',
    weightName: '中黑 500',
    weight: 500,
    status: '草稿',
    createdAt: '2026-11-02',
    seed: 71004,
    params: { weight: 104, contrast: 0.36, corner: 20, terminal: 'flat', slant: 0 },
    versions: 1,
  },
  {
    char: '王',
    library: '玄墨黑',
    weightName: '常规 400',
    weight: 400,
    status: '已归档',
    createdAt: '2026-08-30',
    seed: 50128,
    params: { weight: 94, contrast: 0.08, corner: 6, terminal: 'flat', slant: 0 },
    versions: 2,
    archivedAt: D('2026-09-26'),
    comments: [],
  },
  {
    char: '生',
    library: '朱记手楷',
    weightName: '中黑 500',
    weight: 500,
    status: '待审',
    createdAt: '2026-11-08',
    seed: 88031,
    params: { weight: 100, contrast: 0.22, corner: 36, terminal: 'oblique', slant: 2 },
    versions: 1,
  },
];

export function buildSeedRecords(): GlyphRecord[] {
  const records: GlyphRecord[] = [];
  SPECS.forEach((spec, i) => {
    const skeleton = getSkeleton(spec.char) as GlyphSkeleton;
    const baseParams: GenParams = { ...DEFAULT_PARAMS, seed: spec.seed, ...spec.params };
    const createdAt = D(spec.createdAt);
    const id = makeRecordId(i + 1, createdAt);
    const versions: GlyphVersion[] = [];

    let strokes: StrokeState[] = [];
    let params = { ...baseParams };
    const comp1 = generateGlyph({ char: spec.char, skeleton, params });
    strokes = comp1.strokes;
    versions.push(
      makeVersion(spec.char, 1, createdAt, params, strokes, '初版样张：按骨架自动生成，未作手工调整。'),
    );

    for (let v = 2; v <= spec.versions; v++) {
      params = {
        ...params,
        weight: params.weight + 4,
        contrast: Math.max(0, Math.min(0.9, params.contrast + (v % 2 === 0 ? 0.05 : -0.03))),
        corner: params.corner + 3,
        seed: params.seed + v * 13,
      };
      if (v === 2 && spec.manualAt !== undefined) {
        const prevStrokes = versions[versions.length - 1].strokes;
        const m = manualize(prevStrokes, params, spec.manualAt, { x: 10, y: -14 });
        const gen = generateGlyph({ char: spec.char, skeleton, params, previous: m });
        strokes = gen.strokes;
      } else {
        const gen = generateGlyph({ char: spec.char, skeleton, params, previous: versions[versions.length - 1].strokes });
        strokes = gen.strokes;
      }
      const note =
        v === 2 && spec.manualAt !== undefined
          ? '按审稿意见调整参数，并手工微调一笔（已锁定）。'
          : '参数微调后重新生成；保留既有手改笔画。';
      versions.push(makeVersion(spec.char, v, addDays(spec.createdAt, v * 4), params, strokes, note));
    }

    const current = versions[versions.length - 1];
    const comments = spec.comments ?? [];
    records.push({
      id,
      seq: i + 1,
      char: spec.char,
      pinyin: skeleton.pinyin,
      library: spec.library,
      weightName: spec.weightName,
      weight: spec.weight,
      faceBox: { width: 1000, height: 1000, baseline: 0, descender: 200 },
      skeletonSource: {
        kind: spec.library === '朱记手楷' ? '手写扫描骨架' : '碑帖中心线描摹',
        ref: skeleton.source,
      },
      status: spec.status,
      createdAt,
      updatedAt: versions[versions.length - 1].createdAt,
      archivedAt: spec.archivedAt,
      seed: spec.seed,
      params: { ...current.params },
      versions,
      currentVersionId: current.id,
      comments,
      plate: {
        svgPath: versions[0].svgPath,
        createdAt,
        fingerprint: versions[0].fingerprint,
        note: '建档初版样张',
      },
    });
  });
  return records;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T09:00:00+08:00');
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
