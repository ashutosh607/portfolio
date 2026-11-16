if (/^\/admin(?:\/|$)/.test(location.pathname)) {
  const boot = document.getElementById('initial-word-boot');
  if (boot) {
    boot.textContent = 'SHINOBI ADMIN';
    boot.style.cssText += 'color:#e68a2e;font:700 14px sans-serif;letter-spacing:0.16em';
  }
}
