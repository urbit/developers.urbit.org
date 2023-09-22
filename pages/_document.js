import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <Script strategy="beforeInteractive" dangerouslySetInnerHTML={{
          __html: `window.__MathJax_State__ = {
          isReady: false,
          promise: new Promise(resolve => {

            window.MathJax = {
              loader: {load: ['[tex]/autoload', '[tex]/ams']},
              tex: {
                packages: {'[+]': ['autoload', 'ams']},
                processEscapes: true
              },
              jax: ["input/TeX","output/CommonHTML"],
              options: {
                renderActions: {
                  addMenu: []
                }
              },
              startup: {
                typeset: false,
                ready: () => {
                  // setting data-theme so that @docsearch/react understands
                  // whether it should be in dark mode or not
                  if (window.matchMedia) {
                    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                      document.querySelector("html").setAttribute("data-theme", "dark");
                    }
                  }
                  MathJax.startup.defaultReady();
                  window.__MathJax_State__.isReady = true;
                  resolve();
                }
              }
            };
          })
        };`}}
        />
        <Script strategy="beforeInteractive" id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" />
      </body>
    </Html>
  )
}
