// Une malhas estáticas que usam o mesmo material numa só, para a placa de vídeo
// desenhar o cenário com poucas chamadas por quadro. O visual não muda.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const BASE = ['position', 'normal', 'uv'];

// inverte a ordem dos vértices de cada triângulo (para peças espelhadas com escala negativa)
function flipWinding(g) {
  for (const name of Object.keys(g.attributes)) {
    const a = g.attributes[name], s = a.itemSize, arr = a.array;
    for (let i = 0; i < a.count; i += 3) for (let k = 0; k < s; k++) {
      const p = (i + 1) * s + k, q = (i + 2) * s + k, t = arr[p]; arr[p] = arr[q]; arr[q] = t;
    }
    a.needsUpdate = true;
  }
}

// assinatura visual do material: peças com a mesma aparência podem ser unidas mesmo
// quando o código criou um material novo para cada uma
const tex = (t) => (t ? t.uuid : '-');
const col = (c) => (c ? c.getHexString() : '-');
function signature(m) {
  return [m.type, col(m.color), col(m.emissive), m.emissiveIntensity, m.roughness, m.metalness, m.opacity, m.alphaTest,
    m.side, m.flatShading, m.vertexColors, m.envMapIntensity, m.toneMapped, m.fog,
    tex(m.map), tex(m.bumpMap), m.bumpScale, tex(m.emissiveMap), tex(m.normalMap), tex(m.alphaMap)].join('|');
}

export function mergeStatic(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map(), done = [];
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.userData.floor || o.userData.keep) return;
    const m = o.material;
    if (Array.isArray(m) || m.transparent || !o.visible) return;
    const src = o.geometry;
    const names = Object.keys(src.attributes);
    if (names.length !== 3 || !BASE.every((n) => src.attributes[n])) return; // cores por vértice etc. ficam como estão
    if (Object.keys(src.morphAttributes).length) return;
    const g = src.index ? src.toNonIndexed() : src.clone();
    g.clearGroups();
    const mtx = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
    g.applyMatrix4(mtx);
    if (mtx.determinant() < 0) flipWinding(g);
    const key = `${signature(m)}|${o.castShadow ? 1 : 0}${o.receiveShadow ? 1 : 0}`;
    if (!buckets.has(key)) buckets.set(key, { m, cast: o.castShadow, recv: o.receiveShadow, geos: [] });
    buckets.get(key).geos.push(g);
    done.push(o);
  });
  for (const o of done) o.parent.remove(o);
  let meshes = 0;
  for (const b of buckets.values()) {
    const geo = b.geos.length === 1 ? b.geos[0] : mergeGeometries(b.geos, false);
    if (!geo) continue;
    if (b.geos.length > 1) b.geos.forEach((x) => x.dispose());
    const mesh = new THREE.Mesh(geo, b.m);
    mesh.castShadow = b.cast; mesh.receiveShadow = b.recv;
    mesh.matrixAutoUpdate = false;
    root.add(mesh);
    meshes++;
  }
  return { merged: done.length, meshes };
}
