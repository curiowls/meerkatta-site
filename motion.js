import {playbackIcon} from './playback-icons.js';
const storyObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    storyObserver.unobserve(entry.target);
    import('./stories.jsx').then(({mountStory}) => mountStory(entry.target)).catch(() => {});
  }
}, {rootMargin:'150px'});
document.querySelectorAll('[data-story]').forEach(element => storyObserver.observe(element));

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const group = document.querySelector('[data-demo-sequence]');
if (group) {
  const status = document.querySelector('[data-demo-status]');
  const demos = [...group.querySelectorAll('[data-demo]')].map(figure => ({
    figure, video:figure.querySelector('video'), button:figure.querySelector('button'),
    caption:figure.querySelector('[data-demo-caption]'), progress:figure.querySelector('progress'),
    name:figure.dataset.demo,
  }));
  const cues = [
    [[0,'Touch and hold the Lock Screen.'],[1.1,'Choose Customize, then tap the widget area.'],[4.1,'Find MeerKatta in the widget list.'],[5.6,'Tap Quick Capture to add it.'],[9.1,'Close the picker and tap Done.'],[11.1,'Ready for the next thought.']],
    [[0,'Tap MeerKatta on your Lock Screen.'],[3,'Speak while the thought is still fresh.'],[8,'Stop and let the text take shape.'],[10,'Your thought, captured and ready to use.']],
  ];
  const cover = group.querySelector('[data-demo-cover]');
  let captureStarted = false;
  cover.hidden = false;
  let active = 0;
  let visible = false;
  let manualPause = false;
  let finished = false;
  const paint = () => {
    cover.hidden = captureStarted;
    group.querySelector('[data-demo-complete]').hidden = !demos[0].video.ended;
    demos.forEach((demo,index) => {
      const v=demo.video;
      demo.figure.classList.toggle('is-playing',!v.paused);
      const action = !v.paused ? 'Pause' : v.ended ? 'Replay' : 'Play';
      const label = `${action} ${demo.name}`;
      demo.button.classList.add('playback-icon');
      demo.button.setAttribute('aria-label',label);
      demo.button.title=label;
      demo.button.innerHTML=playbackIcon(action);
      demo.progress.value=Number.isFinite(v.duration) ? v.currentTime/v.duration : 0;
      const cue=cues[index].filter(([time])=>time<=v.currentTime).at(-1);
      if(cue) demo.caption.textContent=cue[1];
    });
  };
  const pauseAll = () => {demos.forEach(d=>d.video.pause());paint();};
  const playActive = () => {
    demos.forEach((d,index)=>{if(index!==active)d.video.pause();});
    demos[active].video.play().catch(()=>{paint();status.textContent='Press Play to watch setup, then capture.';});
  };
  const update = () => {
    if (visible && !document.hidden && !motion.matches && !manualPause && !finished) playActive();
    else pauseAll();
  };
  demos.forEach((demo,index) => {
    demo.video.controls=false;
    demo.video.defaultPlaybackRate=0.75;
    demo.video.playbackRate=0.75;
    demo.button.hidden=false;
    demo.button.addEventListener('click',()=>{
      if(!demo.video.paused){manualPause=true;pauseAll();status.textContent=`${index===0?'Setup':'Capture'} paused. Press Play to continue.`;return;}
      pauseAll();active=index;manualPause=false;finished=false;
      if(demo.video.ended)demo.video.currentTime=0;
      playActive();
    });
    demo.video.addEventListener('play',()=>{
      // A single active video is an invariant, including external media controls.
      captureStarted=index===1;
      active=index;demos.forEach((d,i)=>{if(i!==index)d.video.pause();});
      status.textContent=index===0?'Playing setup. Capture plays next.':'Playing capture.';
      paint();
    });
    demo.video.addEventListener('pause',paint);
    demo.video.addEventListener('timeupdate',paint);
    demo.video.addEventListener('ended',()=>{
      if(index!==active)return;
      if(index===0){active=1;demos[1].video.currentTime=0;if(visible&&!document.hidden&&!motion.matches&&!manualPause)playActive();}
      else {finished=true;status.textContent='Both demos complete. Replay either one.';}
      paint();
    });
  });
  paint();
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:0.35}).observe(group);
  document.addEventListener('visibilitychange',update);
  motion.addEventListener('change',update);
}

// Reserve every phrase's space and rotate only while the headline is visible.
const headline=document.querySelector('.spark-headline');
if(headline){
  const phrases=[...headline.querySelectorAll('.hero-outcomes > span')];
  const toggle=document.querySelector('.hero-rotation-toggle');
  let index=0, visible=false, paused=false, timer;
  const show=()=>phrases.forEach((phrase,i)=>phrase.classList.toggle('is-current',i===index));
  const update=()=>{
    clearInterval(timer);
    toggle.hidden=motion.matches;
    if(motion.matches){index=0;show();}
    const action=paused?'Play':'Pause';
    toggle.innerHTML=playbackIcon(action);
    toggle.setAttribute('aria-label',`${action} headline rotation`);
    toggle.title=`${action} headline rotation`;
    if(visible&&!document.hidden&&!motion.matches&&!paused)timer=setInterval(()=>{index=(index+1)%phrases.length;show();},3800);
  };
  toggle.addEventListener('click',()=>{paused=!paused;update();});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:0.2}).observe(headline);
  document.addEventListener('visibilitychange',update);
  motion.addEventListener('change',update);
  update();
}
