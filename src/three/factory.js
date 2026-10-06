// "The factory through time": one production line, rendered as people could
// see and understand it in each era, from andon lights to a live twin.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export const STATIONS = [
  { id: 'cnc', name: 'CNC machining', type: 'cnc' },
  { id: 'robot', name: 'Robot cell', type: 'robot' },
  { id: 'press', name: 'Press', type: 'press' },
  { id: 'inspect', name: 'Inspection', type: 'inspect' },
  { id: 'pack', name: 'Packaging', type: 'pack' },
];
const STATION_X = [-12, -6, 0, 6, 12];
const TWIN_Y = 8;

const ERA_LOOK = {
  'lights':       { bg: 0x1f1b16, fog: 0x1f1b16, amb: 0xffe2b8, ambI: 0.55, key: 0xffd9a0, keyI: 1.4, paint: 0x5f7d63, floor: 0x3a352d, workers: 6 },
  'control-room': { bg: 0x1b1e1c, fog: 0x1b1e1c, amb: 0xf3ead8, ambI: 0.6, key: 0xfff0d0, keyI: 1.5, paint: 0x6d8a8a, floor: 0x3b3b37, workers: 5 },
  'connected':    { bg: 0x161b22, fog: 0x161b22, amb: 0xe6ecf5, ambI: 0.65, key: 0xffffff, keyI: 1.5, paint: 0x8a96a3, floor: 0x343a42, workers: 4 },
  'sensors':      { bg: 0x101726, fog: 0x101726, amb: 0xdfe8ff, ambI: 0.6, key: 0xffffff, keyI: 1.6, paint: 0xb7c0cc, floor: 0x2b3240, workers: 3 },
  'live-twin':    { bg: 0x070d1c, fog: 0x070d1c, amb: 0xd6e4ff, ambI: 0.55, key: 0xffffff, keyI: 1.7, paint: 0xd9dee6, floor: 0x1d2433, workers: 2 },
  'physical-ai':  { bg: 0x0a0b1c, fog: 0x0a0b1c, amb: 0xe0dcff, ambI: 0.55, key: 0xffffff, keyI: 1.7, paint: 0xd9dee6, floor: 0x1c1f33, workers: 2 },
};
const ERA_ORDER = Object.keys(ERA_LOOK);
const STATE_COLORS = { green: 0x37c871, yellow: 0xf2c230, red: 0xef4444 };

function canvasTexture(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { canvas, ctx: canvas.getContext('2d'), tex };
}

function label(html, className = 'scene-label') {
  const el = document.createElement('div');
  el.className = className;
  el.innerHTML = html;
  return new CSS2DObject(el);
}

