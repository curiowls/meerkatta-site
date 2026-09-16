import {execFileSync} from 'node:child_process';
import {unlinkSync} from 'node:fs';
for (const [composition,name] of [['WidgetSetup','widget-setup'],['LockCapture','lock-capture']]) {
  const temporary=`qa/${name}-render.mp4`;
  execFileSync('./node_modules/.bin/remotion',['render','index.tsx',composition,temporary],{stdio:'inherit'});
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',temporary,'-an','-c:v','copy','-movflags','+faststart',`../public/media/${name}.mp4`],{stdio:'inherit'});
  unlinkSync(temporary);
}
