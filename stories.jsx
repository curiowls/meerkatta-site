import {WorkStory,workExamples} from './work-story.jsx';
import {playbackIcon} from './playback-icons.js';
import {TYPE} from './typography.js';
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

};
function ThoughtStory({kind, compact}) {
  const frame = useCurrentFrame();
  const story = stories[kind];
  const words = story.raw.split(' ');
  const visible = Math.min(words.length, Math.floor(frame / 3) + 1);
  return <AbsoluteFill style={{background:'#f2ede4',color:'#302b26',fontFamily:'Inter, sans-serif',padding:compact ? 24 : 34,borderRadius:24}}>
    <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'space-between',fontSize:TYPE.caption,letterSpacing:1,textTransform:'uppercase',color:'#66594b'}}>
      <span>{frame < 150 ? '01 / Let it arrive' : frame < 220 ? '02 / Find the shape' : '03 / Keep moving'}</span><span>Illustrative example</span>
    </div>
    <div style={{marginTop:24,padding:26,borderRadius:18,background:'#e5ddcf',minHeight:176}}>
      <div style={{fontSize:TYPE.caption,marginBottom:14,color:'#706352'}}>Raw thought</div>
      <p style={{fontSize:TYPE.bodyLarge,lineHeight:1.55,margin:0}}>{words.slice(0,visible).join(' ')}<span style={{opacity:frame < 150 ? 1 : 0}}> ▎</span></p>
    </div>
    <div style={{height:32,display:'flex',alignItems:'center',justifyContent:'center',opacity:interpolate(frame,[135,155],[0,1],clamp),color:'#846748'}}>↓</div>
    <div style={{padding:26,borderRadius:18,background:'#fffcf7',border:'1px solid #c9bba5',opacity:interpolate(frame,[150,180],[0,1],clamp),translate:`0 ${interpolate(frame,[150,180],[14,0],clamp)}px`}}>
      <div style={{fontSize:TYPE.caption,color:'#706352',marginBottom:10}}>{story.end}</div>
      <h3 style={{fontSize:TYPE.titleSmall,lineHeight:1.2,margin:'0 0 14px'}}>{story.title}</h3>
      <p style={{fontSize:TYPE.bodyLarge,lineHeight:1.5,margin:0}}>{story.result}</p>
    </div>
    <div style={{marginTop:'auto',fontSize:TYPE.body,color:'#66594b',opacity:interpolate(frame,[220,245],[0,1],clamp)}}>{story.next}</div>
  </AbsoluteFill>;
}
function StoryPlayer({kind,example}) {
  const lastFrame=kind==='work'?479:299;
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
    const onMotion = () => {if(motion.matches) ref.seekTo(lastFrame);update();};
    motion.addEventListener('change',onMotion);
    document.addEventListener('visibilitychange',update);
    return () => {observer.disconnect();motion.removeEventListener('change',onMotion);document.removeEventListener('visibilitychange',update);ref.removeEventListener('play',onPlay);ref.removeEventListener('pause',onPause);ref.removeEventListener('ended',onEnd);};
  },[]);
  const toggle = () => {
    if (playing) {manualPause.current=true;player.current.pause();}
    else {manualPause.current=false;if(ended || player.current.getCurrentFrame() >= lastFrame){player.current.seekTo(0);finished.current=false;setEnded(false);}player.current.play();}
  };
  const showResult = () => {manualPause.current=true;finished.current=true;player.current.pause();player.current.seekTo(lastFrame);setEnded(true);};
  return <div ref={container}>
    <div aria-hidden="true"><Player ref={player} component={kind==='work'?WorkStory:ThoughtStory} inputProps={{kind,compact,example}} compositionWidth={compact ? 420 : kind==='work'?720:640} compositionHeight={kind==='work'?700:(compact?880:670)} durationInFrames={lastFrame+1} fps={30} initialFrame={window.matchMedia('(prefers-reduced-motion: reduce)').matches ? lastFrame : 0} initiallyMuted moveToBeginningWhenEnded={false} clickToPlay={false} style={{width:'100%'}} numberOfSharedAudioTags={0}/></div>
    <div className="story-controls"><div className="story-buttons"><button type="button" onClick={showResult} hidden={ended}>Show result</button><button type="button" className="playback-icon" onClick={toggle} aria-label={playing ? 'Pause story' : ended ? 'Replay story' : 'Play story'} title={playing ? 'Pause story' : ended ? 'Replay story' : 'Play story'} dangerouslySetInnerHTML={{__html:playbackIcon(playing ? 'Pause' : ended ? 'Replay' : 'Play')}} /></div></div>
  </div>;
}
function WorkDemo(){
  const [example,setExample]=useState('team');
  return <><div className="work-examples" role="group" aria-label="Choose a dictation example">{Object.entries(workExamples).map(([key,value])=><button key={key} type="button" aria-pressed={example===key} onClick={()=>setExample(key)}>{value.label}</button>)}</div><StoryPlayer key={example} kind="work" example={example}/><div className="story-transcript-sr"><p>Dictation example: hold your configured hotkey, speak, then release.</p><p><strong>You say: </strong>{workExamples[example].raw}</p><p style={{whiteSpace:'pre-line'}}><strong>Inserted at your cursor: </strong>{workExamples[example].result}</p></div></>;
}
export function mountStory(element) {
  const mount = element.querySelector('[data-story-player]');
  createRoot(mount, {onUncaughtError: () => {element.classList.remove('story-ready');mount.hidden=true;}}).render(element.dataset.story==='work'?<WorkDemo/>:<StoryPlayer kind={element.dataset.story}/>);
  element.classList.add('story-ready');
}
