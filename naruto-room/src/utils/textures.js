import * as THREE from 'three';

// Cache generated textures so they are created once
const textureCache = new Map();

/**
 * Generates an authentic Japanese Kakemono hanging scroll texture
 * featuring the kanji "忍" (Shinobi) and Konoha leaf swirl seal.
 */
export function getCalligraphyScrollTexture() {
  if (textureCache.has('calligraphy')) {
    return textureCache.get('calligraphy');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Background: Aged parchment washi paper
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#f2ece1');
  bgGrad.addColorStop(0.5, '#ede4d3');
  bgGrad.addColorStop(1, '#e3d8c1');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Silk mounting borders (Top and Bottom dark brocade)
  ctx.fillStyle = '#2b303c';
  ctx.fillRect(0, 0, canvas.width, 100);
  ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

  // Gold accent trim
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(0, 96, canvas.width, 6);
  ctx.fillRect(0, canvas.height - 102, canvas.width, 6);

  // Subtle paper grain/fiber noise
  ctx.fillStyle = 'rgba(120, 100, 70, 0.04)';
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * canvas.width;
    const ry = 100 + Math.random() * (canvas.height - 200);
    const rw = 1 + Math.random() * 3;
    const rh = 1 + Math.random() * 2;
    ctx.fillRect(rx, ry, rw, rh);
  }

  // Konoha Spiral Emblem at the top center
  ctx.save();
  ctx.translate(canvas.width / 2, 220);
  ctx.strokeStyle = 'rgba(180, 50, 30, 0.85)';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // Draw Konoha leaf swirl
  for (let a = 0; a < Math.PI * 3.5; a += 0.1) {
    const r = 4 + a * 9;
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Little Konoha leaf triangle spout
  ctx.fillStyle = 'rgba(180, 50, 30, 0.85)';
  ctx.beginPath();
  ctx.moveTo(35, 12);
  ctx.lineTo(55, 30);
  ctx.lineTo(40, 35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Big Calligraphy "忍" (Shinobi)
  ctx.save();
  ctx.fillStyle = '#111113';
  ctx.font = '900 240px "Yu Mincho", "Hiragino Mincho ProN", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 8;
  ctx.fillText('忍', canvas.width / 2, 530);
  ctx.restore();

  // Subtitle / Japanese text: "木ノ葉隠れの里" (Konohagakure no Sato)
  ctx.save();
  ctx.fillStyle = 'rgba(30, 25, 25, 0.75)';
  ctx.font = '600 32px "Yu Mincho", serif';
  ctx.textAlign = 'center';
  ctx.fillText('木ノ葉隠れの道場', canvas.width / 2, 720);
  ctx.restore();

  // Red Hanko (Vermilion seal stamp)
  ctx.save();
  ctx.strokeStyle = '#c42b1c';
  ctx.lineWidth = 4;
  ctx.strokeRect(canvas.width / 2 - 32, 770, 64, 64);
  ctx.fillStyle = 'rgba(196, 43, 28, 0.12)';
  ctx.fillRect(canvas.width / 2 - 32, 770, 64, 64);
  ctx.fillStyle = '#c42b1c';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('火影', canvas.width / 2, 802);
  ctx.restore();

  // Wooden bottom roller rod
  ctx.fillStyle = '#1c1510';
  ctx.fillRect(15, canvas.height - 24, canvas.width - 30, 18);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  textureCache.set('calligraphy', texture);
  return texture;
}

/**
 * Generates an authentic Japanese Tatami mat texture with woven rush grass pattern
 */
export function getTatamiTexture() {
  if (textureCache.has('tatami')) {
    return textureCache.get('tatami');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base rush grass golden-olive tone
  ctx.fillStyle = '#a69a68';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Woven igusa rush texture (fine horizontal ribs)
  for (let y = 0; y < canvas.height; y += 4) {
    const isDark = (y / 4) % 2 === 0;
    ctx.fillStyle = isDark ? 'rgba(70, 60, 30, 0.12)' : 'rgba(255, 250, 220, 0.1)';
    ctx.fillRect(0, y, canvas.width, 3);
  }

  // Subtle longitudinal grass variation
  for (let x = 0; x < canvas.width; x += 12) {
    const shade = (Math.sin(x * 0.15) + 1) * 0.04;
    ctx.fillStyle = `rgba(0, 0, 0, ${shade})`;
    ctx.fillRect(x, 0, 8, canvas.height);
  }

  // Dark cloth border hems (Heri) along the long sides
  const borderWidth = 36;
  // Left border
  ctx.fillStyle = '#1f2d22'; // Dark moss green / black traditional brocade
  ctx.fillRect(0, 0, borderWidth, canvas.height);
  // Right border
  ctx.fillRect(canvas.width - borderWidth, 0, borderWidth, canvas.height);

  // Gold decorative thread on border edges
  ctx.fillStyle = '#c5a059';
  ctx.fillRect(borderWidth - 3, 0, 3, canvas.height);
  ctx.fillRect(canvas.width - borderWidth, 0, 3, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  textureCache.set('tatami', texture);
  return texture;
}

/**
 * Generates polished Japanese cedar / Hinoki wood plank texture
 */
export function getWoodPlankTexture() {
  if (textureCache.has('wood')) {
    return textureCache.get('wood');
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Rich warm cedar base
  ctx.fillStyle = '#452714';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Planks across X
  const plankWidth = 128;
  for (let x = 0; x < canvas.width; x += plankWidth) {
    // Plank color variation
    const tone = ((x / plankWidth) % 3) * 12;
    ctx.fillStyle = `rgba(${60 + tone}, ${35 + tone * 0.5}, ${15}, 0.25)`;
    ctx.fillRect(x, 0, plankWidth, canvas.height);

    // Fine wood grain lines along Y
    for (let i = 0; i < 30; i++) {
      const gx = x + Math.random() * plankWidth;
      ctx.fillStyle = 'rgba(20, 10, 5, 0.12)';
      ctx.fillRect(gx, 0, 2 + Math.random() * 3, canvas.height);
    }

    // Plank seam / groove
    ctx.fillStyle = 'rgba(10, 5, 2, 0.8)';
    ctx.fillRect(x, 0, 4, canvas.height);
    ctx.fillStyle = 'rgba(255, 200, 150, 0.08)';
    ctx.fillRect(x + 4, 0, 2, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  textureCache.set('wood', texture);
  return texture;
}
