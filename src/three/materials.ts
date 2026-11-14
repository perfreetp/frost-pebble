import * as THREE from 'three';
import type { PanelAppearance, MaterialType } from '../types';

function disposeMaterial(m: THREE.Material): void {
  m.dispose();
}

/** 变色龙：在物理材质基础上注入菲涅尔色相偏移 */
function makeChameleon(a: PanelAppearance): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(a.color),
    metalness: a.metalness,
    roughness: a.roughness,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.2,
    side: THREE.DoubleSide,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uShift = { value: 1.9 };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vChamNormal;\nvarying vec3 vChamView;'
      )
      .replace(
        '#include <beginnormal_vertex>',
        '#include <beginnormal_vertex>\nvChamNormal = normalize(mat3(modelMatrix) * objectNormal);'
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvChamView = normalize(cameraPosition - (modelMatrix * vec4(transformed, 1.0)).xyz);'
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vChamNormal;\nvarying vec3 vChamView;\n' +
          'vec3 hueRotate(vec3 color, float shift){\n' +
          '  const vec3 k = vec3(0.57735);\n' +
          '  float c = cos(shift);\n' +
          '  return color * c + cross(k, color) * sin(shift) + k * dot(k, color) * (1.0 - c);\n' +
          '}'
      )
      .replace(
        '#include <color_fragment>',
        '#include <color_fragment>\n' +
          '{\n' +
          '  float fres = pow(1.0 - clamp(dot(normalize(vChamNormal), normalize(vChamView)), 0.0, 1.0), 2.2);\n' +
          '  vec3 shifted = hueRotate(diffuseColor.rgb, 1.1 + fres * 2.4);\n' +
          '  diffuseColor.rgb = mix(diffuseColor.rgb, shifted, 0.85);\n' +
          '}'
      );
  };
  mat.customProgramCacheKey = () => 'chameleon-wrap-v1';
  return mat;
}

export function makeWrapMaterial(a: PanelAppearance): THREE.MeshPhysicalMaterial {
  switch (a.material as MaterialType) {
    case 'matte':
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(a.color),
        metalness: a.metalness,
        roughness: a.roughness,
        clearcoat: 0,
        envMapIntensity: 0.7,
        side: THREE.DoubleSide,
      });
    case 'chrome':
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(a.color),
        metalness: 1,
        roughness: a.roughness,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.8,
        side: THREE.DoubleSide,
      });
    case 'chameleon':
      return makeChameleon(a);
    case 'glossy':
    default:
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(a.color),
        metalness: a.metalness,
        roughness: a.roughness,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.1,
        side: THREE.DoubleSide,
      });
  }
}

export function makeGlassMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0x0e141b,
    metalness: 0,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.4,
  });
}

export function makeTrimMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.85, metalness: 0.1 });
}

export function makeTireMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.95 });
}

export function makeHubMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: 0xb8bcc0, roughness: 0.35, metalness: 0.9 });
}

export function makeSeamMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xff1f1f,
    emissive: 0xb00000,
    emissiveIntensity: 0.6,
    roughness: 0.4,
  });
}

/** 替换 mesh 材质并释放旧材质（玻璃/轮胎等跳过由调用方控制） */
export function replaceMaterial(mesh: THREE.Mesh, next: THREE.Material): void {
  const old = mesh.material;
  mesh.material = next;
  if (old && !Array.isArray(old)) disposeMaterial(old);
}
