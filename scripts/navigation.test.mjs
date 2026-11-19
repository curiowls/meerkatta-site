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
