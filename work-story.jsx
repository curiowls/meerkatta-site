import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {TYPE} from './typography.js';
export const workExamples={
 team:{label:'Team message',context:'Project team · Review update',hint:'Message your team…',raw:'Quick update, the review is Thursday—actually Friday. Design is ready, testing is still open, and I need feedback by noon.',result:'Quick update: the review is Friday.\n• Design is ready.\n• Testing is still open.\nPlease send feedback by noon.'},
 prompt:{label:'AI prompt',context:'Your coding assistant · First-run experience',hint:'Describe what you want to build…',raw:'Add a first-run checklist, not a modal. Three steps: connect a provider, try a capture, open settings. Make it dismissible.',result:'Add a dismissible first-run checklist, not a modal.\nInclude three steps:\n1. Connect a provider.\n2. Try a capture.\n3. Open settings.'},
 email:{label:'Email',context:'New message · To Maya',hint:'Write your reply…',raw:'Tell Maya thanks for the proposal. I can meet Tuesday after two or Thursday morning. Ask which works.',result:'Hi Maya,\n\nThanks for the proposal. I can meet Tuesday after 2 p.m. or Thursday morning. Which works for you?'}
};
export function WorkStory({compact,example='team'}){
 const f=useCurrentFrame();const e=workExamples[example];const listening=f>=60&&f<240;const processing=f>=240&&f<300;const inserted=f>=300;
 const press=interpolate(f,[48,60,235,245],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const words=e.raw.split(' ');const spoken=words.slice(0,Math.max(0,Math.ceil((f-60)/180*words.length))).join(' ');
 const eyeColor=listening?'#E54A4A':processing?'#2872A7':inserted?'#28A745':'#72462c';
 const phase=inserted?'Text at your cursor':processing?'Shaping your words':listening?'Keep holding. Speak naturally.':'Hold your configured hotkey';
 return <AbsoluteFill style={{background:'#f2ede4',padding:compact?18:28,fontFamily:'Inter, sans-serif',color:'#302b26',borderRadius:24}}>
  <div style={{display:'flex',justifyContent:'space-between',fontSize:TYPE.caption,color:'#786653',marginBottom:16}}><span>YOUR WORK, STILL OPEN</span><span>Illustrative demo</span></div>
  <div style={{background:'#fffdf8',border:'1px solid #d3c8b9',borderRadius:16,overflow:'hidden'}}>
   <div style={{padding:'16px 18px',borderBottom:'1px solid #e8dfd2',display:'flex',gap:14,alignItems:'center'}}><span style={{color:'#b4a592',letterSpacing:3}}>●●●</span><span style={{fontSize:TYPE.body}}>{e.context}</span></div>
   <div style={{padding:compact?18:24}}>
    <div style={{fontSize:TYPE.caption,color:'#8a7b69',marginBottom:16}}>Continue the conversation</div>
    <div style={{minHeight:compact?240:215,padding:18,border:'1.5px solid #ab8d70',borderRadius:12,background:inserted?'#fffaf1':'#fffdf8',position:'relative'}}>
     <div style={{fontSize:TYPE.bodyLarge,lineHeight:1.55,whiteSpace:'pre-line',opacity:inserted?interpolate(f,[300,310],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}):1}}>{inserted?e.result:<span style={{color:'#9c9081'}}>{e.hint}<span style={{color:'#72462c'}}> ▎</span></span>}</div>
    </div>
    <div style={{fontSize:TYPE.caption,color:'#8a7b69',marginTop:12,textAlign:'right'}}>{inserted?'Inserted · Ready for your review':'Your cursor stays here'}</div>
   </div>
  </div>
  <div style={{marginTop:18,display:'flex',gap:12,alignItems:'center',color:'#72462c'}}>
   <div aria-hidden="true" style={{width:44,height:44,flexShrink:0,borderRadius:12,display:'grid',placeItems:'center',background:inserted?'#E6F4EA':'#FCECC4',border:`0.5px solid ${inserted?'#B8DCC2':'#E8D9B0'}`,boxShadow:'0 1px 3px #00000024'}}>
    <div style={{position:'relative',width:30,height:30}}><img src="/assets/meerkat-widget-noeye.png" alt="" width="30" height="30"/><span style={{position:'absolute',left:`${37/72*100}%`,top:`${21/72*100}%`,width:'17%',height:'17%',borderRadius:'50%',transform:'translate(-50%,-50%)',background:eyeColor,boxShadow:`0 0 1.65px ${eyeColor}5c`}}/></div>
   </div>
   <svg style={{flexShrink:0}} width="60" height="32" viewBox="0 0 60 32" aria-hidden="true">{Array.from({length:11},(_,i)=>{const h=listening?5+Math.abs(Math.sin(f*.18+i*.9))*22:4;return <line key={i} x1={5+i*5} x2={5+i*5} y1={16-h/2} y2={16+h/2} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>;})}</svg>
   <span style={{fontSize:TYPE.body}}>{inserted?'Your words, ready to use.':processing?'MeerKatta is shaping your words…':listening?'MeerKatta is listening…':'Ready when you are.'}</span>
  </div>
  <div style={{fontSize:TYPE.body,lineHeight:1.5,color:'#776653',marginTop:8,minHeight:compact?96:75}}>{listening||processing?<><span style={{fontSize:TYPE.caption,textTransform:'uppercase'}}>You say · </span>{spoken}</>:inserted?'The text is in your app. Review it, then keep going.':'Hold → speak → release. No change of workspace.'}</div>
  <div style={{marginTop:'auto',display:'flex',alignItems:'center',gap:16,borderTop:'1px solid #d9cebf',paddingTop:12}}>
   <svg width="100" height="66" viewBox="0 0 100 66" aria-hidden="true" style={{flexShrink:0,color:'#72462c'}}>
    <path d="M10 39v12q0 6 7 6h66q7 0 7-6V39" fill="none" stroke="currentColor" strokeWidth="1.7"/>
    <g transform={`translate(0 ${press*9})`}><rect x="10" y="9" width="80" height="36" rx="8" fill={listening?'#e5d5bd':'#f7f2e9'} stroke="currentColor" strokeWidth="1.7"/><text x="50" y="32" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={TYPE.caption} fill="currentColor">Hotkey</text></g>
   </svg>
   <div><div style={{fontSize:TYPE.body,fontWeight:500}}>{phase}</div><div style={{fontSize:TYPE.caption,color:'#8a7b69',marginTop:5}}>{listening?'Pressed · listening':processing?'Released · processing':inserted?'Released · inserted':'Released · ready'}</div></div>
  </div>
 </AbsoluteFill>;
}
