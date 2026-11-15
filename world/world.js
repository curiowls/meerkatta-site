// Orchestrates the page: scroll position drives the coded desert, the travelling orb,
// and which sections are expanded. All copy is plain HTML and works without this file.
import { createScene } from './scene.js'

const root = document.documentElement
root.classList.add('js')

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const pinMq = matchMedia('(min-width: 900px) and (min-height: 700px)')
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const mix = (a, b, t) => a + (b - a) * t
const ease = (t) => t * t * (3 - 2 * t)
const docTop = (el) => el.getBoundingClientRect().top + scrollY

const sections = Object.fromEntries(['lookout', 'work', 'voice', 'home', 'ready'].map((id) => [id, document.getElementById(id)]))
const stops = [...document.querySelectorAll('[data-expand]')]
const spots = [...document.querySelectorAll('[data-orb-spot]')]

// The same dune height the shader uses, so the page knows where the mascot stands.
const fract = (v) => v - Math.floor(v)
function hash2(x, y) {
  let a = fract(x * 0.1031), b = fract(y * 0.1031), c = fract(x * 0.1031)
  const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33)
  a += d; b += d; c += d
  return fract((a + b) * c)
}
function n2(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const q = (f) => f * f * f * (f * (f * 6 - 15) + 10)
  const fx = q(x - ix), fy = q(y - iy)
  return mix(mix(hash2(ix, iy), hash2(ix + 1, iy), fx), mix(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), fx), fy)
}
function groundHeight(x, z) {
  const qx = (x * 0.8 + z * 0.6) * 0.17, qy = (-x * 0.6 + z * 0.8) * 0.4
  const a = n2(qx, qy + 0.3 * n2(qx * 0.7 + 4, qy * 0.7 + 4))
  const r = a < 0.5 ? Math.pow(2 * a, 1.55) : Math.pow(2 - 2 * a, 0.8)
  const dunes = r * (0.55 + 0.45 * n2(qx * 1.9 + 7.3, qy * 1.9 + 7.3)) * 1.2 + n2(x * 0.5 + 3.1, z * 0.5 + 3.1) * 0.16
  const t = clamp((Math.abs(x + Math.sin(z * 0.21) * 1.1) - 0.5) / 4.1)
  return dunes * mix(0.24, 1, t * t * (3 - 2 * t))
}

// Where the Lookout mascot is in the world; shared by the scene and the orb.
const MASCOT = { z: 7.5, h: 1.6, aspect: 0.4744, show: 0.58, x: () => (innerWidth >= 900 ? 1.6 : 0.6) }

// A resting place for the orb that is not an element: a point up and to the left of the
// mascot's eyes, where it is looking. It follows the mascot as the camera moves.
const gazeSpot = {
  dataset: { live: '', hold: '0.6' },
  closest: () => null,
  getBoundingClientRect() {
    const x = MASCOT.x()
    const rise = Math.max(state.rise, 0.42) * MASCOT.show          // aim where the head will be even before it is up
    const base = groundHeight(x, MASCOT.z) - MASCOT.h * (1 - rise) - MASCOT.h * 0.02
    const dz = MASCOT.z - state.cam * 2.2
    const eyeX = x + (0.355 - 0.5) * MASCOT.h * MASCOT.aspect      // mirrored sprite: the eye sits left of centre
    const eyeY = base + 0.94 * MASCOT.h
    const px = (v) => v * innerHeight                              // scene units are fractions of the viewport height
    const cx = innerWidth / 2 + px((eyeX / dz) * 1.3)
    const cy = innerHeight - px(0.54 + state.depth * 0.75 + ((eyeY - 0.8) / dz) * 1.3)
    const reach = px((MASCOT.h / dz) * 1.3) * 0.5                  // half the mascot's height on screen
    const size = clamp(reach * 0.36, 46, 70)
    const gx = cx - reach * 0.62, gy = cy - reach * 0.5
    return { left: gx - size / 2, top: gy - size / 2, width: size, height: size }
  },
}
spots.splice(1, 0, gazeSpot)
const orb = document.querySelector('[data-orb]')

