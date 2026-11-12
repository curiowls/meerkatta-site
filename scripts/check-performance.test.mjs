import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Animated stories wait until meaningfully visible before loading', async () => {
  const target = {};
  const observed = [];
  const unobserved = [];
  const mounted = [];
  let callback;
  let options;
  const source = read('motion.js').split('const motion =')[0]
    .replace("import {playbackIcon} from './playback-icons.js';", '')
    .replace("import('./stories.jsx')", 'Promise.resolve({mountStory})');
  runInNewContext(source, {
    document:{querySelectorAll: () => [target]},
    mountStory: element => mounted.push(element),
    IntersectionObserver: class {
      constructor(handler, config) { callback = handler; options = config; }
      observe(element) { observed.push(element); }
      unobserve(element) { unobserved.push(element); }
    },
  });
  assert.deepEqual(observed, [target]);
  assert.equal(options.threshold, 0.15);
  assert.equal(options.rootMargin, undefined);
  for (const [isIntersecting, intersectionRatio] of [[false, 0], [true, 0.01], [true, 0.14]]) {
    callback([{target, isIntersecting, intersectionRatio}]);
  }
  await Promise.resolve();
  assert.equal(mounted.length, 0);
  assert.equal(unobserved.length, 0);
  callback([{target, isIntersecting:true, intersectionRatio:0.15}]);
  await Promise.resolve();
  assert.deepEqual(unobserved, [target]);
  assert.deepEqual(mounted, [target]);
});

test('Capture video retains its poster and controls without early media fetching', () => {
  const home = read('index.html');
  const video = home.match(/<video\b[^>]*>/)[0];
  assert.ok(video.includes('preload="none"'));
  assert.ok(video.includes('poster="/media/lock-capture-poster.jpg?v=3"'));
  assert.ok(video.includes('controls'));
  assert.ok(video.includes('aria-describedby="capture-caption"'));
});

const rgb = hex => hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16));
const luminance = color => color.map(value => {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}).reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

test('Small muted captions meet AA contrast on site and demo surfaces', () => {
  const css = read('style.css');
  assert.ok(css.match(/\.eyebrow\s*\{[^}]*color:\s*var\(--ink-dim\)/));
  const rgba = css.match(/--ink-dim:\s*rgba\(([^)]+)\)/)[1].split(',').map(Number);
  for (const background of ['#f8f7f4', '#ffffff', '#f4f3f2', '#f2eee6']) {
    const bg = rgb(background);
    const fg = bg.map((value, i) => rgba[i] * rgba[3] + value * (1 - rgba[3]));
    assert.ok(contrast(fg, bg) >= 4.5, background);
  }
  const story = read('stories.jsx');
  const rawLabel = story.match(/color:'(#[a-f\d]+)'\}\}>Raw thought/)[1];
  assert.ok(contrast(rgb(rawLabel), rgb('#e5ddcf')) >= 4.5);
});
