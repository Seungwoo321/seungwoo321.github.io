/**
 * Wireweave Client-side Renderer for Jekyll Blog
 * Finds code blocks with language-wireframe class and renders them as wireframes
 * Uses Shadow DOM for CSS isolation
 */
async function initWireweaveRenderer() {
  'use strict';

  // Find all wireframe code blocks first
  const codeBlocks = document.querySelectorAll('code.language-wireframe');

  // Only load wireweave if there are wireframe blocks
  if (codeBlocks.length === 0) {
    return;
  }

  let WireweaveCore;

  try {
    // Dynamic import from esm.sh CDN
    WireweaveCore = await import('https://esm.sh/@wireweave/core@2.0.2');
  } catch (error) {
    console.error('Failed to load WireweaveCore:', error);
    return;
  }

  codeBlocks.forEach(function(codeBlock) {
    const source = codeBlock.textContent;
    const preElement = codeBlock.parentElement;

    if (!preElement || preElement.tagName !== 'PRE') {
      return;
    }

    try {
      // Parse the wireframe DSL
      let ast;
      if (typeof WireweaveCore.parse === 'function') {
        ast = WireweaveCore.parse(source);
      } else if (typeof WireweaveCore.default?.parse === 'function') {
        ast = WireweaveCore.default.parse(source);
      } else {
        throw new Error('parse function not found');
      }

      // Use render() to get separate html and css
      let html, css;
      if (typeof WireweaveCore.render === 'function') {
        const result = WireweaveCore.render(ast);
        html = result.html;
        css = result.css;
      } else if (typeof WireweaveCore.default?.render === 'function') {
        const result = WireweaveCore.default.render(ast);
        html = result.html;
        css = result.css;
      } else {
        throw new Error('render function not found');
      }

      // Create wrapper with both code and preview
      const wrapper = document.createElement('div');
      wrapper.className = 'wireframe-wrapper';

      // Create tabs
      const tabs = document.createElement('div');
      tabs.className = 'wireframe-tabs';
      tabs.innerHTML = `
        <button class="wireframe-tab active" data-target="preview">Preview</button>
        <button class="wireframe-tab" data-target="code">Code</button>
      `;

      // Create preview panel with Shadow DOM for isolation
      const previewPanel = document.createElement('div');
      previewPanel.className = 'wireframe-panel wireframe-panel-preview active';

      const shadowHost = document.createElement('div');
      shadowHost.className = 'wireframe-shadow-host';
      const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

      // Fix CSS for Shadow DOM: replace :root with :host
      const fixedCss = css.replace(/:root\s*\{/g, ':host {');

      // Inject both CSS and HTML into Shadow DOM
      shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            overflow: auto;
            background: #f4f4f5;
            max-height: 500px;
          }
          .wireframe-outer {
            overflow: hidden;
            width: 100%;
          }
          .wireframe-scaler {
            transform-origin: top left;
            width: fit-content;
          }
          .wireframe-container {
            padding: 16px;
            width: fit-content;
          }
          ${fixedCss}
        </style>
        <div class="wireframe-outer"><div class="wireframe-scaler"><div class="wireframe-container">${html}</div></div></div>
      `;

      previewPanel.appendChild(shadowHost);

      // Dynamically scale content to fit container width
      function adjustScale() {
        const scaler = shadowRoot.querySelector('.wireframe-scaler');
        const outer = shadowRoot.querySelector('.wireframe-outer');
        if (!scaler || !outer) return;

        // Reset scale to measure natural size
        scaler.style.transform = 'scale(1)';
        const contentWidth = scaler.scrollWidth;
        const contentHeight = scaler.scrollHeight;
        const containerWidth = outer.clientWidth || shadowHost.clientWidth;

        // Calculate scale to fit width (with some padding)
        const scaleFactor = Math.min(1, (containerWidth - 16) / contentWidth);

        // Apply scale and adjust container height
        scaler.style.transform = 'scale(' + scaleFactor + ')';
        outer.style.height = (contentHeight * scaleFactor) + 'px';
      }

      // Initial adjustment after render
      requestAnimationFrame(adjustScale);

      // Re-adjust on window resize
      window.addEventListener('resize', adjustScale);

      // Create code panel with syntax highlighting
      const codePanel = document.createElement('div');
      codePanel.className = 'wireframe-panel wireframe-panel-code';
      const newPre = document.createElement('pre');
      const newCode = document.createElement('code');
      newCode.className = 'language-wireframe';
      newCode.textContent = source;
      newPre.appendChild(newCode);
      codePanel.appendChild(newPre);

      // Apply Prism highlighting if available
      if (typeof Prism !== 'undefined') {
        Prism.highlightElement(newCode);
      }

      wrapper.appendChild(tabs);
      wrapper.appendChild(previewPanel);
      wrapper.appendChild(codePanel);

      // Replace original pre element with wrapper
      preElement.parentNode.replaceChild(wrapper, preElement);

      // Add tab click handlers
      tabs.querySelectorAll('.wireframe-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          const target = this.getAttribute('data-target');

          // Update active tab
          tabs.querySelectorAll('.wireframe-tab').forEach(function(t) {
            t.classList.remove('active');
          });
          this.classList.add('active');

          // Update active panel
          wrapper.querySelectorAll('.wireframe-panel').forEach(function(panel) {
            panel.classList.remove('active');
          });
          wrapper.querySelector('.wireframe-panel-' + target).classList.add('active');
        });
      });

    } catch (error) {
      console.error('Wireweave render error:', error);
      // Keep original code block on error
    }
  });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWireweaveRenderer);
} else {
  initWireweaveRenderer();
}
