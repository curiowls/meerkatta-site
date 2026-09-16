import React from 'react';
import {registerRoot,Composition,AbsoluteFill,Sequence,OffthreadVideo,Img,staticFile,useCurrentFrame} from 'remotion';
const style={width:'100%',height:'100%',objectFit:'fill' as const};
type Shot={src:string;frames:number;rate?:number};
const setup:Shot[]=[{src:'setup-0.mp4',frames:123},{src:'setup-1.mp4',frames:18,rate:3},{src:'setup-2.mp4',frames:132},{src:'setup-3.mp4',frames:60},{src:'setup-4.mp4',frames:36},{src:'setup-end.png',frames:45}];
const capture:Shot[]=[{src:'lockscreen.png',frames:30},{src:'lock-capture.mp4',frames:60},{src:'capture.mp4',frames:150},{src:'processing.mp4',frames:60},{src:'result.png',frames:90}];
const SoftMask=({top,height,left=0,width=540,blur=15}:{top:number;height:number;left?:number;width?:number;blur?:number})=><div style={{position:'absolute',top,left,width,height,backdropFilter:`blur(${blur}px)`,WebkitBackdropFilter:`blur(${blur}px)`,maskImage:'linear-gradient(transparent,black 18%,black 82%,transparent)',pointerEvents:'none'}}/>;
const ShotView=({shot}:{shot:Shot})=>{
 const frame=useCurrentFrame();
 const setupShot=shot.src.startsWith('setup');
 const inset=(shot.src==='setup-0.mp4'&&frame>=20&&frame<58);
 const lock=setupShot||shot.src==='lockscreen.png'||(shot.src==='lock-capture.mp4'&&frame<12);
 const status=!setupShot||shot.src==='setup-end.png'||(shot.src==='setup-0.mp4'&&frame<20)||shot.src==='setup-4.mp4';
 return <AbsoluteFill>
 {shot.src.endsWith('.png')?<Img src={staticFile(shot.src)} style={style}/>:<OffthreadVideo src={staticFile(shot.src)} muted playbackRate={shot.rate??1} style={style}/>}
 {lock&&<SoftMask top={inset?220:65} height={inset?145:235}/>}
 {status&&<><SoftMask top={0} height={65} width={145}/><SoftMask top={0} height={65} left={380} width={160}/></>}
 {shot.src==='setup-1.mp4'&&<SoftMask top={545} height={625} blur={22}/>}
 {shot.src==='setup-2.mp4'&&frame<25&&<><SoftMask top={535} height={120}/><SoftMask top={720} height={450}/></>}
 {shot.src==='setup-2.mp4'&&frame>=120&&<SoftMask top={535} height={635} blur={20}/>}
 </AbsoluteFill>;
};
const Film=({shots}:{shots:Shot[]})=>{let from=0;return <AbsoluteFill style={{background:'#f8f2e9'}}>{shots.map(shot=>{const start=from;from+=shot.frames;return <Sequence key={shot.src} from={start} durationInFrames={shot.frames}><ShotView shot={shot}/></Sequence>})}</AbsoluteFill>};
const Root=()=> <><Composition id="WidgetSetup" component={Film} defaultProps={{shots:setup}} width={540} height={1170} fps={30} durationInFrames={414}/><Composition id="LockCapture" component={Film} defaultProps={{shots:capture}} width={540} height={1170} fps={30} durationInFrames={390}/></>;
registerRoot(Root);
