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

// Each narrow panel carries matching slices of the two live page faces.
// This keeps text, images and scroll offsets intact without screenshot capture.
export class PageTurnSurface {
  constructor(host) {
    this.host = host;
    this.panels = [];
  }

  prepare(front, back, mobile, direction) {
    this.dispose();
    const width = this.host.clientWidth / (mobile ? 1 : 2);
    this.width = width;
    this.mobile = mobile;
    this.height = this.host.clientHeight;
    const count = mobile ? 6 : 12;
    const step = width / count;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const panel = document.createElement('div');
      panel.className = 'ramen-sheet-panel';
      panel.style.width = (step + 0.65) + 'px';
      for (const [source, reverse] of [[front, false], [back, true]]) {
        const face = document.createElement('div');
        face.className = 'ramen-sheet-face' + (reverse ? ' verso' : '');
        const copy = source.cloneNode(true);
        copy.style.width = width + 'px';
        copy.style.left = -(reverse ? count - i - 1 : i) * step + 'px';
        copy.setAttribute('inert', '');
        copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        face.append(copy);
        panel.append(face);
      }
      fragment.append(panel);
      this.panels.push(panel);
    }
    this.host.append(fragment);
    this.panels.forEach(panel => {
      [front, back].forEach((source, i) => {
        const scroller = panel.children[i].querySelector('.menu-page-body');
        if (scroller) scroller.scrollTop = source.querySelector('.menu-page-body')?.scrollTop || 0;
        panel.children[i].firstChild.scrollTop = source.scrollTop;
      });
    });
    this.render(direction > 0 ? 0 : 1);
  }

  render(progress) {
    const { width, height, panels } = this;
    const hinge = this.mobile ? width * progress : 0;
    let previous = [0, 0, 0];
    panels.forEach((panel, i) => {
      const next = sheetPoint((i + 1) / panels.length, 0, progress, width, height);
      const angle = Math.atan2(next[2] - previous[2], next[0] - previous[0]);
      panel.style.transform = `translate3d(${hinge + previous[0]}px,0,${previous[2]}px) rotateY(${-angle}rad)`;
      panel.style.setProperty('--shade', (0.16 * Math.abs(Math.sin(angle))).toFixed(3));
      previous = next;
    });
    this.host.style.setProperty('--cast-shadow', (Math.sin(Math.PI * progress) * .32).toFixed(3));
  }

  dispose() {
    this.host.replaceChildren();
    this.panels = [];
  }
}