let vh = innerHeight
let box = {}        // section id -> { top, h }
let tracks = {}     // scene property -> [[scrollY, value], ...]
let spotAt = []     // scrollY at which the orb rests on each spot

/* ---------- Measure ---------- */
function measure() {
  vh = innerHeight
  for (const [id, el] of Object.entries(sections)) box[id] = { top: docTop(el), h: el.offsetHeight }
  const b = box
  const end = root.scrollHeight - vh
  const keys = [
    [0, { cam: 0, depth: 0, dusk: 0, haze: 1 }],
    [b.lookout.top - 0.3 * vh, { cam: 0.8 }],
    [b.lookout.top + b.lookout.h - vh, { cam: 1.5 }],
    [b.work.top, { cam: 2.3 }],
    [b.work.top + b.work.h - vh, { cam: 2.8 }],
    [b.voice.top, { cam: 3.4, haze: 1 }],
    [b.voice.top + 0.5 * vh, { haze: 0.3 }],
    [b.voice.top + b.voice.h - vh, { cam: 3.9, haze: 0.3 }],
    [b.home.top - 0.1 * vh, { cam: 4.4, depth: 0, dusk: 0, haze: 0.6 }],
    [b.home.top + 0.6 * vh, { cam: 4.6, depth: 1 }],
    [b.ready.top - 1.2 * vh, { cam: 6.2, depth: 1, dusk: 1, haze: 0.75 }],
    [b.ready.top - 0.15 * vh, { cam: 6.5, depth: 0 }],
    [end + 2, { cam: 6.56 }],
  ]
  tracks = {}
  let lastY = -1
  for (const [rawY, values] of keys) {
    const y = Math.max(rawY, lastY + 1) // short sections on phones can put keys out of order
    lastY = y
    for (const [prop, v] of Object.entries(values)) (tracks[prop] ??= []).push([y, v])
  }

  let last = -1
  spotAt = spots.map((spot, i) => {
    const stop = spot.closest('.stop')
    let y = 0
    // the gaze point is reached while the mascot is rising, before the Lookout stop pins
    if (spot === gazeSpot) y = box.lookout.top - (pinMq.matches ? 0.42 : 0.95) * vh
    else if (i > 0 && stop && pinMq.matches) y = docTop(stop) + Number(spot.dataset.at || 0.6) * (stop.offsetHeight - vh)
    else if (i > 0) y = docTop(spot) - vh * 0.5
    y = Math.max(y, last + 1)
    last = y
    return y
  })
}

function track(prop, y) {
  const t = tracks[prop]
  if (y <= t[0][0]) return t[0][1]
  for (let i = 1; i < t.length; i++) {
    if (y <= t[i][0]) return mix(t[i - 1][1], t[i][1], ease((y - t[i - 1][0]) / (t[i][0] - t[i - 1][0])))
  }
  return t.at(-1)[1]
}

/* ---------- Scroll to expand ---------- */
function setOpen(stop, open) {
  if (stop.classList.contains('is-open') === open) return
  stop.classList.toggle('is-open', open)
  stop.querySelector('[data-more-cue]')?.setAttribute('aria-expanded', String(open))
}
function updateStops(y) {
  for (const stop of stops) {
    if (pinMq.matches) {
      const pr = (y - docTopCache.get(stop)) / Math.max(1, stop.offsetHeight - vh)
      if (pr > 0.3) setOpen(stop, true)
      else if (pr < 0.2 && !stop.dataset.held) setOpen(stop, false)
      // scrolling on through the Lookout stop moves from the iPhone view to the Mac view
      if (stop.id === 'lookout' && !segManual) showDevice(pr > 0.66 ? 'cap-mac' : 'cap-iphone')
    } else if (!stop.dataset.manual && stop.getBoundingClientRect().top < vh * 0.45) {
      setOpen(stop, true) // on phones it opens once and stays open, so the page never jumps
    }
  }
}
const docTopCache = new Map()
function cacheStops() { for (const stop of stops) docTopCache.set(stop, docTop(stop)) }

