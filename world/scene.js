// The coded desert: one full-screen fragment shader. No video, no background photos.
// A real 3D dune field (a height map, ray-marched), lit by a low sun from the left with
// soft shadows, wind ripples, grain and glints. The camera walks forward (uCam), tips
// underground (uDepth), and the light moves to dusk (uDusk). Mascot cut-outs stand in the
// world as upright cards, so dunes hide them naturally.

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime,uCam,uDepth,uDusk,uHaze,uScroll;
uniform sampler2D uT0,uT1;
uniform vec4 uS0,uS1;     // sprite: world x, world z, height, rise 0..1
uniform vec2 uAsp;        // sprite aspect ratios (w/h)
uniform vec4 uEye0,uEye0b,uEye1;  // eye centre (u,v) and radii (u,v) in sprite space
uniform vec2 uFlip;      // 1 mirrors that sprite so it faces left
uniform vec3 uLife;
uniform float uHole;     // 0..1: how far the sand around sprite 0 has been dug out       // blink of sprite 0, blink of sprite 1, dust kicked up by sprite 0

float hash2(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float n2(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(hash2(i),hash2(i+vec2(1.,0.)),f.x),mix(hash2(i+vec2(0.,1.)),hash2(i+vec2(1.,1.)),f.x),f.y);}

// Dunes: long crests running diagonally, gentle on the windward side, steep on the lee.
float dunes(vec2 p){
  vec2 q=vec2(p.x*.80+p.y*.60,-p.x*.60+p.y*.80)*vec2(.17,.40);
  float a=n2(q+vec2(0.,.3*n2(q*.7+4.)));
  float r=a<.5?pow(2.*a,1.55):pow(2.-2.*a,.8);
  return r*(.55+.45*n2(q*1.9+7.3))*1.2+n2(p*.5+3.1)*.16;
}
// A shallow valley follows the camera's path so it never clips a dune.
float ground(vec2 p){
  return dunes(p)*mix(.24,1.,smoothstep(.5,4.6,abs(p.x+sin(p.y*.21)*1.1)));
}
// The burrow mouth: where the meerkat comes up, the sand really is dug out and pushed
// aside into a low, uneven rim. Because it is part of the height map, the sun shades the
// hollow, the rim casts a shadow into it, and the near rim hides the mascot's lower body.
const float HOLE_DEPTH=.30;
float burrow(vec2 p){
  vec2 d=p-uS0.xy;
  float r2=dot(d,d);
  if(uHole<.001||r2>1.1)return 0.;                      // almost every sample skips this
  float r=sqrt(r2);
  float rim=exp(-pow((r-.52)/.17,2.));
  if(rim>.01)rim*=.75+.5*n2(p*5.+11.);                  // pushed sand is never even
  return uHole*(-HOLE_DEPTH*exp(-r2/.075)+.085*rim);
}
float terrain(vec2 p){return ground(p)+burrow(p);}

float eyelid(vec2 q,vec4 e,float blink){
  vec2 d=(q-e.xy)/max(e.zw,vec2(.0001));
  return (1.-smoothstep(.8,1.05,length(d)))*smoothstep(1.-2.2*blink,1.25-2.2*blink,d.y)*step(.001,blink);
}

