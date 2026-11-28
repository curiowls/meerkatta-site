import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

test('Section rail is inert while hidden and stays stable until focus leaves', () => {
  const events = {};
  const classes = new Set();
  const anchors = ['capture','work'].map(id => ({dataset:{sectionAnchor:id},setAttribute() {},removeAttribute() {}}));
  let top = 500;
  const target = {id:'capture',getBoundingClientRect:() => ({top,bottom:top+1000}),querySelector:() => ({getBoundingClientRect:() => ({top,left:0})})};
  const document = {activeElement:null,querySelector:selector => selector==='main'?{getBoundingClientRect:() => ({top:0,left:0})}:rail,querySelectorAll:() => [],getElementById:id => id==='capture'?target:null};
  const rail = {inert:true,style:{},querySelectorAll:() => anchors,contains:element => anchors.includes(element),classList:{add:key => classes.add(key),remove:key => classes.delete(key)},addEventListener:(event,handler) => events[event]=handler};
  const window = {innerHeight:1000,requestAnimationFrame:handler => handler(),addEventListener:(event,handler) => events[event]=handler};
  const source = readFileSync(new URL('../main.js',import.meta.url),'utf8').replace("import './style.css';",'');
  runInNewContext(source,{document,window});
  assert.equal(rail.inert,true);
  top=0;events.resize();
  assert.equal(rail.inert,false);
  assert.ok(classes.has('is-visible'));
  document.activeElement=anchors[0];top=500;events.resize();
  assert.equal(rail.inert,false);
  document.activeElement=null;events.focusout();
  assert.equal(rail.inert,true);
  assert.ok(!classes.has('is-visible'));
});

test('Floating page nav tracks active section, bottom of page, and floating state', () => {
  const windowEvents = {};
  const navClasses = new Set();
  const rootClasses = new Set();
  const attrs = new Map();
  let sentinelBottom = 200;
  let scrollY = 0;
  const tops = { modes: 420, keyboard: 1100, faq: 2200 };

  const makeLink = id => ({
    getAttribute: name => (name === 'href' ? `#${id}` : attrs.get(`${id}:${name}`) ?? null),
    setAttribute: (name, value) => attrs.set(`${id}:${name}`, value),
    removeAttribute: name => attrs.delete(`${id}:${name}`),
    addEventListener: () => {},
  });
  const links = ['modes', 'keyboard', 'faq'].map(makeLink);
  const sentinel = {
    matches: selector => selector === '[data-page-nav-sentinel]',
    getBoundingClientRect: () => ({ bottom: sentinelBottom }),
  };
  const pageNav = {
    previousElementSibling: sentinel,
    style: { setProperty: () => {} },
    classList: { toggle: (name, force) => (force ? navClasses.add(name) : navClasses.delete(name)) },
    getBoundingClientRect: () => ({ height: 48 }),
    querySelectorAll: selector => (selector === 'a[href^="#"]' ? links : []),
    querySelector: () => null,
  };
  const document = {
    documentElement: {
      scrollHeight: 3000,
      classList: { add: name => rootClasses.add(name) },
      style: { setProperty: () => {} },
    },
    querySelector: selector => (selector === '.w-nav' ? { getBoundingClientRect: () => ({ height: 60 }) } : null),
    querySelectorAll: selector => (selector === '[data-page-nav]' ? [pageNav] : []),
    getElementById: id => (id in tops ? { id, getBoundingClientRect: () => ({ top: tops[id] }) } : null),
  };
  const window = {
    get scrollY() { return scrollY; },
    innerHeight: 900,
    requestAnimationFrame: handler => handler(),
    addEventListener: (event, handler) => { windowEvents[event] = handler; },
  };
  const source = readFileSync(new URL('../main.js', import.meta.url), 'utf8').replace("import './style.css';", '');
  runInNewContext(source, { document, window, setTimeout, clearTimeout });

  assert.ok(rootClasses.has('has-page-nav'));
  assert.equal(navClasses.has('is-floating'), false);
  assert.equal(attrs.get('modes:aria-current'), undefined);

  // Scroll into Keyboard section past sentinel.
  sentinelBottom = 10;
  tops.modes = -400;
  tops.keyboard = 120;
  tops.faq = 1200;
  scrollY = 980;
  windowEvents.scroll();
  assert.equal(navClasses.has('is-floating'), true);
  assert.equal(attrs.get('keyboard:aria-current'), 'location');
  assert.equal(attrs.get('modes:aria-current'), undefined);

  // Reach bottom of page -> highlights final section (faq).
  scrollY = 2100;
  windowEvents.scroll();
  assert.equal(attrs.get('faq:aria-current'), 'location');
  assert.equal(attrs.get('keyboard:aria-current'), undefined);
});
