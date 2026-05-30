import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {mergeBufferGeometries} from "three/addons/utils/BufferGeometryUtils.js";

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

console.clear();

class Postprocessing {
  constructor(scene, camera, renderer) {
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.25,
      0.25,
      0.0001
    );
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(bloomPass);
  }
  
  render(dt) {
    this.composer.render(dt);
  }
}

class NightLight {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // Transparent background
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 20;

    this.addObjects();
    this.post = new Postprocessing(this.scene, this.camera, this.renderer);

    this.time = 0;
    this.raf();

    window.addEventListener("resize", this.onResize.bind(this));
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.post.composer.setSize(this.width, this.height);
  }

  addObjects() {
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.light.position.set(5, 10, 7.5);
    this.scene.add(this.light);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    const baseGeom = new THREE.CylinderGeometry(2.5, 3, 0.5, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.y = -0.25;
    this.scene.add(baseMesh);

    const lightGeom = new THREE.SphereGeometry(0.1, 16, 16);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.lightMesh = new THREE.Mesh(lightGeom, lightMat);
    this.lightMesh.position.set(0, 0.5, 0);
    this.scene.add(this.lightMesh);

    this.curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(2, 3, 0),
      new THREE.Vector3(-2, 6, 0),
      new THREE.Vector3(0, 9, 0),
      new THREE.Vector3(2, 12, 0),
      new THREE.Vector3(-2, 15, 0),
      new THREE.Vector3(0, 18, 0)
    ]);

    const tubeGeom = new THREE.TubeGeometry(this.curve, 64, 0.05, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    this.tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    this.scene.add(this.tubeMesh);
    
    this.particles = [];
    const particleCount = 100;
    const particleGeom = new THREE.SphereGeometry(0.05, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeom, particleMat);
      particle.userData.t = i / particleCount;
      this.particles.push(particle);
      this.scene.add(particle);
    }
  }

  animateParticles() {
    this.particles.forEach(particle => {
      particle.userData.t += 0.005;
      if (particle.userData.t > 1) {
        particle.userData.t = 0;
      }
      const position = this.curve.getPoint(particle.userData.t);
      particle.position.copy(position);
    });
  }

  raf() {
    this.time += 0.01;
    this.controls.update();
    this.animateParticles();
    this.post.render(this.time);
    requestAnimationFrame(this.raf.bind(this));
  }
}

new NightLight(document.getElementById("abstract-sphere-container"));
