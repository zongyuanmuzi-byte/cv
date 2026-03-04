import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, model;
let targetRotY = 0;
let targetRotX = 0;

function init() {
  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.1, 4.2);

  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#three-canvas'),
    antialias: true,
    alpha: true
  });

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.4 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // three 新版本：用 useLegacyLights
  renderer.useLegacyLights = false;

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Lights (subtle, background-friendly)
  scene.add(new THREE.AmbientLight(0xffffff, 0.16));

  const key = new THREE.DirectionalLight(0xfff2d6, 1.8);
  key.position.set(4, 6, 6);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x8ab6ff, 0.42);
  fill.position.set(-4, 2, 5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0x7c3aed, 1.2);
  rim.position.set(-6, 5, -6);
  scene.add(rim);

  // Parallax
  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    targetRotY = x * 0.18;
    targetRotX = -y * 0.06;
  }, { passive: true });

  // Load model
  const loader = new GLTFLoader();
  loader.load(
    'business_man.glb',
    (gltf) => {
      model = gltf.scene;

      // Make it background: slightly smaller + lower
      model.scale.set(1.35, 1.35, 1.35);
      model.position.set(0, -1.15, 0);

      model.traverse((child) => {
        if (child.isMesh && child.material) {
          if (child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace;
          child.material.needsUpdate = true;
        }
      });

      scene.add(model);
      document.getElementById('modelLoading')?.remove();
      console.log('✅ 3D model loaded.');
    },
    undefined,
    (err) => {
      console.error('❌ model load error:', err);
      const el = document.getElementById('modelLoading');
      if (el) el.textContent = '3D load failed';
    }
  );

  window.addEventListener('resize', onResize);
  animate();
}

function animate() {
  requestAnimationFrame(animate);

  if (model) {
    // slow idle + smooth parallax
    model.rotation.y += 0.0009;
    model.rotation.y += (targetRotY - model.rotation.y) * 0.02;
    model.rotation.x += (targetRotX - model.rotation.x) * 0.02;
  }

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.4 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();