const storyObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    storyObserver.unobserve(entry.target);
    import('./stories.jsx').then(({mountStory}) => mountStory(entry.target)).catch(() => {});
  }
}, {rootMargin:'150px'});
document.querySelectorAll('[data-story]').forEach(element => storyObserver.observe(element));

const motion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-capture-video]').forEach(video => {
  let visible = false;
  let manuallyPaused = false;
  let automaticPause = false;
  const button = document.querySelector('[data-capture-toggle]');
  const caption = document.querySelector('[data-capture-caption]');
  const update = () => {
    if (visible && !document.hidden && !motion.matches && !manuallyPaused && !video.ended) video.play().catch(() => {});
    else if (!video.paused) {automaticPause=true;video.pause();}
  };
  new IntersectionObserver(([entry]) => {visible=entry.isIntersecting;update();},{threshold:0.4}).observe(video);
  document.addEventListener('visibilitychange',update);
  motion.addEventListener('change',update);
  button.hidden=false;
  button.addEventListener('click',() => {
    if(video.paused){manuallyPaused=false;if(video.ended)video.currentTime=0;video.play().catch(() => {});}
    else {manuallyPaused=true;video.pause();}
  });
  video.addEventListener('play',() => {manuallyPaused=false;button.textContent='Pause demo';});
  video.addEventListener('pause',() => {
    if (!automaticPause && !video.ended) manuallyPaused=true;
    automaticPause=false;
    button.textContent=video.ended ? 'Replay demo' : 'Play demo';
  });
  video.addEventListener('ended',() => button.textContent='Replay demo');
  video.addEventListener('timeupdate',() => {
    caption.textContent=video.currentTime<2 ? '01 · Open capture from the Lock Screen' : video.currentTime<7 ? '02 · Let the thought keep going' : video.currentTime<9 ? '03 · Wait for the useful text' : '04 · Review the result before saving';
  });
});