for (const stop of stops) {
  const cue = stop.querySelector('[data-more-cue]')
  cue.setAttribute('aria-expanded', 'false')
  cue.addEventListener('click', () => {
    const open = !stop.classList.contains('is-open')
    if (pinMq.matches) {
      const span = stop.offsetHeight - vh
      scrollTo({ top: docTop(stop) + span * (open ? 0.45 : 0.05), behavior: reduced ? 'auto' : 'smooth' })
    } else {
      stop.dataset.manual = 'true'
      setOpen(stop, open)
    }
  })
}

/* ---------- iPhone / Mac switch in the Lookout stop ---------- */
const seg = document.querySelector('[data-seg]')
const segTabs = [...seg.querySelectorAll('[role="tab"]')]
let segManual = false
let segShown = ''
function showDevice(id) {
  if (id === segShown) return
  segShown = id
  for (const tab of segTabs) {
    const on = tab.getAttribute('aria-controls') === id
    tab.setAttribute('aria-selected', String(on))
    tab.tabIndex = on ? 0 : -1
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !on
  }
}
segTabs.forEach((tab, i) => {
  tab.addEventListener('click', () => { segManual = true; showDevice(tab.getAttribute('aria-controls')) })
  tab.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const next = segTabs[(i + (e.key === 'ArrowRight' ? 1 : segTabs.length - 1)) % segTabs.length]
    next.focus(); next.click()
  })
})
showDevice('cap-iphone')

/* ---------- The travelling orb ---------- */
function updateOrb(y) {
  let i = 0
  while (i < spotAt.length - 1 && y >= spotAt[i + 1]) i++
  const j = Math.min(i + 1, spots.length - 1)
  const u = j === i ? 0 : (y - spotAt[i]) / (spotAt[j] - spotAt[i])
  const hold = Number(spots[i].dataset.hold || 0.3)   // how long the orb rests on a spot before leaving
  const t = ease(clamp((u - hold) / (0.88 - hold)))
  const a = spots[i].getBoundingClientRect()
  const b = spots[j].getBoundingClientRect()
  const size = mix(a.width, b.width, t)
  const x = mix(a.left + a.width / 2, b.left + b.width / 2, t)
  const yy = mix(a.top + a.height / 2, b.top + b.height / 2, t) - Math.sin(t * Math.PI) * vh * 0.07
  const near = t < 0.5 ? spots[i] : spots[j]
  orb.style.setProperty('--size', `${size.toFixed(1)}px`)
  orb.style.transform = `translate3d(${(x - size / 2).toFixed(1)}px, ${(yy - size / 2).toFixed(1)}px, 0)`
  orb.style.setProperty('--ground', ('ground' in spots[i].dataset ? 1 - t : 0).toFixed(2))
  orb.style.setProperty('--glow', (near === spots.at(-1) ? 0.9 : 0.45).toFixed(2))
  orb.classList.toggle('is-live', !reduced && 'live' in near.dataset && (t < 0.08 || t > 0.92))
  orb.style.visibility = 'visible'
}

/* ---------- Scene ---------- */
const canvas = document.querySelector('[data-scene]')
const tScene0 = performance.now()
const scene = createScene(canvas, [
  // eyes: [centre u, centre v, radius u, radius v] in the sprite, used for blinking
  { src: '/world/curious.webp', aspect: 0.4744, flip: true, eyes: [[0.645, 0.942, 0.06, 0.021], [0.79, 0.962, 0.024, 0.013]] },
  { src: '/world/standing-profile.webp', aspect: 0.5039, eyes: [[0.725, 0.917, 0.05, 0.024]] },
])
if (!scene) canvas.remove()
// (a scene whose shaders fail to compile simply never fades in; the CSS backdrop stays)
const sceneSetupMs = performance.now() - tScene0

const state = { cam: 0, depth: 0, dusk: 0, haze: 1, rise: 0, riseV: 0, hole: 0 }

