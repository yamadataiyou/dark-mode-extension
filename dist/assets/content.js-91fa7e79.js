function f(r,e){let t=document.getElementById(r);return t||(t=document.createElement("style"),t.id=r,document.head.appendChild(t)),t.textContent=e,t}function y(r){const{darkness:e=75,brightness:t=100,contrast:a=100,preserveLayout:s=!0,smartInvert:n=!0}=r,o=i=>{const d=Math.floor(255-i/100*237);return`rgb(${d}, ${d}, ${d})`},u=i=>{const d=Math.floor(224+i/100*31);return`rgb(${d}, ${d}, ${d})`},m=i=>i>50?"#8ab4f8":"#0066cc",b=o(e),c=u(e),h=m(e),v=o(Math.min(e+15,100)),p=o(Math.max(e-15,0));let l="";return s?(l=`
        :root {
          --dark-bg: ${b};
          --dark-text: ${c};
          --dark-link: ${h};
          --dark-bg-lighter: ${p};
          --dark-bg-darker: ${v};
          --dark-border: ${e>50?"#444":"#ccc"};
        }
        
        html {
          background-color: var(--dark-bg) !important;
          filter: brightness(${t}%) contrast(${a}%) !important;
          color-scheme: dark !important;
        }
        
        body {
          background-color: var(--dark-bg) !important;
          color: var(--dark-text) !important;
        }
        
        /* テキスト要素の色を設定 */
        h1, h2, h3, h4, h5, h6, p, span, div, li, dt, dd, td, th, label, strong, em, small {
          color: var(--dark-text) !important;
        }
        
        /* リンク色の設定 */
        a:not(:hover) {
          color: var(--dark-link) !important;
        }
        
        /* フォーム要素のスタイル */
        input, textarea, select, button {
          background-color: var(--dark-bg-lighter) !important;
          color: var(--dark-text) !important;
          border-color: var(--dark-border) !important;
        }
        
        /* ボタンと同様の要素 */
        button, .button, [role="button"], [type="button"], [type="submit"], [type="reset"] {
          background-color: var(--dark-bg-lighter) !important;
          color: var(--dark-text) !important;
        }
        
        /* ボックス系要素の背景色 */
        div, section, article, nav, aside, header, footer, main {
          background-color: transparent !important;
        }
        
        /* テーブル要素 */
        table, tr, td, th {
          border-color: var(--dark-border) !important;
        }
        
        /* スクロールバーのカスタマイズ */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: var(--dark-bg) !important;
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--dark-bg-lighter) !important;
          border-radius: 6px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--dark-bg-darker) !important;
        }
      `,n&&(l+=`
          img, picture, video, canvas, svg, [style*="background-image"] {
            filter: brightness(${Math.max(90,110-e/2)}%) !important;
          }
        `)):(l=`
        html {
          filter: invert(${e}%) hue-rotate(180deg) brightness(${t}%) contrast(${a}%) !important;
        }
      `,n&&(l+=`
          img, picture, video, canvas, svg, [style*="background-image"] {
            filter: invert(${e}%) hue-rotate(180deg) !important;
          }
        `)),l}function k(r){const e="dark-mode-extended-styles";if(r.darkModeEnabled){const t=y(r);f(e,t),document.documentElement.classList.add("dark-mode-enabled")}else{const t=document.getElementById(e);t&&t.remove(),document.documentElement.classList.remove("dark-mode-enabled")}}function g(r){if(!r.darkModeEnabled)return;const e=new MutationObserver(t=>{let a=!1;t.forEach(s=>{var n;if(s.addedNodes.length>0){for(const o of s.addedNodes)if(o.nodeName==="IFRAME"||o.nodeType===1&&(o.classList.contains("modal")||(n=o.id)!=null&&n.includes("content")||o.tagName==="MAIN"||o.tagName==="ARTICLE")){a=!0;break}}}),a&&k(r)});return e.observe(document.body,{childList:!0,subtree:!0}),e}chrome.runtime.onMessage.addListener((r,e,t)=>{r.action==="applySettings"&&(k(r.settings),window.darkModeObserver&&window.darkModeObserver.disconnect(),window.darkModeObserver=g(r.settings),t({success:!0}))});(async function(){try{const r=window.location.hostname,e=await chrome.storage.sync.get(["darkModeEnabled","excludedSites","brightness","darkness","contrast","preserveLayout","smartInvert"]),t=e.darkModeEnabled!==void 0?e.darkModeEnabled:!0,a=e.brightness||100,s=e.darkness!==void 0?e.darkness:75,n=e.contrast||100,o=e.preserveLayout!==void 0?e.preserveLayout:!0,u=e.smartInvert!==void 0?e.smartInvert:!0,b=(e.excludedSites||[]).includes(r),c={darkModeEnabled:t&&!b,brightness:a,darkness:s,contrast:n,preserveLayout:o,smartInvert:u};c.darkModeEnabled&&(k(c),window.darkModeObserver=g(c))}catch(r){console.error("ダークモード設定の適用中にエラーが発生しました:",r)}})();
