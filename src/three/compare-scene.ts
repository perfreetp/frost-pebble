// three.js 三维贴图对比场景：原图 / 压缩图 / 块效应放大图 三块展板并排
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CompareScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private planes: THREE.Mesh[] = [];
  private labels: THREE.Sprite[] = [];
  private frame: THREE.LineSegments | null = null;
  private disposed = false;

  constructor(private container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x14181f);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0.6, 7.2);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI * 0.65;

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(2, 4, 6);
    this.scene.add(dir);

    const grid = new THREE.GridHelper(16, 32, 0x2a3242, 0x1e2430);
    grid.position.y = -1.6;
    this.scene.add(grid);

    this.resize();
    window.addEventListener('resize', this.resize);
    this.animate();
  }

  private resize = (): void => {
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 420;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  private animate = (): void => {
    if (this.disposed) return;
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private makeLabel(text: string, color: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(20,24,31,0.85)';
    ctx.fillRect(0, 0, 512, 96);
    ctx.font = 'bold 44px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 50);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2.2, 0.41, 1);
    return sprite;
  }

  /**
   * 更新三块展板贴图
   * @param images [原图, 压缩图, 块效应放大] 画布
   * @param captions 展板标题
   */
  setImages(images: Array<HTMLCanvasElement | null>, captions: [string, string, string]): void {
    for (const p of this.planes) {
      this.scene.remove(p);
      (p.material as THREE.MeshBasicMaterial).map?.dispose();
      (p.material as THREE.MeshBasicMaterial).dispose();
      p.geometry.dispose();
    }
    for (const l of this.labels) {
      this.scene.remove(l);
      (l.material as THREE.SpriteMaterial).map?.dispose();
      (l.material as THREE.SpriteMaterial).dispose();
    }
    if (this.frame) {
      this.scene.remove(this.frame);
      this.frame.geometry.dispose();
      (this.frame.material as THREE.Material).dispose();
      this.frame = null;
    }
    this.planes = [];
    this.labels = [];

    const colors = ['#7fd4ff', '#8dffa3', '#ffb37f'];
    const gap = 0.35;
    const height = 3;
    let cursor = 0;
    const slots: Array<{ x: number; w: number }> = [];
    for (const img of images) {
      const aspect = img ? img.width / img.height : 1;
      const w = height * Math.max(0.2, Math.min(3, aspect));
      slots.push({ x: cursor + w / 2, w });
      cursor += w + gap;
    }
    const total = cursor - gap;
    const offset = -total / 2;

    images.forEach((img, i) => {
      const { x, w } = slots[i];
      const px = x + offset;
      let mesh: THREE.Mesh;
      if (img) {
        const tex = new THREE.CanvasTexture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = i === 2 ? THREE.NearestFilter : THREE.LinearFilter;
        tex.magFilter = i === 2 ? THREE.NearestFilter : THREE.LinearFilter;
        tex.generateMipmaps = i !== 2;
        mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(w, height),
          new THREE.MeshBasicMaterial({ map: tex }),
        );
      } else {
        mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(w, height),
          new THREE.MeshBasicMaterial({ color: 0x232a36, transparent: true, opacity: 0.6 }),
        );
      }
      mesh.position.set(px, 0, 0);
      this.scene.add(mesh);
      this.planes.push(mesh);

      const label = this.makeLabel(captions[i], colors[i]);
      label.position.set(px, height / 2 + 0.42, 0);
      this.scene.add(label);
      this.labels.push(label);
    });

    // 外框
    const frameGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(offset - 0.15, -height / 2 - 0.15, -0.01),
      new THREE.Vector3(-offset + 0.15, -height / 2 - 0.15, -0.01),
      new THREE.Vector3(-offset + 0.15, height / 2 + 0.15, -0.01),
      new THREE.Vector3(offset - 0.15, height / 2 + 0.15, -0.01),
      new THREE.Vector3(offset - 0.15, -height / 2 - 0.15, -0.01),
    ]);
    this.frame = new THREE.Line(frameGeo, new THREE.LineBasicMaterial({ color: 0x3a4658 })) as unknown as THREE.LineSegments;
    this.scene.add(this.frame);

    // 相机对准展板
    const dist = Math.max(6, total * 0.72);
    this.camera.position.set(0, 0.5, dist);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  dispose(): void {
    this.disposed = true;
    window.removeEventListener('resize', this.resize);
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