// A mascot card standing in the world. It sways and breathes, blinks, catches the sun on
// its left edge, and sinks into the sand at its base instead of ending in a straight cut.
vec4 card(sampler2D t,vec4 s,float asp,float flip,float dig,vec3 ro,vec3 rd,float tHit,vec4 eA,vec4 eB,float blink,float ph,out float ts,out float dust){
  ts=(s.y-ro.z)/max(rd.z,.001);
  float base=ground(s.xy)-s.z*(1.-s.w)-s.z*.02;
  vec2 q=vec2((ro.x+rd.x*ts-s.x)/(s.z*asp)+.5,(ro.y+rd.y*ts-base)/s.z);
  q.x=mix(q.x,1.-q.x,flip);
  float vg=1.-s.w+.02-dig/s.z;               // where the sand line crosses the sprite (lower inside the hole)
  float seen=step(.001,s.w)*step(0.,ts)*step(ts,tHit);

  // dust kicked up around the base while it moves
  vec2 pc=vec2((q.x-.5)*asp*3.2,(q.y-vg)*3.6-.15);
  dust=uLife.z*exp(-dot(pc,pc)*1.6)*(.45+.55*n2(pc*2.6+vec2(uTime*.35,-uTime*1.1)))*seen*step(.5,2.-ph);

  // a very small sway of the head and neck: enough to feel alive without changing the silhouette
  float up=max(q.y-vg,0.);
  q.x-=(sin(uTime*.8+ph)*.010+sin(uTime*1.9+ph*2.3)*.003)*up*up*3.;

  vec2 in_=step(vec2(0.),q)*step(q,vec2(1.));
  vec2 qc=clamp(q,.002,.998);
  vec4 c=texture2D(t,qc);
  vec3 lid=vec3(.70,.49,.29);
  float closed=max(eyelid(q,eA,blink),eyelid(q,eB,blink));
  c.rgb=mix(c.rgb,lid*c.a,closed);
  // settle into the sand: ragged, soft contact rather than a straight edge
  float line=vg+.012*(n2(vec2(q.x*26.,3.))-.5);
  c*=smoothstep(line-.004,line+.03,q.y);
  return c*in_.x*in_.y*seen;
}
float cardShadow(vec2 p,vec4 s,vec2 dir){
  vec2 d=p-s.xy;
  float len=s.z*s.w*1.7;
  float al=dot(d,dir);
  float ac=dot(d,vec2(-dir.y,dir.x));
  float w=s.z*(.09+.10*clamp(al/len,0.,1.));
  float body=smoothstep(-.05*s.z,.08*s.z,al)*smoothstep(len*1.05,len*.55,al)*exp(-(ac*ac)/(w*w));
  float contact=exp(-dot(d,d)/(s.z*s.z*.012));
  return 1.-smoothstep(0.,.2,s.w)*max(.55*body,.5*contact);
}

