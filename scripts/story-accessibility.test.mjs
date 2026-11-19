import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {transformSync} from 'esbuild';

const code=transformSync(readFileSync(new URL('../stories.jsx',import.meta.url),'utf8'),{loader:'jsx',format:'cjs'}).code;
for (const kind of ['work','thought']) {
  test(`${kind} demo preserves the appropriate accessible fallback through render failure`, () => {
    const attributes=new Map();
    const classes=new Set();
    const fallback={setAttribute:(key,value) => attributes.set(key,value),removeAttribute:key => attributes.delete(key)};
    const mount={hidden:false};
    const element={dataset:{story:kind},querySelector:selector => selector==='[data-story-player]'?mount:fallback,classList:{add:key => classes.add(key),remove:key => classes.delete(key)}};
    let rootOptions;
    const module={exports:{}};
    runInNewContext(code,{module,require:id => {
      if (id==='react') return {createElement:() => null};
      if (id==='react-dom/client') return {createRoot:(_mount,options) => {rootOptions=options;return {render() {}};}};
      return {};
    }});
    module.exports.mountStory(element);
    assert.equal(attributes.get('aria-hidden'),kind==='work'?'true':undefined);
    assert.ok(classes.has('story-ready'));
    rootOptions.onUncaughtError();
    assert.equal(attributes.get('aria-hidden'),undefined);
    assert.equal(mount.hidden,true);
    assert.ok(!classes.has('story-ready'));
  });
}
