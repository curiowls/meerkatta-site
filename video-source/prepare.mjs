import {execFileSync} from 'node:child_process';
import {copyFileSync} from 'node:fs';
const ff=(args)=>execFileSync('/opt/homebrew/bin/ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit'});
const raw='/Users/chelchel/Documents/ScreenRecording_09-16-2026 11-10-09_1.MP4';
const segments=[[0,4.1],[6,1.8],[8.8,4.4],[14,2],[17.8,1.2]];
for(let i=0;i<segments.length;i++)ff(['-ss',String(segments[i][0]),'-i',raw,'-t',String(segments[i][1]),'-an','-vf','fps=30,scale=540:1170:flags=lanczos,setsar=1','-c:v','libx264','-crf','16','-pix_fmt','yuv420p',`public/setup-${i}.mp4`]);
ff(['-ss','18.8','-i',raw,'-frames:v','1','-vf','scale=540:1170:flags=lanczos','public/setup-end.png']);
const base='/Users/chelchel/meerkatta/marketing/app-store/preview-build-122/public/';
for(const name of ['lockscreen.png','lock-capture.mp4','capture.mp4','processing.mp4','result.png'])copyFileSync(base+name,'public/'+name);