// Builds a station either as solid machinery or as a glowing wireframe "twin".
function buildStation(type, mats, wire) {
  const g = new THREE.Group();
  const parts = {};
  const mk = (geo, mat, parent = g) => {
    let obj;
    if (wire) {
      obj = new THREE.LineSegments(new THREE.EdgesGeometry(geo), mats.wire);
    } else {
      obj = new THREE.Mesh(geo, mat);
      obj.castShadow = true; obj.receiveShadow = true;
    }
    parent.add(obj);
    return obj;
  };
  if (type === 'cnc') {
    mk(new THREE.BoxGeometry(3, 2.4, 2.6), mats.paint).position.set(0, 1.2, -2.2);
    mk(new THREE.BoxGeometry(2.2, 1.0, 0.1), mats.glass).position.set(0, 1.5, -0.87);
    const spindle = mk(new THREE.CylinderGeometry(0.15, 0.15, 0.9, 12), mats.steel);
    spindle.position.set(0, 1.6, -2.0);
    parts.spindle = spindle;
  } else if (type === 'robot') {
    mk(new THREE.CylinderGeometry(0.6, 0.75, 0.5, 20), mats.dark).position.set(0, 0.25, -1.8);
    const turret = new THREE.Group(); turret.position.set(0, 0.5, -1.8); g.add(turret);
    mk(new THREE.CylinderGeometry(0.4, 0.45, 0.5, 16), mats.accent, turret).position.y = 0.25;
    const shoulder = new THREE.Group(); shoulder.position.y = 0.5; turret.add(shoulder);
    mk(new THREE.BoxGeometry(0.35, 1.8, 0.35), mats.accent, shoulder).position.y = 0.9;
    const elbow = new THREE.Group(); elbow.position.y = 1.8; shoulder.add(elbow);
    mk(new THREE.BoxGeometry(0.3, 1.4, 0.3), mats.accent, elbow).position.y = 0.7;
    mk(new THREE.BoxGeometry(0.5, 0.2, 0.5), mats.dark, elbow).position.y = 1.45;
    parts.turret = turret; parts.shoulder = shoulder; parts.elbow = elbow;
  } else if (type === 'press') {
    mk(new THREE.BoxGeometry(0.4, 4, 0.4), mats.paint).position.set(-1.1, 2, -0.2);
    mk(new THREE.BoxGeometry(0.4, 4, 0.4), mats.paint).position.set(1.1, 2, -0.2);
    mk(new THREE.BoxGeometry(2.6, 0.6, 1.2), mats.paint).position.set(0, 4.1, -0.2);
    const ram = mk(new THREE.BoxGeometry(1.6, 0.5, 0.9), mats.steel);
    ram.position.set(0, 3, -0.2);
    parts.ram = ram;
  } else if (type === 'inspect') {
    mk(new THREE.BoxGeometry(0.3, 3, 0.3), mats.dark).position.set(-1.2, 1.5, 0);
    mk(new THREE.BoxGeometry(0.3, 3, 0.3), mats.dark).position.set(1.2, 1.5, 0);
    mk(new THREE.BoxGeometry(2.7, 0.35, 0.5), mats.dark).position.set(0, 3, 0);
    if (!wire) {
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.06), mats.beam);
      beam.rotation.x = -Math.PI / 2; beam.position.set(0, 1.0, 0);
      g.add(beam); parts.beam = beam;
    }
  } else if (type === 'pack') {
    mk(new THREE.BoxGeometry(2.8, 2.2, 2.4), mats.paint).position.set(0, 1.1, -2.1);
    mk(new THREE.BoxGeometry(1.6, 0.8, 0.1), mats.glass).position.set(0, 1.5, -0.88);
    for (let i = 0; i < 3; i++) {
      mk(new THREE.BoxGeometry(0.7, 0.7, 0.7), mats.box).position.set(-2.2, 0.35 + i * 0.72, -1.8);
    }
  }
  return { group: g, parts };
}

function animateStation(st, parts, t, speed = 1) {
  const k = t * speed;
  if (st.type === 'robot' && parts.turret) {
    parts.turret.rotation.y = Math.sin(k * 0.9) * 1.1;
    parts.shoulder.rotation.z = -0.4 + Math.sin(k * 1.3) * 0.35;
    parts.elbow.rotation.z = 1.0 + Math.sin(k * 1.3 + 1) * 0.4;
  } else if (st.type === 'press' && parts.ram) {
    const p = (Math.sin(k * 2.2) + 1) / 2;
    parts.ram.position.y = 1.5 + p * 1.6;
  } else if (st.type === 'cnc' && parts.spindle) {
    parts.spindle.rotation.y = k * 20;
    parts.spindle.position.x = Math.sin(k * 0.8) * 0.7;
  } else if (st.type === 'inspect' && parts.beam) {
    parts.beam.position.z = Math.sin(k * 3) * 0.5;
  }
}

