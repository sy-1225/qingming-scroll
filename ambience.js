(() => {
  const button = document.getElementById('ambience');
  const audio = document.getElementById('market-sound');
  let muted = false;
  try { muted = localStorage.getItem('qingming-muted') === '1'; } catch {}
  let fade;
  audio.volume = 0;
  function update() {
    const playing = !audio.paused && !muted;
    button.setAttribute('aria-pressed', String(playing));
    button.title = playing ? '关闭市集环境声' : '开启市集环境声';
    button.setAttribute('aria-label', button.title);
  }
  function play() {
    if (muted || document.hidden || !audio.paused) return;
    audio.volume = 0;
    audio.play().catch(update);
  }
  audio.addEventListener('playing', () => {
    clearInterval(fade);
    update();
    fade = setInterval(() => {
      audio.volume = Math.min(.19, audio.volume + .01);
      if (audio.volume >= .19) clearInterval(fade);
    }, 90);
  });
  audio.addEventListener('pause', () => { clearInterval(fade); update(); });
  button.addEventListener('click', () => {
    muted = !audio.paused;
    try { localStorage.setItem('qingming-muted', muted ? '1' : '0'); } catch {}
    if (muted) audio.pause(); else play();
    update();
  });
  function unlock(e) { if (!button.contains(e.target)) play(); }
  document.addEventListener('click', unlock);
  document.addEventListener('pointerup', unlock);
  document.addEventListener('keydown', unlock);
  document.addEventListener('visibilitychange', () => document.hidden ? audio.pause() : play());
  update();
  play();
})();