// Lit sand colour at a point, without shadows: used where only the tone matters.
vec3 sandTone(vec2 xz,float e,vec3 L,vec3 shd,vec3 lit){
  float h0=terrain(xz);
  vec3 N=normalize(vec3(h0-terrain(xz+vec2(e,0.)),e,h0-terrain(xz+vec2(0.,e))));
  return mix(shd,lit,clamp(dot(N,L)*1.25+.08,0.,1.))*(.90+.12*N.y);
}
// Atmospheric perspective as low contrast: with distance, light and shadow close in on one
// middle sand tone, and only at the very back does that tone ease into the low sky.
vec3 distance_(vec3 c,float t,vec3 farTone,vec3 horizonC){
  c=mix(c,farTone,smoothstep(5.,34.,t)*.72);
  return mix(c,horizonC,smoothstep(26.,62.,t));
}
float focusBlur(float t){return smoothstep(6.,30.,t);}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  vec2 sp=vec2((uv.x-.5)*asp,uv.y);

  vec3 ro=vec3(0.,.80,uCam*2.2);
  vec3 rd=normalize(vec3(sp.x,uv.y-.54-uDepth*.75,1.3));
  vec3 L=normalize(vec3(-.72,mix(.36,.27,uDusk),.52));

  vec3 skyTop=mix(vec3(.940,.905,.860),vec3(.78,.58,.56),uDusk);
  vec3 skyHor=mix(vec3(.985,.957,.905),vec3(.99,.80,.60),uDusk);
  vec3 lit=mix(vec3(.915,.760,.545),vec3(.930,.640,.420),uDusk);
  vec3 shd=mix(vec3(.700,.545,.395),vec3(.610,.405,.340),uDusk);
  vec3 sunC=mix(vec3(1.,.95,.82),vec3(1.,.70,.40),uDusk);
  vec3 farTone=mix(shd,lit,.62);                     // what distant sand settles to
  vec3 horizonC=mix(farTone,skyHor,.5);              // where the farthest sand meets the sky

  float sunAmt=max(dot(rd,L),0.);
  vec3 sky=mix(skyHor,skyTop,smoothstep(0.,.55,rd.y));
  sky=mix(horizonC,sky,smoothstep(-.005,.13,rd.y));  // the low sky deepens toward the sand's tone
  sky+=sunC*(.20*pow(sunAmt,6.)+.35*pow(sunAmt,60.)*(.4+uDusk))*smoothstep(0.,.1,rd.y);

  // March the height map.
  // A crest seen against whatever is behind it is where a ray passes just above the sand.
  // Whenever the ray's clearance dips and rises again, that dip is pinned down precisely.
  // If it goes below zero the ray hit the crest; if not, "graze" records by how small an
  // angle it cleared. That angle is smooth from pixel to pixel, so a crest can be drawn
  // with the same continuous shading that makes the foreground ridges look clean.
  // Below ground (pricing, FAQ) the desert is not visible at all, so none of it is computed.
  float cut=-.35+uDepth*1.8+(n2(vec2(sp.x*3.+2.,1.))-.5)*.05;
  float um=uDepth>.01?smoothstep(cut,cut-.035,uv.y):0.;
  bool buried=um>.999;

  float t=.15; float hit=0.; float graze=1.; float tg=0.;
  float ta=.15; float da=1e3; float tb=.15; float db=1e3;
  float lo=.15; float hi=.15;
  if(rd.y<.4&&!buried){
    for(int i=0;i<110;i++){
      vec3 p=ro+rd*t;
      if(p.y>1.62&&rd.y>0.){t=100.;break;}
      float d=p.y-terrain(p.xz);
      if(d<0.){hit=1.;lo=tb;hi=t;break;}
      if(db<da&&db<=d&&db<.06*tb){
        float x0=ta; float x1=tb; float x2=t; float y1=db;
        for(int k=0;k<4;k++){
          float xl=.5*(x0+x1); float xr=.5*(x1+x2);
          vec3 pl=ro+rd*xl; float yl=pl.y-terrain(pl.xz);
          vec3 pr=ro+rd*xr; float yr=pr.y-terrain(pr.xz);
          if(yl<y1){x2=x1;x1=xl;y1=yl;}
          else if(yr<y1){x0=x1;x1=xr;y1=yr;}
          else{x0=xl;x2=xr;}
        }
        if(y1<0.){hit=1.;lo=ta;hi=x1;break;}
        if(y1/x1<graze){graze=y1/x1;tg=x1;}
      }
      ta=tb;da=db;tb=t;db=d;
      t+=clamp(d*.5,.004+.02*t,2.5);
      if(t>66.)break;
    }
    // out of steps while still pointing down at nearby ground: it is sand, never sky
    if(hit<.5&&t<66.&&rd.y<.02){hit=1.;lo=t;hi=t;}
    if(hit>.5){
      for(int i=0;i<6;i++){
        float m=.5*(lo+hi);
        vec3 p=ro+rd*m;
        if(p.y-terrain(p.xz)<0.)hi=m;else lo=m;
      }
      t=.5*(lo+hi);
    }
  }

  float px=1./(1.3*uRes.y);                       // one pixel, as an angle
  vec3 col=sky;
  float blur=1.;                                  // how far out of focus this pixel is
  float tHit=hit>.5?t:1e4;
  if(hit>.5){
    vec3 p=ro+rd*t;
    float e=.012+t*.004;
    float h0=terrain(p.xz);
    vec3 N=normalize(vec3(h0-terrain(p.xz+vec2(e,0.)),e,h0-terrain(p.xz+vec2(0.,e))));
    vec3 Ng=N;

    float focus=smoothstep(.45,1.5,t);            // very near sand is out of focus
    float near=smoothstep(11.,2.,t)*focus;
    float ph=dot(p.xz,vec2(.86,.5))*44.+n2(p.xz*1.3)*7.;
    N=normalize(N+vec3(.86,0.,.5)*cos(ph)*.11*near*smoothstep(.5,.95,N.y));

    // soft shadow from the low sun; many short dithered steps give a smooth edge
    // (skipped on faces turned from the sun, which are dark anyway, and in the far haze)
    float sh=1.;
    float facing=dot(Ng,L);                        // the dune's own slope, before ripples
    if(facing>0.&&t<42.){
      float s=.03+.06*hash2(gl_FragCoord.xy);
      vec3 sp0=p+Ng*(.02+.003*t);
      for(int i=0;i<18;i++){
        vec3 q=sp0+L*s;
        float dq=q.y-terrain(q.xz);
        sh=min(sh,3.2*dq/s);
        s+=clamp(dq*.7,.04+.006*t,.62);
        if(sh<.01||s>8.||q.y>1.62)break;
      }
      sh=smoothstep(0.,1.,clamp(sh,0.,1.));
      // A slope lying almost edge-on to the sun is dim already, and there a shadow ray only
      // scrapes its own surface and leaves smudges. Let cast shadows fade out on such slopes.
      sh=mix(1.,sh,smoothstep(0.,.2,facing));
    }
    vec2 sdir=normalize(-L.xz);
    sh*=cardShadow(p.xz,uS0,sdir)*cardShadow(p.xz,uS1,sdir);

    float hr=length(p.xz-uS0.xy);
    float pit=uHole*exp(-hr*hr/.11);                // deep in the hole little light gets in
    sh*=1.-.75*pit;
    float diff=clamp(dot(N,L)*1.25+.08,0.,1.);
    vec3 c=mix(shd,lit,diff*sh);
    c*=1.-.50*pit;
    c*=1.+.06*uHole*exp(-pow((hr-.52)/.2,2.));      // freshly turned sand on the rim is a touch paler
    c*=.90+.12*N.y;
    c*=.95+.10*n2(p.xz*.35);
    c*=1.+(hash2(floor(p.xz*230.))-.5)*.11*smoothstep(6.,1.5,t)*focus;

    // Glints: each grain has its own facet, so sparkles switch on and off as the view and
    // light move across them, rather than blinking on a timer.
    vec2 g=p.xz*70.; vec2 id=floor(g);
    float cell=hash2(id);
    vec3 facet=normalize(vec3(hash2(id+3.1)-.5,.55,hash2(id+7.7)-.5));
    vec3 Hh=normalize(L-rd);
    float flash=pow(max(dot(normalize(N*.35+facet),Hh),0.),70.);
    float rad=mix(.42,.14,focus);
    float dot_=smoothstep(rad,rad*.3,length(fract(g)-.5));
    float shimmer=.75+.25*sin(uTime*1.7+cell*90.);
    float nearness=smoothstep(5.5,.9,t);            // strong in the foreground, gone by the mid-ground
    c+=dot_*flash*shimmer*step(.72,cell)*nearness*nearness*(.25+.75*sh)*mix(.5,2.4,focus)*sunC;
    // wind-blown sand skimming the surface, lit where it crosses sunlight
    float drift=n2(vec2(dot(p.xz,vec2(.86,.5))*.9-uTime*.55,dot(p.xz,vec2(-.5,.86))*7.));
    c+=sunC*smoothstep(.62,.9,drift)*.07*sh*near;

    col=distance_(c,t,farTone,horizonC);
    blur=focusBlur(t);
  }
  // The crest this ray only just cleared, blended in by how nearly it touched it.
  // (fading out where the crest and what lies behind it are nearly the same place, so the
  // blend never switches on and off along a ridge)
  float cover=(1.-smoothstep(0.,px*1.5,graze))*step(.001,tg)*smoothstep(.96,.7,tg/tHit);
  if(cover>.003&&!buried){
    vec3 crest=sandTone((ro+rd*tg).xz,.012+tg*.004,L,shd,lit);
    col=mix(col,distance_(crest,tg,farTone,horizonC),cover);
    blur=mix(blur,focusBlur(tg),cover);
  }

  float ts=0.; float dust=0.;
  vec4 c0=buried?vec4(0.):card(uT0,uS0,uAsp.x,uFlip.x,uHole*HOLE_DEPTH*.85,ro,rd,tHit,uEye0,uEye0b,uLife.x,0.,ts,dust);
  col=col*(1.-c0.a)+c0.rgb;
  blur=mix(blur,focusBlur(ts),c0.a);
  col=mix(col,mix(lit,sunC,.25),clamp(dust,0.,1.)*.8);
  vec4 c1=buried?vec4(0.):card(uT1,uS1,uAsp.y,uFlip.y,0.,ro,rd,tHit,uEye1,vec4(0.,0.,.0001,.0001),uLife.y,1.7,ts,dust);
  c1*=smoothstep(11.,8.,ts);
  c1.rgb*=mix(vec3(1.),vec3(1.,.84,.74),uDusk);
  col=col*(1.-c1.a)+c1.rgb;
  blur=mix(blur,focusBlur(ts),c1.a);

  // Light in the air: faint shafts fanning from the sun, and a few drifting motes that
  // flare as they cross them.
  vec2 sunP=vec2(-1.75,1.35);
  vec2 sv=sp-sunP;
  float ang=atan(sv.y,sv.x);
  float shafts=n2(vec2(ang*9.,uTime*.035))*n2(vec2(ang*23.+4.,-uTime*.02));
  float reach=smoothstep(3.1,.9,length(sv));
  float air=(1.-uDepth);
  col+=sunC*shafts*reach*.11*air;
  {
    // a handful of motes, close to the lens only: large, soft and low in the frame
    vec2 mg=sp*5.5+vec2(uTime*.09+uCam*1.6,sin(uTime*.2)*.3-uCam*.3);
    vec2 mi=floor(mg);
    float mh=hash2(mi+17.);
    vec2 mo=vec2(hash2(mi+1.3),hash2(mi+5.9))*.6+.2;
    float md=length(fract(mg)-mo);
    float tw=.5+.5*sin(uTime*(1.+mh*2.)+mh*40.);
    col+=sunC*step(.86,mh)*smoothstep(.07,.0,md)*tw*(.05+.3*shafts*reach)*smoothstep(.62,.25,uv.y)*air;
  }

  if(um>0.){
    float yy=uv.y-uScroll;
    vec3 u=mix(vec3(.722,.560,.386),vec3(.812,.672,.486),uv.y);
    float st=n2(vec2(sp.x*.6,yy*9.+n2(vec2(sp.x*1.6,yy*1.6))*1.8));
    u*=.95+.08*st;
    u*=1.-.035*smoothstep(.45,.55,fract(yy*3.1+n2(vec2(sp.x*1.2,yy))*.9));
    u*=1.+(hash2(floor(gl_FragCoord.xy/2.))-.5)*.045;
    u=mix(u*1.12,u,smoothstep(0.,.03,cut-uv.y));
    u+=vec3(.09,.06,.02)*exp(-length(sp-vec2(.2*asp,.55))*2.)*smoothstep(.5,1.,uDepth);
    col=mix(col,u,um);
    blur*=1.-um;
  }

  col+=(hash2(gl_FragCoord.xy+fract(uTime)*61.)-.5)/160.;
  gl_FragColor=vec4(col,blur);    // alpha carries the focus amount to the second pass
}`

// Second pass: soft focus. The scene is drawn into a texture; here each pixel is blurred by
// the amount the first pass stored for it, so the foreground stays crisp and the distance
// goes gently out of focus, like the shallow depth of field in the launch art. A sample
// only contributes if it is itself out of focus, so sharp near edges never smear outward.
const POST = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uPx;
void main(){
  vec2 uv=gl_FragCoord.xy*uPx;
  vec4 c=texture2D(uTex,uv);
  // Edge smoothing: where a pixel differs sharply from its neighbours (a crest against the
  // dune behind it, the mascot's outline) blend it part-way with them. Flat sand has no
  // such contrast and is left untouched, so grain and glints stay crisp.
  vec3 n=texture2D(uTex,uv+vec2(0.,uPx.y)).rgb, s_=texture2D(uTex,uv-vec2(0.,uPx.y)).rgb;
  vec3 e=texture2D(uTex,uv+vec2(uPx.x,0.)).rgb, w_=texture2D(uTex,uv-vec2(uPx.x,0.)).rgb;
  vec3 lum=vec3(.3,.59,.11);
  float lc=dot(c.rgb,lum), ln=dot(n,lum), ls=dot(s_,lum), le=dot(e,lum), lw=dot(w_,lum);
  float edge=max(max(ln,ls),max(le,max(lw,lc)))-min(min(ln,ls),min(le,min(lw,lc)));
  c.rgb=mix(c.rgb,(n+s_+e+w_)*.25,clamp((edge-.035)*7.,0.,.45));
  float r=c.a*2.6;
  vec3 sum=c.rgb; float w=1.;
  for(int i=0;i<8;i++){
    float a=float(i)*.7853982;
    vec2 o=vec2(cos(a),sin(a))*(mod(float(i),2.)<.5?1.:.55);
    vec4 s=texture2D(uTex,uv+o*r*uPx);
    float ws=smoothstep(c.a*.3,c.a*.75+.002,s.a);
    sum+=s.rgb*ws; w+=ws;
  }
  gl_FragColor=vec4(sum/w,1.);
}`


