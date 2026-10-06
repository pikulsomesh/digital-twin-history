// The growth spiral: every milestone placed by year (height), with the spiral's
// radius set by how many domains had seen digital-twin activity by then.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Time is compressed before 1960 and stretched after 2000, where most activity is.
export function yearToY(year) {
  if (year < 1960) return (year - 1880) * 0.06;
  if (year < 2000) return 4.8 + (year - 1960) * 0.2;
  return 12.8 + (year - 2000) * 0.7;
}

export function breadthByYear(timeline) {
  const sorted = [...timeline].sort((a, b) => a.year - b.year);
  const seen = new Set();
  const out = [];
  for (const m of sorted) {
    m.domains.forEach((d) => seen.add(d));
    out.push({ year: m.year, breadth: seen.size });
  }
  return out;
}

export function createSpiral(container, { timeline, eras, kindColor, onPick, onHover }) {
  const W = () => container.clientWidth || 600;
  const H = () => container.clientHeight || 500;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  container.appendChild(renderer.domElement);
  const labels = new CSS2DRenderer();
  labels.setSize(W(), H());
  labels.domElement.className = 'scene-labels';
  container.appendChild(labels.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 200);
  camera.position.set(36, 19, 36);
  const controls = new OrbitControls(camera, labels.domElement);
  controls.target.set(0, 16, 0);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  controls.minDistance = 10;
  controls.maxDistance = 90;

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dl = new THREE.DirectionalLight(0xffffff, 1.4);
  dl.position.set(10, 30, 15);
  scene.add(dl);

  const sorted = [...timeline].sort((a, b) => a.year - b.year);
  const breadth = breadthByYear(sorted);
  const radiusAt = (b) => 1.2 + b * 0.75;

  // Growth envelope: a translucent surface of revolution following breadth
  const profile = [];
  breadth.forEach(({ year, breadth: b }) => profile.push(new THREE.Vector2(radiusAt(b), yearToY(year))));
  const envelope = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 64),
    new THREE.MeshBasicMaterial({ color: 0x3987e5, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }),
  );
  scene.add(envelope);

  // Central axis and era rings
  const axis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, yearToY(2027), 0)]),
    new THREE.LineBasicMaterial({ color: 0x8a8f96, transparent: true, opacity: 0.5 }),
  );
  scene.add(axis);
  eras.forEach((era) => {
    const y = yearToY(era.range[0]);
    const b = breadth.filter((p) => p.year <= era.range[0]).pop();
    const r = radiusAt(b ? b.breadth : 1) + 0.6;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.025, 6, 96),
      new THREE.MeshBasicMaterial({ color: 0xc3c2b7, transparent: true, opacity: 0.35 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    scene.add(ring);
    const el = document.createElement('div');
    el.className = 'scene-label scene-label--era';
    el.textContent = `${era.range[0]} · ${era.name}`;
    const lbl = new CSS2DObject(el);
    lbl.position.set(r + 0.4, y, 0);
    scene.add(lbl);
  });

  // Milestone nodes, spiralling around the axis
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  const nodes = [];
  const pathPts = [];
  sorted.forEach((m, i) => {
    const b = breadth[i].breadth;
    const r = radiusAt(b);
    const a = i * GOLDEN * 1.3;
    const pos = new THREE.Vector3(Math.cos(a) * r, yearToY(m.year), Math.sin(a) * r);
    pathPts.push(pos);
    const size = 0.22 + m.significance * 0.12;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, 20, 20),
      new THREE.MeshStandardMaterial({ color: kindColor(m.kind), roughness: 0.35, metalness: 0.1, emissive: kindColor(m.kind), emissiveIntensity: 0.25 }),
    );
    mesh.position.copy(pos);
    mesh.userData = { m, baseScale: 1 };
    scene.add(mesh);
    nodes.push(mesh);
    const spoke = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, pos.y, 0), pos]),
      new THREE.LineBasicMaterial({ color: 0x8a8f96, transparent: true, opacity: 0.18 }),
    );
    scene.add(spoke);
    if (m.significance >= 3 && m.year < 2022) {
      const el = document.createElement('div');
      el.className = 'scene-label scene-label--node';
      el.textContent = `${m.year} ${m.title.length > 34 ? m.title.slice(0, 32) + '…' : m.title}`;
      const lbl = new CSS2DObject(el);
      lbl.position.copy(pos).add(new THREE.Vector3(0, size + 0.35, 0));
      scene.add(lbl);
      mesh.userData.label = lbl;
    }
  });
  const curve = new THREE.CatmullRomCurve3(pathPts);
  const thread = new THREE.Mesh(
    new THREE.TubeGeometry(curve, pathPts.length * 8, 0.035, 6, false),
    new THREE.MeshBasicMaterial({ color: 0x9085e9, transparent: true, opacity: 0.55 }),
  );
  scene.add(thread);

  // Interaction
  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let hovered = null;
  let down = null;
  const hit = (ev) => {
    const r = labels.domElement.getBoundingClientRect();
    ptr.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const h = ray.intersectObjects(nodes, false)[0];
    return h ? h.object : null;
  };
  const move = (ev) => {
    const h = hit(ev);
    if (h !== hovered) {
      if (hovered) hovered.scale.setScalar(1);
      hovered = h;
      if (hovered) hovered.scale.setScalar(1.6);
      labels.domElement.style.cursor = h ? 'pointer' : '';
      controls.autoRotate = !h;
      onHover && onHover(h ? h.userData.m : null, ev);
    } else if (h && onHover) {
      onHover(h.userData.m, ev);
    }
  };
  const leave = () => {
    if (hovered) hovered.scale.setScalar(1);
    hovered = null;
    controls.autoRotate = true;
    onHover && onHover(null);
  };
  labels.domElement.addEventListener('pointermove', move);
  labels.domElement.addEventListener('pointerleave', leave);
  labels.domElement.addEventListener('pointerdown', (ev) => { down = { x: ev.clientX, y: ev.clientY }; controls.autoRotate = false; });
  labels.domElement.addEventListener('pointerup', (ev) => {
    if (!down) return;
    const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
    down = null;
    if (moved > 5) return;
    const h = hit(ev);
    if (h && onPick) onPick(h.userData.m);
  });

  let filter = null;
  function setFilter(fn) {
    filter = fn;
    nodes.forEach((n) => {
      const on = !filter || filter(n.userData.m);
      n.material.transparent = !on;
      n.material.opacity = on ? 1 : 0.12;
      if (n.userData.label) n.userData.label.visible = on;
    });
  }

  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
    labels.render(scene, camera);
  };
  loop();
  const ro = new ResizeObserver(() => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
    labels.setSize(W(), H());
  });
  ro.observe(container);

  return {
    setFilter,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      container.innerHTML = '';
    },
  };
}
