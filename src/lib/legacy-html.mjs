// Older posts contain CSS property names from React-style authoring.
export function normalizeStyle(style) {
  return style.replace(/(^|;)(\s*)([a-z][a-zA-Z]*)(\s*:)/g, (_, separator, space, property, colon) =>
    separator + space + property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`) + colon);
}
export default function legacyHtml() {
  return function transform(node) {
    if (node.type === 'raw') {
      node.value = node.value.replace(/(\bstyle\s*=\s*)(["'])(.*?)\2/gi,
        (_, attribute, quote, style) => attribute + quote + normalizeStyle(style) + quote);
      if (/^<div\b[^>]*style=["'][^"']*\bwidth\s*:\s*\d+(?:\.\d+)?px/i.test(node.value.trim())) {
        node.value = `<div class="legacy-example-scroll">${node.value}</div>`;
      }
    }
    if (node.type === 'element' && typeof node.properties?.style === 'string') {
      node.properties.style = normalizeStyle(node.properties.style);
    }
    if (node.children) node.children = node.children.map(child => {
      transform(child);
      if (child.type === 'element' && child.tagName === 'div' && /(?:^|;)\s*width\s*:\s*\d+(?:\.\d+)?px/.test(child.properties?.style || '')) {
        return { type:'element', tagName:'div', properties:{ className:['legacy-example-scroll'] }, children:[child] };
      }
      return child;
    });
  };
}
