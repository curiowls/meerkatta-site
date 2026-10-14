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
  const setup = group.querySelector('[data-demo="setup"]');
  const guide = setup.querySelector('[data-widget-guide]');
  const setupButton = setup.querySelector('[data-demo-toggle]');
  const previous = setup.querySelector('[data-widget-previous]');
  const next = setup.querySelector('[data-widget-next]');
  const capture = group.querySelector('[data-demo="capture"]');
  const video = capture.querySelector('video');
  const captureButton = capture.querySelector('[data-demo-toggle]');
  const steps = [
    ['Touch and hold your Lock Screen.',4000],
    ['Tap Customize below your Lock Screen.',5000],
    ['Tap the widget area below the time.',4000],
    ['Choose MeerKatta from the widget list.',7000],
    ['Close the picker and tap Done.',5000],
  ];
  const cues = [[0,'Tap MeerKatta on your Lock Screen.'],[3,'Speak while the thought is still fresh.'],[8,'Stop and let the text take shape.'],[10,'Your thought, captured and ready to use.']];
  const cover = group.querySelector('[data-demo-cover]');
  let step=0, elapsed=0, playing=false, setupComplete=false;
  let active='setup', visible=false, manualPause=false, captureStarted=false, finished=false;
  let lastTick=performance.now();
  const iconButton = (button,action,label) => {
    button.classList.add('playback-icon');
    button.setAttribute('aria-label',label);button.title=label;
    button.innerHTML=playbackIcon(action);
  };
  const paint = () => {
    cover.hidden = captureStarted;
    guide.dataset.step=String(step);
    guide.dataset.choice=String(step===3&&elapsed>=3000);
    guide.dataset.done=String(step===4&&(elapsed>=2000||setupComplete));
    guide.querySelector('[data-demo-complete]').hidden=guide.dataset.done!=='true';
    guide.querySelectorAll('[data-widget-scene]').forEach(scene=>{scene.hidden=Number(scene.dataset.widgetScene)!==step;});
    let caption=steps[step][0];
    if(step===3&&elapsed>=3000)caption='Choose a Quick Capture widget size.';
    if(step===4&&(elapsed>=2000||setupComplete))caption='Ready for the next thought. One tap away.';
    const captionElement=setup.querySelector('[data-demo-caption]');
    const text=`${step+1} / 5 · ${caption}`;
    if(captionElement.textContent!==text)captionElement.textContent=text;
    setup.querySelector('progress').value=step+1;
    previous.disabled=step===0;next.disabled=step===4;
    setup.classList.toggle('is-playing',playing);
    capture.classList.toggle('is-playing',!video.paused);
    iconButton(setupButton,playing?'Pause':setupComplete?'Replay':'Play',playing?'Pause setup':setupComplete?'Replay setup':'Play setup');
    const action=!video.paused?'Pause':video.ended?'Replay':'Play';
    iconButton(captureButton,action,`${action} capture`);
    capture.querySelector('progress').value=Number.isFinite(video.duration)?video.currentTime/video.duration:0;
    const cue=cues.filter(([time])=>time<=video.currentTime).at(-1);
    if(cue)capture.querySelector('[data-demo-caption]').textContent=cue[1];
  };
  const pauseAll = () => {playing=false;video.pause();paint();};
  const playActive = () => {
    if(active==='setup'){video.pause();playing=true;lastTick=performance.now();status.textContent='Playing setup. Capture plays next.';paint();}
    else {playing=false;video.play().catch(()=>{paint();status.textContent='Press Play to watch the capture.';});}
  };
  const update = () => {
    if (visible && !document.hidden && !motion.matches && !manualPause && !finished) playActive();
    else pauseAll();
  };
  [previous,next].forEach(button=>{
    iconButton(button,'Play',button===previous?'Previous setup step':'Next setup step');
    button.addEventListener('click',()=>{
      pauseAll();manualPause=true;finished=false;active='setup';setupComplete=false;
      step=Math.max(0,Math.min(4,step+(button===previous?-1:1)));elapsed=0;
      status.textContent='Setup paused. Explore each step at your own pace.';paint();
    });
  });
  setupButton.addEventListener('click',()=>{
    if(playing){manualPause=true;pauseAll();status.textContent='Setup paused.';return;}
    pauseAll();active='setup';manualPause=false;finished=false;
    if(setupComplete){step=0;elapsed=0;setupComplete=false;}
    playActive();
  });
  video.controls=false;video.defaultPlaybackRate=0.75;video.playbackRate=0.75;captureButton.hidden=false;
  captureButton.addEventListener('click',()=>{
    if(!video.paused){manualPause=true;pauseAll();status.textContent='Capture paused.';return;}
    pauseAll();active='capture';manualPause=false;finished=false;
    if(video.ended)video.currentTime=0;
    playActive();
  });
  video.addEventListener('play',()=>{playing=false;active='capture';captureStarted=true;status.textContent='Playing capture.';paint();});
  video.addEventListener('pause',paint);video.addEventListener('timeupdate',paint);
  video.addEventListener('ended',()=>{finished=true;status.textContent='Capture complete. Replay or revisit the setup steps.';paint();});
  setInterval(()=>{
    const now=performance.now();
    if(playing&&visible&&!document.hidden){
      elapsed+=now-lastTick;
      if(elapsed>=steps[step][1]){
        if(step<4){step++;elapsed=0;}
        else {setupComplete=true;playing=false;active='capture';if(!motion.matches&&!manualPause)playActive();}
      }
      paint();
    }
    lastTick=now;
  },100);
  paint();
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:0.35}).observe(group);
  document.addEventListener('visibilitychange',update);
  motion.addEventListener('change',update);
}

// Reserve every phrase's space and rotate only while the headline is visible.
const headline=document.querySelector('.spark-headline');
if(headline){
  const phrases=[...headline.querySelectorAll('.hero-outcomes > span')];
  let index=0, visible=false, timer;
  const show=()=>phrases.forEach((phrase,i)=>phrase.classList.toggle('is-current',i===index));
  const update=()=>{
    clearInterval(timer);
    if(motion.matches){index=0;show();}
    if(visible&&!document.hidden&&!motion.matches)timer=setInterval(()=>{index=(index+1)%phrases.length;show();},3800);
  };
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();},{threshold:0.2}).observe(headline);
  document.addEventListener('visibilitychange',update);
  motion.addEventListener('change',update);
  update();
}