export function createFactory(container, { onSelect } = {}) {
  const width = () => container.clientWidth || 800;
  const height = () => container.clientHeight || 500;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width(), height());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const labels = new CSS2DRenderer();
  labels.setSize(width(), height());
  labels.domElement.className = 'scene-labels';
  container.appendChild(labels.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 40, 90);
  const camera = new THREE.PerspectiveCamera(45, width() / height(), 0.1, 300);
  const HOME = { pos: new THREE.Vector3(-3, 12, 25), target: new THREE.Vector3(0, 2, 0) };
  const HOME_HIGH = { pos: new THREE.Vector3(-4, 15, 33), target: new THREE.Vector3(0, 5.5, 0) };
  let selected = -1;
  let tween = null;
  let era = 'lights';
  const home = () => (era === 'live-twin' || era === 'physical-ai' ? HOME_HIGH : HOME);
  camera.position.copy(HOME.pos);

  const controls = new OrbitControls(camera, labels.domElement);
  controls.target.copy(HOME.target);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.minDistance = 6;
  controls.maxDistance = 70;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x202020, 0.6);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(12, 24, 14);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -26, right: 26, top: 20, bottom: -20, near: 1, far: 70 });
  scene.add(key);

  const mats = {
    paint: new THREE.MeshStandardMaterial({ color: 0x5f7d63, roughness: 0.7, metalness: 0.2 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xb8bec6, roughness: 0.3, metalness: 0.8 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2c3138, roughness: 0.6, metalness: 0.4 }),
    accent: new THREE.MeshStandardMaterial({ color: 0xe8812f, roughness: 0.5, metalness: 0.3 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x9fd4ff, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.45 }),
    box: new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.9 }),
    beam: new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    wire: new THREE.LineBasicMaterial({ color: 0x5ee7ff, transparent: true, opacity: 0.75 }),
  };
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x3a352d, roughness: 0.95 });

  // Building shell
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(46, 30), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  scene.add(floor);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 1 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(46, 9, 0.4), wallMat);
  backWall.position.set(0, 4.5, -10); backWall.receiveShadow = true;
  scene.add(backWall);
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(36, 0.15), new THREE.MeshBasicMaterial({ color: 0xd8b83a }));
  lane.rotation.x = -Math.PI / 2; lane.position.set(0, 0.01, 3.2);
  scene.add(lane);

  // Conveyor
  const conveyor = new THREE.Mesh(new THREE.BoxGeometry(32, 0.8, 1.2), mats.dark);
  conveyor.position.set(0, 0.4, 0); conveyor.receiveShadow = true; conveyor.castShadow = true;
  scene.add(conveyor);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(32, 0.05, 1.0), new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.9 }));
  belt.position.set(0, 0.83, 0);
  scene.add(belt);

  // Products moving along the line
  const productGeo = new THREE.BoxGeometry(0.6, 0.45, 0.6);
  const products = [];
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(productGeo, new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.5, metalness: 0.5 }));
    m.castShadow = true;
    m.userData.offset = (i / 14) * 32;
    scene.add(m);
    products.push(m);
  }

  // Stations (physical) and their twins (wireframe, floating above)
  const stationObjs = STATIONS.map((st, i) => {
    const phys = buildStation(st.type, mats, false);
    phys.group.position.x = STATION_X[i];
    phys.group.traverse((o) => { o.userData.station = i; });
    scene.add(phys.group);
    const twin = buildStation(st.type, mats, true);
    twin.group.position.set(STATION_X[i], TWIN_Y, 0);
    return { st, phys, twin, i };
  });

  // --- Era layers -------------------------------------------------------
  const layers = {};
  const layer = (id) => { const g = new THREE.Group(); g.visible = false; scene.add(g); layers[id] = g; return g; };

  // Shared live state per station (illustrative simulation)
  const live = STATIONS.map((st, i) => ({
    state: 'green', temp: 48 + i * 3, vib: 1.8 + i * 0.3, oee: 82 + i, cycle: 22 + i * 2, count: 400 + i * 37,
    health: 92 - i * 4, energy: 11 + i * 2.5,
  }));
  live[2].health = 68; // the press is the one drifting toward a fault

  // Andon towers (lights era onward, fading in importance)
  const andons = stationObjs.map(({ i }) => {
    const g = new THREE.Group();
    g.position.set(STATION_X[i] + 1.7, 0, 1.2);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 8), mats.dark);
    pole.position.y = 1.6; g.add(pole);
    const lamps = {};
    ['green', 'yellow', 'red'].forEach((c, k) => {
      const mat = new THREE.MeshStandardMaterial({ color: STATE_COLORS[c], emissive: STATE_COLORS[c], emissiveIntensity: 0.05 });
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.32, 16), mat);
      lamp.position.y = 3.3 + k * 0.34; g.add(lamp);
      lamps[c] = mat;
    });
    const glow = new THREE.PointLight(0xffffff, 0, 5);
    glow.position.y = 3.6; g.add(glow);
    return { g, lamps, glow };
  });
  const andonLayer = layer('andon');
  andons.forEach((a) => andonLayer.add(a.g));

  // Wall andon board
  const board = canvasTexture(512, 160);
  const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.8), new THREE.MeshBasicMaterial({ map: board.tex }));
  boardMesh.position.set(-8, 6.2, -9.78);
  andonLayer.add(boardMesh);

  // Time clock by the entrance
  const clock = new THREE.Group();
  const clockBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.5), new THREE.MeshStandardMaterial({ color: 0x6b4f2e, roughness: 0.6 }));
  clockBody.position.y = 1.7; clock.add(clockBody);
  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), new THREE.MeshBasicMaterial({ color: 0xf2ead8 }));
  clockFace.position.set(0, 1.95, 0.26); clock.add(clockFace);
  const clockPole = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.1, 0.2), mats.dark);
  clockPole.position.y = 0.55; clock.add(clockPole);
  clock.position.set(-19, 0, 7);
  const clockLabel = label('Time clock');
  clockLabel.position.set(0, 2.7, 0); clock.add(clockLabel);
  layer('clock').add(clock);

  // Control room: PLC cabinets and mimic panel
  const plcLayer = layer('plc');
  const plcLeds = [];
  stationObjs.forEach(({ i }) => {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2, 0.6), new THREE.MeshStandardMaterial({ color: 0x8c9399, roughness: 0.6 }));
    cab.position.set(STATION_X[i] - 1.9, 1, 1.4); cab.castShadow = true;
    plcLayer.add(cab);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: 0x37c871 }));
    led.position.set(STATION_X[i] - 1.9, 1.6, 1.71);
    plcLayer.add(led); plcLeds.push(led);
  });
  const mimic = canvasTexture(1024, 256);
  const mimicMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), new THREE.MeshBasicMaterial({ map: mimic.tex }));
  mimicMesh.position.set(9, 5.6, -9.78);
  plcLayer.add(mimicMesh);

  // Connected plant: MES terminals and network cables to a server rack
  const netLayer = layer('network');
  const rack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 1), new THREE.MeshStandardMaterial({ color: 0x23272e, roughness: 0.5, metalness: 0.5 }));
  rack.position.set(-19, 1.6, -7.5); rack.castShadow = true;
  netLayer.add(rack);
  const rackLabel = label('Plant server');
  rackLabel.position.set(-19, 3.8, -7.5); netLayer.add(rackLabel);
  const cableMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.8 });
  const mesLabels = [];
  stationObjs.forEach(({ i }) => {
    const pts = [
      new THREE.Vector3(STATION_X[i] - 1.9, 2.0, 1.4), new THREE.Vector3(STATION_X[i] - 1.9, 7.5, 1.4),
      new THREE.Vector3(STATION_X[i] - 1.9, 7.5, -7.5), new THREE.Vector3(-19, 7.5, -7.5), new THREE.Vector3(-19, 3.2, -7.5),
    ];
    netLayer.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), cableMat));
    const term = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.08), new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x1e3a8a, emissiveIntensity: 0.6 }));
    term.position.set(STATION_X[i] + 1.0, 1.9, 2.0); term.rotation.x = -0.3;
    netLayer.add(term);
    const lbl = label('', 'scene-label scene-label--mes');
    lbl.position.set(STATION_X[i] + 1.0, 2.6, 2.0);
    netLayer.add(lbl); mesLabels.push(lbl);
  });

  // Sensors era: pulsing sensor rings and floating dashboards
  const sensorLayer = layer('sensors');
  const rings = [];
  stationObjs.forEach(({ i }) => {
    for (let k = 0; k < 2; k++) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.38, 32), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, side: THREE.DoubleSide }));
      ring.position.set(STATION_X[i] + (k ? 0.8 : -0.8), 2.6 + k * 0.4, -0.7);
      ring.userData.phase = Math.random() * Math.PI * 2;
      sensorLayer.add(ring); rings.push(ring);
    }
  });
  const dashLabels = stationObjs.map(({ i }) => {
    const lbl = label('', 'scene-label scene-label--dash');
    lbl.position.set(STATION_X[i], 5.4, 0);
    sensorLayer.add(lbl);
    return lbl;
  });

  // Live twin: wireframe copy floating above, bidirectional data streams
  const twinLayer = layer('twin');
  const twinFloor = new THREE.Mesh(new THREE.PlaneGeometry(34, 10), new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.06, side: THREE.DoubleSide }));
  twinFloor.rotation.x = -Math.PI / 2; twinFloor.position.set(0, TWIN_Y - 0.01, -1);
  twinLayer.add(twinFloor);
  const grid = new THREE.GridHelper(34, 34, 0x38bdf8, 0x1e3a5f);
  grid.position.set(0, TWIN_Y, -1); grid.scale.z = 10 / 34;
  grid.material.transparent = true; grid.material.opacity = 0.35;
  twinLayer.add(grid);
  const twinConveyor = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(32, 0.8, 1.2)), mats.wire);
  twinConveyor.position.set(0, TWIN_Y + 0.4, 0);
  twinLayer.add(twinConveyor);
  stationObjs.forEach((s) => twinLayer.add(s.twin.group));
  const particleGeo = new THREE.SphereGeometry(0.09, 8, 8);
  const upMat = new THREE.MeshBasicMaterial({ color: 0x5ee7ff });
  const downMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const particles = [];
  stationObjs.forEach(({ i }) => {
    for (let k = 0; k < 6; k++) {
      const up = k % 2 === 0;
      const p = new THREE.Mesh(particleGeo, up ? upMat : downMat);
      p.userData = { i, up, phase: k / 6, dx: up ? -0.5 : 0.5 };
      twinLayer.add(p); particles.push(p);
    }
  });
  const kpiLabels = stationObjs.map(({ i }) => {
    const lbl = label('', 'scene-label scene-label--kpi');
    lbl.position.set(STATION_X[i], TWIN_Y + (i % 2 ? 5.4 : 3.9), 0);
    twinLayer.add(lbl);
    return lbl;
  });

  // Physical AI: a grid of randomized simulated training worlds
  const simLayer = layer('sim');
  const sims = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      const cell = new THREE.Group();
      cell.position.set(-12 + c * 6, TWIN_Y + r * 0.01, -6 + r * 4.6);
      const plat = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.15, 3.6), new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.85 }));
      cell.add(plat);
      const cellMats = {
        paint: mats.paint, steel: mats.steel, glass: mats.glass, box: mats.box, beam: mats.beam, wire: mats.wire,
        dark: new THREE.MeshStandardMaterial({ color: 0x2c3138 }),
        accent: new THREE.MeshStandardMaterial({ color: 0xe8812f }),
      };
      const robot = buildStation('robot', cellMats, false);
      robot.group.scale.setScalar(0.65);
      robot.group.position.set(0, 0.07, 1.0);
      cell.add(robot.group);
      const part = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), new THREE.MeshStandardMaterial({ color: 0x8a8f96 }));
      part.position.set(1.2, 0.3, 0.2);
      cell.add(part);
      const n = r * 5 + c + 1;
      const lbl = label(`sim ${String(n).padStart(3, '0')}`, 'scene-label scene-label--sim');
      lbl.position.set(-1.7, 0.6, 1.5);
      cell.add(lbl);
      simLayer.add(cell);
      sims.push({ cell, robot, part, plat, cellMats, phase: Math.random() * 6, speed: 0.7 + Math.random() * 0.8 });
    }
  }

  // Workers
  const workerMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.7 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xe9c9a8, roughness: 0.8 });
  const hatMat = new THREE.MeshStandardMaterial({ color: 0xf5c518, roughness: 0.5 });
  const workers = [];
  for (let w = 0; w < 6; w++) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.9, 4, 10), workerMat);
    body.position.y = 0.75; body.castShadow = true; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), headMat);
    head.position.y = 1.55; g.add(head);
    const hat = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), hatMat);
    hat.position.y = 1.6; g.add(hat);
    g.userData = { from: new THREE.Vector3(), to: new THREE.Vector3(), t: 1, speed: 0.15 + Math.random() * 0.1 };
    g.position.set(-14 + w * 5, 0, 3.5);
    scene.add(g); workers.push(g);
  }
  function pickTarget(wk) {
    const red = live.findIndex((l) => l.state === 'red');
    const i = red >= 0 && Math.random() < 0.5 ? red : Math.floor(Math.random() * STATIONS.length);
    wk.userData.from.copy(wk.position);
    wk.userData.to.set(STATION_X[i] + (Math.random() - 0.5) * 3, 0, 2.2 + Math.random() * 2.5);
    wk.userData.t = 0;
  }

  // Era switching
  const ERA_LAYERS = {
    'lights': ['andon', 'clock'],
    'control-room': ['andon', 'plc'],
    'connected': ['andon', 'plc', 'network'],
    'sensors': ['network', 'sensors'],
    'live-twin': ['twin'],
    'physical-ai': ['sim'],
  };
  const bg = new THREE.Color();
  const bgTarget = new THREE.Color();
  function setEra(id) {
    if (!ERA_LOOK[id]) return;
    era = id;
    const look = ERA_LOOK[id];
    Object.entries(layers).forEach(([k, g]) => { g.visible = ERA_LAYERS[id].includes(k); });
    bgTarget.set(look.bg);
    scene.fog.color.set(look.fog);
    hemi.color.set(look.amb); hemi.intensity = look.ambI;
    key.color.set(look.key); key.intensity = look.keyI;
    mats.paint.color.set(look.paint);
    floorMat.color.set(look.floor);
    workers.forEach((w, k) => { w.visible = k < look.workers; });
    if (selected < 0) flyTo(home().pos.clone(), home().target.clone(), 900);
  }
  bg.set(ERA_LOOK.lights.bg);
  scene.background = bg;
  setEra('lights');

  // Picking
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const pickables = [];
  stationObjs.forEach((s) => s.phys.group.traverse((o) => { if (o.isMesh) pickables.push(o); }));
  let hovered = -1;
  let downAt = null;
  function pick(ev) {
    const rect = labels.domElement.getBoundingClientRect();
    pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    return hit ? hit.object.userData.station : -1;
  }
  const onMove = (ev) => {
    hovered = pick(ev);
    labels.domElement.style.cursor = hovered >= 0 ? 'pointer' : '';
  };
  const onDown = (ev) => { downAt = { x: ev.clientX, y: ev.clientY }; };
  const onUp = (ev) => {
    if (!downAt) return;
    const moved = Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y);
    downAt = null;
    if (moved > 5) return;
    const i = pick(ev);
    if (i >= 0) select(i);
  };
  labels.domElement.addEventListener('pointermove', onMove);
  labels.domElement.addEventListener('pointerdown', onDown);
  labels.domElement.addEventListener('pointerup', onUp);

  // Camera tweening
  function flyTo(pos, target, ms = 1100) {
    tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, start: performance.now(), ms };
  }
  function select(i) {
    selected = i;
    const x = STATION_X[i];
    const high = era === 'live-twin' || era === 'physical-ai';
    flyTo(new THREE.Vector3(x + 5, high ? 9 : 5.5, 10), new THREE.Vector3(x, high ? 4.5 : 1.8, 0));
    onSelect && onSelect(i);
  }
  function reset() {
    selected = -1;
    flyTo(home().pos.clone(), home().target.clone());
    onSelect && onSelect(-1);
  }

  // Illustrative live data
  function tickLive() {
    live.forEach((l, i) => {
      const r = Math.random();
      if (l.state === 'green' && r < 0.04) l.state = i === 2 ? 'red' : 'yellow';
      else if (l.state !== 'green' && r < 0.25) l.state = 'green';
      l.temp += (Math.random() - 0.5) * 0.8 + (i === 2 ? 0.05 : 0);
      if (l.temp > 74) l.temp = 62;
      l.vib = Math.max(0.8, l.vib + (Math.random() - 0.5) * 0.2);
      l.oee = Math.min(97, Math.max(65, l.oee + (Math.random() - 0.5) * 1.5 - (l.state === 'red' ? 2 : 0)));
      l.cycle = Math.max(15, l.cycle + (Math.random() - 0.5) * 0.6);
      l.energy = Math.max(6, l.energy + (Math.random() - 0.5) * 0.4);
      if (l.state === 'green') l.count += 1;
    });
    drawBoard(); drawMimic();
    live.forEach((l, i) => {
      mesLabels[i].element.innerHTML = `WO-${1040 + i} · ${l.count} pcs`;
      dashLabels[i].element.innerHTML = `<b>${STATIONS[i].name}</b><br>${l.temp.toFixed(1)} °C · ${l.vib.toFixed(1)} mm/s<br>health ${l.health}/100${i === 2 ? ' <span class="warn">⚠ service in ~5 days</span>' : ''}`;
      kpiLabels[i].element.innerHTML = `<b>${STATIONS[i].name}</b><br>OEE ${l.oee.toFixed(0)}% · ${l.cycle.toFixed(1)} s<br>${l.temp.toFixed(1)} °C · ${l.energy.toFixed(1)} kW`;
    });
  }
  function drawBoard() {
    const { ctx, tex, canvas } = board;
    ctx.fillStyle = '#16130f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e9dcc3'; ctx.font = 'bold 22px monospace';
    ctx.fillText('LINE 1 · ANDON', 16, 30);
    live.forEach((l, i) => {
      const x = 16 + i * 98;
      ctx.fillStyle = '#' + STATE_COLORS[l.state].toString(16).padStart(6, '0');
      ctx.fillRect(x, 48, 84, 70);
      ctx.fillStyle = '#16130f'; ctx.font = 'bold 18px monospace';
      ctx.fillText(String(i + 1), x + 36, 92);
      ctx.fillStyle = '#e9dcc3'; ctx.font = '13px monospace';
      ctx.fillText(STATIONS[i].name.split(' ')[0].toUpperCase().slice(0, 10), x, 140);
    });
    tex.needsUpdate = true;
  }
  function drawMimic() {
    const { ctx, tex, canvas } = mimic;
    ctx.fillStyle = '#1f3b33'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#d7e7da'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(60, 150); ctx.lineTo(964, 150); ctx.stroke();
    ctx.fillStyle = '#d7e7da'; ctx.font = 'bold 26px monospace';
    ctx.fillText('MIMIC PANEL · LINE 1', 60, 50);
    live.forEach((l, i) => {
      const x = 120 + i * 190;
      ctx.fillStyle = '#d7e7da'; ctx.fillRect(x - 50, 120, 100, 60);
      ctx.fillStyle = '#' + STATE_COLORS[l.state].toString(16).padStart(6, '0');
      ctx.beginPath(); ctx.arc(x, 150, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d7e7da'; ctx.font = '18px monospace';
      ctx.fillText(`M${i + 1}`, x - 16, 215);
    });
    tex.needsUpdate = true;
  }
  tickLive();
  const liveTimer = setInterval(tickLive, 1000);

  // Render loop
  const clockT = new THREE.Clock();
  let raf = 0;
  let simTimer = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clockT.getDelta(), 0.05);
    const t = clockT.elapsedTime;
    bg.lerp(bgTarget, 0.06);

    if (tween) {
      const k = Math.min(1, (performance.now() - tween.start) / tween.ms);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      camera.position.lerpVectors(tween.p0, tween.p1, e);
      controls.target.lerpVectors(tween.t0, tween.t1, e);
      if (k >= 1) tween = null;
    }

    stationObjs.forEach((s) => {
      const running = live[s.i].state !== 'red';
      if (running) {
        animateStation(s.st, s.phys.parts, t);
        animateStation(s.st, s.twin.parts, t);
      }
      const hot = s.i === hovered || s.i === selected;
      s.phys.group.position.y = hot ? 0.08 : 0;
    });

    products.forEach((p) => {
      const x = ((p.userData.offset + t * 1.6) % 32) - 16;
      p.position.set(x, 1.08, 0);
      const c = era === 'physical-ai' ? null : x > 12 ? 0xb08a5a : x > 0 ? 0xc5cbd3 : 0x8a8f96;
      if (c !== null) p.material.color.setHex(c);
    });

    andons.forEach((a, i) => {
      const st = live[i].state;
      Object.entries(a.lamps).forEach(([c, m]) => {
        const on = c === st;
        m.emissiveIntensity = on ? (st === 'red' ? 1.2 + Math.sin(t * 8) * 0.6 : 1.4) : 0.05;
      });
      a.glow.color.setHex(STATE_COLORS[st]);
      a.glow.intensity = era === 'lights' ? 3 : 1.2;
    });
    plcLeds.forEach((led, i) => led.material.color.setHex(STATE_COLORS[live[i].state]));

    rings.forEach((r) => {
      const k = ((t * 0.8 + r.userData.phase) % 1);
      r.scale.setScalar(1 + k * 2.5);
      r.material.opacity = 0.9 * (1 - k);
      r.lookAt(camera.position);
    });

    particles.forEach((p) => {
      const { i, up, phase, dx } = p.userData;
      const k = (t * 0.45 + phase) % 1;
      const y = up ? 2.8 + k * (TWIN_Y - 2.8) : TWIN_Y - k * (TWIN_Y - 2.8);
      p.position.set(STATION_X[i] + dx, y, 0.9);
    });

    if (era === 'physical-ai') {
      simTimer += dt;
      const shuffle = simTimer > 0.7;
      if (shuffle) simTimer = 0;
      sims.forEach((s) => {
        animateStation({ type: 'robot' }, s.robot.parts, t + s.phase, s.speed);
        if (shuffle) {
          s.cellMats.accent.color.setHSL(Math.random(), 0.65, 0.55);
          s.part.material.color.setHSL(Math.random(), 0.5, 0.5);
          s.part.position.x = 0.8 + Math.random() * 0.9;
          s.plat.material.color.setHSL(0.6 + Math.random() * 0.2, 0.25, 0.18 + Math.random() * 0.15);
        }
      });
      products.forEach((p) => { if (shuffle) p.material.color.setHSL(Math.random(), 0.5, 0.55); });
    }

    workers.forEach((w) => {
      if (!w.visible) return;
      const u = w.userData;
      if (u.t >= 1) { pickTarget(w); }
      const dist = u.from.distanceTo(u.to) || 1;
      u.t = Math.min(1, u.t + (u.speed * dt * 6) / dist);
      w.position.lerpVectors(u.from, u.to, u.t);
      w.position.y = Math.abs(Math.sin(u.t * dist * 3)) * 0.05;
      if (Math.hypot(u.to.x - w.position.x, u.to.z - w.position.z) > 0.2) w.lookAt(u.to.x, w.position.y, u.to.z);
    });

    controls.update();
    renderer.render(scene, camera);
    labels.render(scene, camera);
  }
  frame();

  const ro = new ResizeObserver(() => {
    camera.aspect = width() / height();
    camera.updateProjectionMatrix();
    renderer.setSize(width(), height());
    labels.setSize(width(), height());
  });
  ro.observe(container);

  return {
    setEra,
    select,
    reset,
    getLive: (i) => ({ ...live[i] }),
    get era() { return era; },
    dispose() {
      cancelAnimationFrame(raf);
      clearInterval(liveTimer);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((o) => { o.geometry && o.geometry.dispose(); });
      container.innerHTML = '';
    },
  };
}

export const FACTORY_ERAS = ERA_ORDER;
