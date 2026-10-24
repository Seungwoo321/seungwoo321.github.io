import test from 'node:test';
import assert from 'node:assert/strict';
import legacyHtml, { normalizeStyle } from '../src/lib/legacy-html.mjs';
test('normalizes legacy CSS declarations while preserving values and code examples', () => {
  assert.equal(normalizeStyle('display: flex; flexWrap: wrap; marginBottom: 0.25rem; width: calc(50% - 1rem)'), 'display: flex; flex-wrap: wrap; margin-bottom: 0.25rem; width: calc(50% - 1rem)');
  const code = {type:'element',tagName:'code',children:[{type:'text',value:'<div style="flexWrap: wrap">'}]};
  const raw = {type:'raw',value:'<div style="flexWrap: wrap"><img style="marginBottom: 2px" /></div>'};
  legacyHtml()({type:'root',children:[raw,code]});
  assert.match(raw.value,/flex-wrap: wrap/);
  assert.match(raw.value,/margin-bottom: 2px/);
  assert.equal(code.children[0].value,'<div style="flexWrap: wrap">');
});
test('fixed-width teaching examples scroll without changing their authored dimensions', () => {
  const raw={type:'raw',value:'<div style="position:relative;width:400px;height:400px;"><div style="width:100%"></div></div>'};
  legacyHtml()({type:'root',children:[raw]});
  assert.ok(raw.value.startsWith('<div class="legacy-example-scroll">'));
  assert.match(raw.value,/width:400px/);
});