const SOFTWARE_RENDERER = /swiftshader|llvmpipe|lavapipe|softpipe|microsoft basic render|software (?:rasterizer|renderer)/i

export function isSoftwareRenderer(gl) {
  const renderer = String(gl.getParameter?.(gl.RENDERER) || '')
  if (SOFTWARE_RENDERER.test(renderer)) return true
  const debugInfo = gl.getExtension?.('WEBGL_debug_renderer_info')
  if (!debugInfo) return false
  const unmasked = String(gl.getParameter?.(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
  return SOFTWARE_RENDERER.test(unmasked)
}

export function createScene(canvas, sprites) {
  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: true,
  })
  if (!gl) return null
  if (isSoftwareRenderer(gl)) {
    gl.getExtension?.('WEBGL_lose_context')?.loseContext?.()
    return null
  }

  // Compiling these shaders is the one heavy start-up cost. Where the browser supports it,
  // that work happens off the main thread and the page stays responsive; the scene simply
  // starts drawing once it is ready (see render()).
  const parallel = gl.getExtension('KHR_parallel_shader_compile')
  const build = (frag) => {
    const pr = gl.createProgram()
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, frag]]) {
      const sh = gl.createShader(type)
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      gl.attachShader(pr, sh)
    }
    gl.bindAttribLocation(pr, 0, 'a')
    gl.linkProgram(pr)
    return pr
  }
  const prog = build(FRAG)
  const post = build(POST)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  // The scene is drawn into this texture, then the focus pass draws it to the screen.
  const target = gl.createTexture()
  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, target)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  const fbo = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  // Sprite textures start as one transparent pixel and fill in when the image arrives.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
  let dirty = true
  sprites.forEach((sp, i) => {
    const tex = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0 + i)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4))
    const img = new Image()
    img.onload = () => {
      gl.activeTexture(gl.TEXTURE0 + i)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img) // power-of-two files
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      dirty = true
    }
    img.src = sp.src
  })

  // Uniforms can only be looked up once linking has finished.
  const U = {}
  const P = {}
  let state = 'compiling' // -> 'ready' | 'failed'
  function finishSetup() {
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS) || !gl.getProgramParameter(post, gl.LINK_STATUS)) {
      console.warn('Scene shader failed', gl.getProgramInfoLog(prog) || gl.getProgramInfoLog(post))
      state = 'failed'
      return
    }
    for (const name of ['uRes', 'uTime', 'uCam', 'uDepth', 'uDusk', 'uHaze', 'uScroll', 'uT0', 'uT1', 'uS0', 'uS1', 'uAsp', 'uEye0', 'uEye0b', 'uEye1', 'uLife', 'uFlip', 'uHole']) {
      U[name] = gl.getUniformLocation(prog, name)
    }
    P.uTex = gl.getUniformLocation(post, 'uTex')
    P.uPx = gl.getUniformLocation(post, 'uPx')
    gl.useProgram(post)
    gl.uniform1i(P.uTex, 2)
    gl.useProgram(prog)
    gl.uniform1i(U.uT0, 0)
    gl.uniform1i(U.uT1, 1)
    gl.uniform2f(U.uAsp, sprites[0].aspect, sprites[1].aspect)
    gl.uniform4f(U.uEye0, ...sprites[0].eyes[0])
    gl.uniform4f(U.uEye0b, ...(sprites[0].eyes[1] || [0, 0, 0.0001, 0.0001]))
    gl.uniform4f(U.uEye1, ...sprites[1].eyes[0])
    gl.uniform2f(U.uFlip, sprites[0].flip ? 1 : 0, sprites[1].flip ? 1 : 0)
    state = 'ready'
  }
  function poll() {
    if (state !== 'compiling') return
    if (parallel && !(gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR) && gl.getProgramParameter(post, parallel.COMPLETION_STATUS_KHR))) return
    finishSetup()
  }

  return {
    get dirty() { return dirty },
    get failed() { return state === 'failed' },
    resize(w, h) {
      if (canvas.width === w && canvas.height === h) return
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, target)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      dirty = true
    },
    // Draws one frame. Returns false while the shaders are still being prepared.
    render(s) {
      poll()
      if (state !== 'ready') return false
      gl.useProgram(prog)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.uniform2f(U.uRes, canvas.width, canvas.height)
      gl.uniform1f(U.uTime, s.time)
      gl.uniform1f(U.uCam, s.cam)
      gl.uniform1f(U.uDepth, s.depth)
      gl.uniform1f(U.uDusk, s.dusk)
      gl.uniform1f(U.uHaze, s.haze)
      gl.uniform1f(U.uScroll, s.scroll)
      gl.uniform4f(U.uS0, ...s.s0)
      gl.uniform4f(U.uS1, ...s.s1)
      gl.uniform3f(U.uLife, ...s.life)
      gl.uniform1f(U.uHole, s.hole)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.useProgram(post)
      gl.uniform2f(P.uPx, 1 / canvas.width, 1 / canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      dirty = false
      return true
    },
  }
}
