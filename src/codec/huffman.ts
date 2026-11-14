// 熵编码：基于符号频率的 Huffman 编码（规范码），含位流读写器

export class BitWriter {
  private bytes: number[] = [];
  private cur = 0;
  private nbits = 0;

  writeBits(code: number, len: number): void {
    for (let i = len - 1; i >= 0; i--) {
      this.cur = (this.cur << 1) | ((code >> i) & 1);
      this.nbits++;
      if (this.nbits === 8) {
        this.bytes.push(this.cur);
        this.cur = 0;
        this.nbits = 0;
      }
    }
  }

  finish(): Uint8Array {
    if (this.nbits > 0) {
      this.bytes.push(this.cur << (8 - this.nbits));
      this.cur = 0;
      this.nbits = 0;
    }
    return new Uint8Array(this.bytes);
  }
}

export class BitReader {
  private pos = 0;
  private cur = 0;
  private nbits = 0;

  constructor(private data: Uint8Array, offset = 0) {
    this.pos = offset;
  }

  readBit(): number {
    if (this.nbits === 0) {
      this.cur = this.pos < this.data.length ? this.data[this.pos++] : 0;
      this.nbits = 8;
    }
    this.nbits--;
    return (this.cur >> this.nbits) & 1;
  }

  readBits(n: number): number {
    let v = 0;
    for (let i = 0; i < n; i++) v = (v << 1) | this.readBit();
    return v;
  }

  /** 当前字节位置（已对齐到已消耗位） */
  bytePos(): number {
    return this.pos - (this.nbits > 0 ? 1 : 0);
  }
}

export interface HuffCode {
  code: number;
  len: number;
}

interface TreeNode {
  sym: number; // -1 表示内部节点
  freq: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

const MAX_LEN = 24;

/** 由频率表构建 Huffman 码表；返回 null 表示无符号 */
export function buildHuffman(freqs: Map<number, number>): Map<number, HuffCode> | null {
  const entries = [...freqs.entries()].filter(([, f]) => f > 0);
  if (entries.length === 0) return null;
  const lengths = new Map<number, number>();

  if (entries.length === 1) {
    lengths.set(entries[0][0], 1);
  } else {
    // 堆排序建树
    const heap: TreeNode[] = entries.map(([sym, freq]) => ({ sym, freq, left: null, right: null }));
    const sift = (i: number) => {
      for (;;) {
        let m = i;
        const l = i * 2 + 1, r = i * 2 + 2;
        if (l < heap.length && heap[l].freq < heap[m].freq) m = l;
        if (r < heap.length && heap[r].freq < heap[m].freq) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    };
    const pop = (): TreeNode => {
      const top = heap[0];
      const last = heap.pop()!;
      if (heap.length > 0) {
        heap[0] = last;
        sift(0);
      }
      return top;
    };
    for (let i = heap.length >> 1; i >= 0; i--) sift(i);
    while (heap.length > 1) {
      const a = pop();
      const b = pop();
      heap.push({ sym: -1, freq: a.freq + b.freq, left: a, right: b });
      let i = heap.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (heap[p].freq <= heap[i].freq) break;
        [heap[p], heap[i]] = [heap[i], heap[p]];
        i = p;
      }
    }
    const walk = (n: TreeNode, depth: number) => {
      if (n.sym >= 0) {
        lengths.set(n.sym, Math.max(1, depth));
        return;
      }
      walk(n.left!, depth + 1);
      walk(n.right!, depth + 1);
    };
    walk(heap[0], 0);
    // 码长超限保护：退化为等长码（仍然正确，只是稍大）
    let maxLen = 0;
    for (const l of lengths.values()) maxLen = Math.max(maxLen, l);
    if (maxLen > MAX_LEN) {
      const fixed = Math.ceil(Math.log2(entries.length));
      lengths.clear();
      for (const [sym] of entries) lengths.set(sym, fixed);
    }
  }
  return canonicalCodes(lengths);
}

/** 由 (符号 -> 码长) 生成规范 Huffman 码 */
export function canonicalCodes(lengths: Map<number, number>): Map<number, HuffCode> {
  const sorted = [...lengths.entries()].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const table = new Map<number, HuffCode>();
  let code = 0;
  let prevLen = 0;
  for (const [sym, len] of sorted) {
    code <<= len - prevLen;
    table.set(sym, { code, len });
    code++;
    prevLen = len;
  }
  return table;
}

/** 解码树 */
export class HuffDecoder {
  private root: TreeNode = { sym: -1, freq: 0, left: null, right: null };

  constructor(table: Map<number, HuffCode>) {
    for (const [sym, { code, len }] of table) {
      let node = this.root;
      for (let i = len - 1; i >= 0; i--) {
        const bit = (code >> i) & 1;
        if (bit === 0) {
          if (!node.left) node.left = { sym: -1, freq: 0, left: null, right: null };
          node = node.left;
        } else {
          if (!node.right) node.right = { sym: -1, freq: 0, left: null, right: null };
          node = node.right;
        }
      }
      node.sym = sym;
    }
  }

  decode(reader: BitReader): number {
    let node = this.root;
    while (node.sym < 0) {
      node = reader.readBit() === 0 ? node.left! : node.right!;
    }
    return node.sym;
  }
}

/** 序列化码表：符号数 + (符号, 码长) 对，供解码端重建 */
export function serializeTable(lengths: Map<number, number>): number[] {
  const out: number[] = [];
  const entries = [...lengths.entries()].sort((a, b) => a[0] - b[0]);
  out.push(entries.length & 0xff, (entries.length >> 8) & 0xff);
  for (const [sym, len] of entries) out.push(sym & 0xff, len & 0xff);
  return out;
}

export function deserializeTable(data: Uint8Array, offset: number): { table: Map<number, HuffCode>; next: number } {
  const count = data[offset] | (data[offset + 1] << 8);
  const lengths = new Map<number, number>();
  let p = offset + 2;
  for (let i = 0; i < count; i++) {
    lengths.set(data[p], data[p + 1]);
    p += 2;
  }
  return { table: canonicalCodes(lengths), next: p };
}

/** 从码表反推码长表（用于序列化） */
export function tableToLengths(table: Map<number, HuffCode>): Map<number, number> {
  const lengths = new Map<number, number>();
  for (const [sym, c] of table) lengths.set(sym, c.len);
  return lengths;
}
