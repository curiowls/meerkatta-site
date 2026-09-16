import React from 'react';
import {registerRoot,Composition,AbsoluteFill,Sequence,OffthreadVideo,Img,staticFile} from 'remotion';
const style={width:'100%',height:'100%',objectFit:'fill' as const};
const setup=[{src:'setup-0.mp4',frames:123},{src:'setup-1.mp4',frames:54},{src:'setup-2.mp4',frames:132},{src:'setup-3.mp4',frames:60},{src:'setup-4.mp4',frames:36},{src:'setup-end.png',frames:45}];
const capture=[{src:'lockscreen.png',frames:30},{src:'lock-capture.mp4',frames:60},{src:'capture.mp4',frames:150},{src:'processing.mp4',frames:60},{src:'result.png',frames:90}];
const Film=({shots}:{shots:typeof setup})=>{let from=0;return <AbsoluteFill style={{background:'#f8f2e9'}}>{shots.map(shot=>{const start=from;from+=shot.frames;return <Sequence key={shot.src} from={start} durationInFrames={shot.frames}>{shot.src.endsWith('.png')?<Img src={staticFile(shot.src)} style={style}/>:<OffthreadVideo src={staticFile(shot.src)} muted style={style}/>}</Sequence>})}</AbsoluteFill>};
const Root=()=> <><Composition id="WidgetSetup" component={Film} defaultProps={{shots:setup}} width={540} height={1170} fps={30} durationInFrames={450}/><Composition id="LockCapture" component={Film} defaultProps={{shots:capture}} width={540} height={1170} fps={30} durationInFrames={390}/></>;
registerRoot(Root);