// Blinks: a quick close-and-open every few seconds, sometimes twice in a row.
const blinks = [{ next: 1.5, start: -1 }, { next: 2.6, start: -1 }]
function blinkAmount(b, time) {
  if (b.start < 0 && time > b.next) b.start = time
  if (b.start < 0) return 0
  const u = (time - b.start) / 0.17
  if (u >= 1) { b.start = -1; b.next = time + (Math.random() < 0.25 ? 0.22 : 2.4 + Math.random() * 3.2); return 0 }
  return Math.sin(u * Math.PI)
}
// If the device can't keep up while scrolling, render the scene at a lower resolution.
let quality = 1
let slow = 0
let drawn = 0
function watchSpeed(dt) {
  drawn++
  if (dt > 0.034) slow++
  if (drawn < 24) return
  if (slow > 10 && quality > 0.36) { quality *= 0.8; sizeCanvas() }
  drawn = slow = 0
}
function sizeCanvas() {
  if (!scene) return
  // The scene is soft by nature and its edges are smoothed in the shader, so it is drawn at
  // roughly one canvas pixel per CSS pixel and scaled up; that costs half as much as before.
  const scale = Math.min(devicePixelRatio || 1, 1.5) * (innerWidth < 760 ? 0.7 : 0.62) * quality
  // never more than about a million pixels, however large the window
  const fit = Math.min(1, Math.sqrt(1.05e6 / (canvas.clientWidth * canvas.clientHeight * scale * scale)))
  scene.resize(Math.round(canvas.clientWidth * scale * fit), Math.round(canvas.clientHeight * scale * fit))
}

function mascotRise(y) {
  const top = box.lookout.top
  if (pinMq.matches) {
    const openY = top + 0.3 * (box.lookout.h - vh)
    return Math.min(peekThenRise(clamp((y - (top - 0.8 * vh)) / (0.5 * vh))), 1 - ease(clamp((y - (openY - 0.15 * vh)) / (0.25 * vh))))
  }
  return Math.min(peekThenRise(clamp((y - (top - 1.2 * vh)) / (0.35 * vh))), 1 - ease(clamp((y - (top - 0.6 * vh)) / (0.25 * vh))))
}
// Ears and eyes first, a beat to look around, then all the way up.
function peekThenRise(p) {
  if (p < 0.3) return ease(p / 0.3) * 0.42
  if (p < 0.5) return 0.42
  return 0.42 + ease((p - 0.5) / 0.5) * 0.58
}

