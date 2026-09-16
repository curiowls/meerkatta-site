import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player} from '@remotion/player';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const stories = {
  thought: {
    raw: 'Wait, the thing is not typing speed… once I start fixing the sentence, I stop thinking. Maybe I need to keep talking until the idea has a shape.',
    title: 'Give the thought room to arrive.',
    result: 'The problem is not typing speed. Fixing the sentence interrupts my thinking. I want to keep speaking until the idea has a shape.',
    end: 'Structured thought', next: 'Keep it. Return when you’re ready.',
  },
  work: {
    raw: 'Maybe add a first-run checklist… actually, not a modal. After onboarding: connect the provider, try a capture, open settings. Keep it lightweight. Let people dismiss it.',
    title: 'A clear starting point for the work.',
    result: 'Add a lightweight, dismissible checklist after onboarding. Avoid a modal. Include three steps: connect the provider, try a capture, and open settings.',
    end: 'Structured instruction', next: 'Review it. Then put it to work.',
  },
};
function ThoughtStory({kind, compact}) {
  const frame = useCurrentFrame();
  const story = stories[kind];
  const words = story.raw.split(' ');
  const visible = Math.min(words.length, Math.floor(frame / 3) + 1);
  return <AbsoluteFill style={{background:'#f2ede4',color:'#302b26',fontFamily:'Inter, sans-serif',padding:compact ? 24 : 34,borderRadius:24}}>
    <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'space-between',fontSize:15,letterSpacing:1,textTransform:'uppercase',color:'#66594b'}}>
      <span>{frame < 150 ? '01 / Let it arrive' : frame < 220 ? '02 / Find the shape' : '03 / Keep moving'}</span><span>Illustrative example</span>
    </div>
    <div style={{marginTop:24,padding:26,borderRadius:18,background:'#e5ddcf',minHeight:176}}>
      <div style={{fontSize:15,marginBottom:14,color:'#706352'}}>Raw thought</div>
      <p style={{fontSize:23,lineHeight:1.55,margin:0}}>{words.slice(0,visible).join(' ')}<span style={{opacity:frame < 150 ? 1 : 0}}> ▎</span></p>
    </div>
    <div style={{height:32,display:'flex',alignItems:'center',justifyContent:'center',opacity:interpolate(frame,[135,155],[0,1],clamp),color:'#846748'}}>↓</div>
    <div style={{padding:26,borderRadius:18,background:'#fffcf7',border:'1px solid #c9bba5',opacity:interpolate(frame,[150,180],[0,1],clamp),translate:`0 ${interpolate(frame,[150,180],[14,0],clamp)}px`}}>
      <div style={{fontSize:15,color:'#706352',marginBottom:10}}>{story.end}</div>
      <h3 style={{fontSize:28,lineHeight:1.2,margin:'0 0 14px'}}>{story.title}</h3>
      <p style={{fontSize:22,lineHeight:1.5,margin:0}}>{story.result}</p>
    </div>
    <div style={{marginTop:'auto',fontSize:17,color:'#66594b',opacity:interpolate(frame,[220,245],[0,1],clamp)}}>{story.next}</div>
  </AbsoluteFill>;
}
function StoryPlayer({kind}) {
  const player = useRef(null);
  const container = useRef(null);
  const manualPause = useRef(false);
  const finished = useRef(false);
  const visible = useRef(false);
  const [playing,setPlaying] = useState(false);
  const [ended,setEnded] = useState(false);
  const [compact,setCompact] = useState(false);
  useEffect(() => {
    const resize = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 480));
    resize.observe(container.current);
    return () => resize.disconnect();
  },[]);
  useEffect(() => {
    const ref = player.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      if (visible.current && !document.hidden && !motion.matches && !manualPause.current && !finished.current) ref.play();
      else ref.pause();
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {finished.current=true;setEnded(true);setPlaying(false);};
    ref.addEventListener('play',onPlay);ref.addEventListener('pause',onPause);ref.addEventListener('ended',onEnd);
    const observer = new IntersectionObserver(([entry]) => {visible.current=entry.isIntersecting;update();},{threshold:0.35});
    observer.observe(container.current);
    const onMotion = () => {if(motion.matches) ref.seekTo(299);update();};
    motion.addEventListener('change',onMotion);
    document.addEventListener('visibilitychange',update);
    return () => {observer.disconnect();motion.removeEventListener('change',onMotion);document.removeEventListener('visibilitychange',update);ref.removeEventListener('play',onPlay);ref.removeEventListener('pause',onPause);ref.removeEventListener('ended',onEnd);};
  },[]);
  const toggle = () => {
    if (playing) {manualPause.current=true;player.current.pause();}
    else {manualPause.current=false;if(ended || player.current.getCurrentFrame() >= 299){player.current.seekTo(0);finished.current=false;setEnded(false);}player.current.play();}
  };
  const showResult = () => {manualPause.current=true;finished.current=true;player.current.pause();player.current.seekTo(299);setEnded(true);};
  return <div ref={container}>
    <div aria-hidden="true"><Player ref={player} component={ThoughtStory} inputProps={{kind,compact}} compositionWidth={compact ? 420 : 640} compositionHeight={compact ? 880 : 670} durationInFrames={300} fps={30} initialFrame={window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 299 : 0} initiallyMuted moveToBeginningWhenEnded={false} clickToPlay={false} style={{width:'100%'}} numberOfSharedAudioTags={0}/></div>
    <div className="story-controls"><span>From unfinished speech to useful text · 10 seconds</span><div className="story-buttons"><button type="button" onClick={showResult} hidden={ended}>Show result</button><button type="button" onClick={toggle}>{playing ? 'Pause story' : ended ? 'Replay story' : 'Play story'}</button></div></div>
  </div>;
}
export function mountStory(element) {
  const mount = element.querySelector('[data-story-player]');
  createRoot(mount, {onUncaughtError: () => {element.classList.remove('story-ready');mount.hidden=true;}}).render(<StoryPlayer kind={element.dataset.story}/>);
  element.classList.add('story-ready');
}
