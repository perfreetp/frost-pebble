import JSZip from 'jszip';
import type { Project, CharacterVersion, Timeline, Rig } from './types';
import { downloadBlob, fmtDate } from './util';

export interface ExportFrame {
  frame: number;
  png: Blob;
}

export function rigConfig(project: Project, version?: CharacterVersion) {
  const rig = version?.rig ?? project.rig;
  const timeline = version?.timeline ?? project.timeline;
  return {
    schema: 'heying.character/1',
    project: {
      id: project.id,
      crop: project.crop,
      episode: project.episode,
      title: project.title,
      deliveryDate: project.deliveryDate,
    },
    version: version?.number ?? project.versions.length,
    exportedAt: new Date().toISOString(),
    canvas: { width: 960, height: 640 },
    fps: timeline.fps,
    duration: timeline.duration,
    assets: project.assets.map((a) => ({
      id: a.id,
      name: a.name,
      kind: a.kind,
      width: a.width,
      height: a.height,
      anchorX: a.anchorX,
      anchorY: a.anchorY,
      file: a.builtinKey ? null : `${a.id}.png`,
      builtin: a.builtinKey ?? null,
    })),
    bones: rig.bones.map((b) => ({
      id: b.id,
      name: b.name,
      parentId: b.parentId,
      partId: b.partId,
      bind: { x: b.bindX, y: b.bindY, rotation: b.bindRotation, scaleX: b.bindScaleX, scaleY: b.bindScaleY },
    })),
    tracks: timeline.tracks
      .filter((t) => Object.values(t.channels).some((c) => c.keys.length))
      .map((t) => ({
        boneId: t.boneId,
        channels: {
          position: t.channels.position.keys.map((k) => ({ frame: k.frame, value: k.value, easing: k.easing, bezier: k.bezier })),
          rotation: t.channels.rotation.keys.map((k) => ({ frame: k.frame, value: k.value, easing: k.easing, bezier: k.bezier })),
          scale: t.channels.scale.keys.map((k) => ({ frame: k.frame, value: k.value, easing: k.easing, bezier: k.bezier })),
        },
      })),
  };
}

export interface DeliveryBundle {
  config: unknown;
  frames: ExportFrame[];
  zip: Blob;
  fileCount: number;
}

export async function buildDeliveryZip(
  project: Project,
  frames: ExportFrame[],
  opts: { version?: CharacterVersion; includeAssets: boolean },
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(`heying_${project.crop}_ep${String(project.episode).padStart(2, '0')}_${fmtDate(project.deliveryDate)}`)!;
  const frameDir = folder.folder('frames')!;
  const names: string[] = [];
  frames.forEach((f, i) => {
    const name = `frame_${String(i).padStart(4, '0')}.png`;
    names.push(name);
    frameDir.file(name, f.png);
  });
  folder.file('character.json', JSON.stringify(rigConfig(project, opts.version), null, 2));
  folder.file(
    'sequence.json',
    JSON.stringify({ fps: (opts.version?.timeline ?? project.timeline).fps, count: frames.length, totalFrames: frames.length, names }, null, 2),
  );
  if (opts.includeAssets) {
    const assets = folder.folder('assets')!;
    for (const a of project.assets) {
      if (!a.dataUrl) continue;
      assets.file(`${a.id}.png`, a.dataUrl.split(',')[1], { base64: true });
    }
  }
  folder.file('README.txt', [
    `作物拟人角色交付包`,
    `作物：${project.crop}    集数：第 ${project.episode} 集`,
    `标题：${project.title}`,
    `交付日期：${project.deliveryDate}`,
    `版本：v${opts.version?.number ?? project.versions.length}`,
    `序列帧：${frames.length} 帧 @ ${(opts.version?.timeline ?? project.timeline).fps}fps（含透明通道）`,
    `配置：character.json（骨架、绑定姿态、关键帧与缓动）`,
    ``,
    `由禾影工坊导出`,
  ].join('\n'));
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  return blob;
}

export function downloadZip(blob: Blob, project: Project) {
  downloadBlob(blob, `禾影_${project.crop}_第${project.episode}集_v${project.versions.length || 1}.zip`);
}

export interface ParsedConfig {
  rig: Rig;
  timeline: Timeline;
  meta: { version: number; assets: Array<{ id: string; name: string; kind: string; width: number; height: number; anchorX: number; anchorY: number; file: string | null; builtin: string | null }> };
}

export function parseConfig(json: unknown): ParsedConfig | null {
  try {
    const cfg = json as ReturnType<typeof rigConfig>;
    if (cfg.schema !== 'heying.character/1') return null;
    const bones = cfg.bones.map((b) => ({
      id: b.id,
      name: b.name,
      parentId: b.parentId,
      partId: b.partId,
      x: b.bind.x,
      y: b.bind.y,
      rotation: b.bind.rotation,
      scaleX: b.bind.scaleX,
      scaleY: b.bind.scaleY,
      bindX: b.bind.x,
      bindY: b.bind.y,
      bindRotation: b.bind.rotation,
      bindScaleX: b.bind.scaleX,
      bindScaleY: b.bind.scaleY,
      locked: false,
      z: 0,
      color: '#e9b750',
    }));
    const timeline: Timeline = {
      fps: cfg.fps,
      duration: cfg.duration,
      tracks: cfg.tracks.map((t) => ({
        boneId: t.boneId,
        channels: {
          position: { kind: 'position' as const, keys: t.channels.position.map((k) => ({ ...k, id: `k_${Math.random().toString(36).slice(2, 8)}` })) },
          rotation: { kind: 'rotation' as const, keys: t.channels.rotation.map((k) => ({ ...k, id: `k_${Math.random().toString(36).slice(2, 8)}` })) },
          scale: { kind: 'scale' as const, keys: t.channels.scale.map((k) => ({ ...k, id: `k_${Math.random().toString(36).slice(2, 8)}` })) },
        },
      })),
    };
    return { rig: { bones }, timeline, meta: { version: cfg.version, assets: cfg.assets } };
  } catch {
    return null;
  }
}