let lastKey = ''
let lastNow = performance.now()
let lastDraw = -1e9
const nav = document.querySelector('.w-nav')
let navTint = [-1, -1]
let sceneLive = false
let sceneLiveAt = 0
function tick(now) {
  requestAnimationFrame(tick)
  if (!document.hidden) step(now)
}
function step(now, force = false) {
  const y = scrollY
  updateStops(y)
  updateOrb(y)
  if (!scene) return

  // time-based smoothing, so the scene keeps up with scroll at any frame rate
  const dt = Math.min(0.1, (now - lastNow) / 1000)
  lastNow = now
  const k = reduced ? 1 : 1 - Math.exp(-dt * 9)
  for (const prop of ['cam', 'depth', 'dusk', 'haze']) state[prop] += (track(prop, y) - state[prop]) * k
  // the mascot moves on a spring, so it pops up with a small bounce and settles
  if (reduced) { state.rise = mascotRise(y); state.riseV = 0 } else {
    state.riseV += ((mascotRise(y) - state.rise) * 70 - state.riseV * 9.5) * dt
    state.rise = clamp(state.rise + state.riseV * dt, 0, 1.12)
  }

  // The header's veil takes the colour of what is behind it: sky-cream above ground,
  // sand once the page has gone underground, and warm peach at dusk.
  const under = Math.round(clamp(state.depth) * 20) / 20
  const dusk = Math.round(clamp(state.dusk) * 20) / 20
  if (under !== navTint[0] || dusk !== navTint[1]) {
    navTint = [under, dusk]
    const sky = [251, 246, 238].map((v, i) => mix(v, [238, 206, 180][i], dusk))
    const c = sky.map((v, i) => Math.round(mix(v, [222, 192, 152][i], under)))
    nav.style.setProperty('--nav-tint', c.join(', '))
  }

  // The hole opens just ahead of the mascot and stays for a while after it ducks back down.
  const holeTarget = clamp(state.rise * 4)
  state.hole += (holeTarget - state.hole) * (reduced ? 1 : 1 - Math.exp(-dt * (holeTarget > state.hole ? 9 : 0.35)))
  const time = reduced ? 0 : now / 1000
  const life = reduced ? [0, 0, 0] : [blinkAmount(blinks[0], time), blinkAmount(blinks[1], time), clamp(Math.abs(state.riseV) * 0.55)]
  const key = `${state.cam.toFixed(4)}|${state.depth.toFixed(4)}|${state.dusk.toFixed(3)}|${state.haze.toFixed(3)}|${state.rise.toFixed(3)}|${state.hole.toFixed(3)}|${y}`
  // How often the scene is redrawn, which is most of what it costs:
  //  - while scrolling or while the mascot blinks or moves: up to 60 times a second
  //  - while nothing changes but the slow sway, light and drifting sand: 30 times a second
  //  - underground (pricing, FAQ), where nothing in it moves: only when you scroll
  // The page itself still scrolls at the display's full rate; only this picture is paced.
  const changed = key !== lastKey || scene.dirty
  const lively = life[0] > 0 || life[1] > 0 || life[2] > 0.01
  const still = reduced || state.depth > 0.999
  if (!force) {
    if (!changed && !lively && still) return
    if (now - lastDraw < (changed || lively ? 15 : 32)) return
  }
  if (key !== lastKey) watchSpeed(dt)
  const wide = innerWidth >= 900
  const drawn = scene.render({
    time,
    life,
    hole: state.hole,
    cam: state.cam, depth: state.depth, dusk: state.dusk, haze: state.haze,
    scroll: y / vh,
    s0: [MASCOT.x(), MASCOT.z, MASCOT.h, state.rise * MASCOT.show],
    s1: [wide ? -1.9 : 0, 20.5, wide ? 1.7 : 1.5, 1],
  })
  if (!drawn) return            // shaders still being prepared; the CSS backdrop shows meanwhile
  lastKey = key
  lastDraw = now
  if (!sceneLive) {             // first real frame: fade the scene in over the backdrop
    sceneLive = true
    sceneLiveAt = performance.now()
    canvas.classList.add('is-live')
  }
}

/* ---------- Journey rail ---------- */
const rail = document.querySelector('[data-rail]')
const railItems = new Map([...rail.querySelectorAll('a')].map((a) => [a.hash.slice(1), a.parentElement]))
const stopObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue
    railItems.forEach((li) => li.classList.remove('is-current'))
    railItems.get(e.target.id)?.classList.add('is-current')
  }
}, { rootMargin: '-45% 0px -45% 0px' })
document.querySelectorAll('[data-stop]').forEach((el) => stopObserver.observe(el))

/* ---------- Boot ---------- */
function relayout() { measure(); cacheStops(); sizeCanvas() }
let timer
const schedule = () => { clearTimeout(timer); timer = setTimeout(relayout, 100) }
addEventListener('resize', schedule)
new ResizeObserver(schedule).observe(document.querySelector('main'))
pinMq.addEventListener('change', schedule)

relayout()
if (import.meta.env?.DEV) {
  window.__world = {
    state, get tracks() { return tracks }, get box() { return box },
    get timing() { return { sceneSetupMs: Math.round(sceneSetupMs), sceneLiveAtMs: Math.round(sceneLiveAt) } },
    // GPU cost of one scene frame in ms, measured without waiting for animation frames
    bench(n = 12) {
      const gl = canvas.getContext('webgl'), px = new Uint8Array(4)
      const frame = () => { lastKey = ''; step(performance.now(), true); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px) }
      frame()
      const t0 = performance.now()
      for (let i = 0; i < n; i++) frame()
      return { ms: +((performance.now() - t0) / n).toFixed(1), canvas: [canvas.width, canvas.height], quality }
    },
  }
}
for (const prop of ['cam', 'depth', 'dusk', 'haze']) state[prop] = track(prop, scrollY)
step(performance.now(), true) // place the orb and, if the scene is ready, paint it; a background tab gets no animation frames
requestAnimationFrame(tick)
