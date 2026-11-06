import * as THREE from 'three';

// The DOM remains the accessible source of truth. Only a moving sheet is rasterized.
// Computed styles make both faces match their resting HTML pages without a second UI.
async function photographPage(element) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const clone = element.cloneNode(true);
  const originals = [element, ...element.querySelectorAll('*')];
  const copies = [clone, ...clone.querySelectorAll('*')];
  originals.forEach((node, index) => {
    const style = getComputedStyle(node);
    for (const property of style) {
      if (/^(animation|transition|scroll|view-|timeline|anchor|contain|container|cursor|touch|pointer|caret|content-visibility|interpolate)/.test(property)) continue;
      copies[index].style.setProperty(property, style.getPropertyValue(property));
    }
    copies[index].style.visibility = 'visible';
    copies[index].style.animation = 'none';
    copies[index].style.transition = 'none';
    copies[index].removeAttribute('id');
  });
  Object.assign(clone.style, { position: 'relative', left: '0', top: '0', margin: '0', visibility: 'visible', display: 'flex', transform: 'none', width: `${width}px`, height: `${height}px` });
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  const markup = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${markup}</foreignObject></svg>`;
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  const scale = Math.min(2, 1600 / height);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  // Check security before handing this to WebGL, so failure can recover cleanly.
  canvas.getContext('2d').getImageData(0, 0, 1, 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

// Integrate an inextensible strip from the bound edge. The varying tangent angle
// delays the spine while lifting the free edge; endpoints are exactly flat.
export function sheetPoint(u, v, progress, width, height) {
  const bend = Math.sin(Math.PI * progress);
  let x = 0;
  let z = 0;
  const steps = 32;
  for (let i = 0; i < steps; i++) {
    const s = u * (i + 0.5) / steps;
    const angle = Math.PI * progress + bend * (1.15 * Math.sin(Math.PI * s) - 0.65 * (1 - s) + 0.65 * v * s);
    x += Math.cos(angle) * width * u / steps;
    z += Math.sin(angle) * width * u / steps;
  }
  z += bend * 0.035 * width * Math.sin(Math.PI * u) * (v * v);
  return [x, v * height + bend * width * 0.04 * Math.sin(Math.PI * u), Math.max(0, z)];
}

export class PageTurnSurface {
  constructor(host) {
    this.host = host;
    this.disposed = false;
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    host.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AmbientLight(0xffffff, 2.8));
    this.light = new THREE.DirectionalLight(0xfff4e5, 0.45);
    this.light.position.set(-200, 500, 900);
    this.light.castShadow = true;
    this.light.shadow.mapSize.set(1024, 1024);
    this.light.shadow.bias = -0.0005;
    this.light.shadow.radius = 3;
    this.scene.add(this.light);
    this.geometry = new THREE.PlaneGeometry(1, 1, 64, 12);
    this.frontMaterial = new THREE.MeshStandardMaterial({ roughness: 0.95, side: THREE.FrontSide });
    this.backMaterial = new THREE.MeshStandardMaterial({ roughness: 0.95, side: THREE.BackSide });
    this.front = new THREE.Mesh(this.geometry, this.frontMaterial);
    this.backGeometry = this.geometry.clone();
    const uv = this.backGeometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    this.back = new THREE.Mesh(this.backGeometry, this.backMaterial);
    this.front.castShadow = this.back.castShadow = true;
    this.scene.add(this.front, this.back);
    this.shadowGeometry = new THREE.PlaneGeometry(1, 1);
    this.shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.08 });
    this.shadow = new THREE.Mesh(this.shadowGeometry, this.shadowMaterial);
    this.shadow.receiveShadow = true;
    this.shadow.position.z = -1;
    this.scene.add(this.shadow);
    // A diffuse contact shadow complements the sharp silhouette from the key light.
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const context = shadowCanvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(42, 23, 10, 0.38)');
    gradient.addColorStop(0.45, 'rgba(42, 23, 10, 0.17)');
    gradient.addColorStop(1, 'rgba(42, 23, 10, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    this.contactTexture = new THREE.CanvasTexture(shadowCanvas);
    this.contactMaterial = new THREE.MeshBasicMaterial({ map: this.contactTexture, transparent: true, depthWrite: false, opacity: 0 });
    this.contactShadow = new THREE.Mesh(this.shadowGeometry, this.contactMaterial);
    this.contactShadow.position.z = -0.5;
    this.scene.add(this.contactShadow);
    this.front.frustumCulled = this.back.frustumCulled = false;

  }

  async prepare(frontPage, backPage, mobile, direction) {
    const results = await Promise.allSettled([photographPage(frontPage), photographPage(backPage)]);
    if (this.disposed || results.some(result => result.status === 'rejected')) {
      results.forEach(result => { if (result.status === 'fulfilled') result.value.dispose(); });
      throw new Error('Page texture unavailable');
    }
    this.frontMaterial.map?.dispose();
    this.backMaterial.map?.dispose();
    this.frontMaterial.map = results[0].value;
    this.backMaterial.map = results[1].value;
    this.frontMaterial.needsUpdate = this.backMaterial.needsUpdate = true;
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    this.width = mobile ? width : width / 2;
    this.height = height;
    this.mobile = mobile;
    this.direction = direction;
    this.renderer.setSize(width, height);
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 5000);
    this.camera.position.z = 2000;
    this.shadow.scale.set(width, height, 1);
    Object.assign(this.light.shadow.camera, { left: -width, right: width, top: height, bottom: -height, near: 1, far: 2500 });
    this.light.shadow.camera.updateProjectionMatrix();
    this.render(direction > 0 ? 0 : 1);
  }

  render(progress) {
    if (this.disposed) return;
    const frontPosition = this.geometry.attributes.position;
    const backPosition = this.backGeometry.attributes.position;
    const offset = this.mobile ? this.width * (progress - 0.5) : 0;
    // Compute each point once for both faces. Normals are shared, UVs remain distinct.
    for (let i = 0; i < frontPosition.count; i++) {
      const col = i % 65;
      const row = Math.floor(i / 65);
      const [x, y, z] = sheetPoint(col / 64, 0.5 - row / 12, progress, this.width, this.height);
      frontPosition.setXYZ(i, x + offset, y, z + 0.18);
      backPosition.setXYZ(i, x + offset, y, z - 0.18);
    }
    frontPosition.needsUpdate = backPosition.needsUpdate = true;
    this.geometry.computeVertexNormals();
    this.backGeometry.attributes.normal.array.set(this.geometry.attributes.normal.array);
    this.backGeometry.attributes.normal.needsUpdate = true;
    const lift = Math.sin(Math.PI * progress);
    const center = sheetPoint(0.55, 0, progress, this.width, this.height);
    this.contactShadow.position.x = center[0] + offset + lift * this.width * 0.12;
    this.contactShadow.scale.set(this.width * (0.35 + lift * 0.9), this.height * 1.15, 1);
    this.contactMaterial.opacity = lift * 0.65;
    this.shadowMaterial.opacity = lift * 0.08;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    this.frontMaterial.map?.dispose();
    this.backMaterial.map?.dispose();
    [this.geometry, this.backGeometry, this.shadowGeometry, this.frontMaterial, this.backMaterial, this.shadowMaterial].forEach(item => item.dispose());
    this.contactTexture.dispose();
    this.contactMaterial.dispose();
    this.light.shadow.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
