// content.js - ページにダークモードを適用するスクリプト

// スタイル要素を作成・更新する関数
function createOrUpdateStyle(id, css) {
    let styleEl = document.getElementById(id);
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = id;
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = css;
    return styleEl;
  }
  
  // ダークモードスタイルを生成
  function generateDarkModeStyles(settings) {
    const { 
      darkness = 75,           // 黒さの度合い (0-100%)
      brightness = 100,        // 輝度 (50-150%)
      contrast = 100,          // コントラスト (75-125%)
      preserveLayout = true,   // レイアウト保持
      smartInvert = true       // 画像・動画保護
    } = settings;
    
    // 黒さを背景色に変換（0%: #FFFFFF, 100%: #121212）
    const calculateBackgroundColor = (darknessPct) => {
      // 黒さに応じてRGB値を計算（255→18の範囲で変化）
      const colorValue = Math.floor(255 - (darknessPct / 100) * (255 - 18));
      return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    };
    
    // 文字色を計算（黒さに応じて白→灰色の範囲で変化）
    const calculateTextColor = (darknessPct) => {
      // 黒さに応じてRGB値を計算（224→255の範囲で変化）
      const colorValue = Math.floor(224 + (darknessPct / 100) * (255 - 224));
      return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    };
    
    // リンク色を計算（黒さに応じて調整）
    const calculateLinkColor = (darknessPct) => {
      return darknessPct > 50 ? '#8ab4f8' : '#0066cc';
    };
    
    const calculatedBgColor = calculateBackgroundColor(darkness);
    const calculatedTextColor = calculateTextColor(darkness);
    const calculatedLinkColor = calculateLinkColor(darkness);
    const darkerBgColor = calculateBackgroundColor(Math.min(darkness + 15, 100));
    const lighterBgColor = calculateBackgroundColor(Math.max(darkness - 15, 0));
    
    // レイアウト保持モードに応じたスタイルを生成
    let styles = '';
    
    if (preserveLayout) {
      // レイアウト保持モード - CSSカスタムプロパティと色反転フィルタを使用
      styles = `
        :root {
          --dark-bg: ${calculatedBgColor};
          --dark-text: ${calculatedTextColor};
          --dark-link: ${calculatedLinkColor};
          --dark-bg-lighter: ${lighterBgColor};
          --dark-bg-darker: ${darkerBgColor};
          --dark-border: ${darkness > 50 ? '#444' : '#ccc'};
        }
        
        html {
          background-color: var(--dark-bg) !important;
          filter: brightness(${brightness}%) contrast(${contrast}%) !important;
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
      `;
      
      // スマート反転が有効な場合、画像と動画を保護
      if (smartInvert) {
        styles += `
          img, picture, video, canvas, svg, [style*="background-image"] {
            filter: brightness(${Math.max(90, 110 - darkness/2)}%) !important;
          }
        `;
      }
    } else {
      // シンプルな反転フィルタモード - レイアウトを無視した強制的な色反転
      styles = `
        html {
          filter: invert(${darkness}%) hue-rotate(180deg) brightness(${brightness}%) contrast(${contrast}%) !important;
        }
      `;
      
      // スマート反転が有効な場合、画像と動画を再反転して元に戻す
      if (smartInvert) {
        styles += `
          img, picture, video, canvas, svg, [style*="background-image"] {
            filter: invert(${darkness}%) hue-rotate(180deg) !important;
          }
        `;
      }
    }
    
    return styles;
  }
  
  // ダークモードの適用/解除
  function applyDarkMode(settings) {
    const styleId = 'dark-mode-extended-styles';
    
    if (settings.darkModeEnabled) {
      // ダークモードを適用
      const darkModeStyles = generateDarkModeStyles(settings);
      createOrUpdateStyle(styleId, darkModeStyles);
      
      // HTML要素にクラスを追加（他のCSS用）
      document.documentElement.classList.add('dark-mode-enabled');
    } else {
      // ダークモードを解除
      const styleEl = document.getElementById(styleId);
      if (styleEl) {
        styleEl.remove();
      }
      document.documentElement.classList.remove('dark-mode-enabled');
    }
  }
  
  // MutationObserverを使って動的に追加される要素にもスタイルを適用
  function setupDynamicContentObserver(settings) {
    if (!settings.darkModeEnabled) return;
    
    // 新しく追加された要素を監視するためのオブザーバー
    const observer = new MutationObserver((mutations) => {
      // 動的に追加されたDOMを確認して必要に応じてスタイルを再適用
      let needsRefresh = false;
      
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          // iframeや重要なコンテンツが追加された場合は再適用
          for (const node of mutation.addedNodes) {
            if (node.nodeName === 'IFRAME' || 
                (node.nodeType === 1 && (
                  node.classList.contains('modal') || 
                  node.id?.includes('content') ||
                  node.tagName === 'MAIN' ||
                  node.tagName === 'ARTICLE'
                ))) {
              needsRefresh = true;
              break;
            }
          }
        }
      });
      
      if (needsRefresh) {
        // スタイルを再適用
        applyDarkMode(settings);
      }
    });
    
    // DOM変更の監視を開始
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return observer;
  }
  
  // 拡張機能からのメッセージリスナー
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'applySettings') {
      applyDarkMode(message.settings);
      // DOM変更の監視を設定
      if (window.darkModeObserver) {
        window.darkModeObserver.disconnect();
      }
      window.darkModeObserver = setupDynamicContentObserver(message.settings);
      sendResponse({ success: true });
    }
  });
  
  // ページロード時に設定を適用
  (async function() {
    try {
      // 現在のサイトのドメインを取得
      const currentDomain = window.location.hostname;
      
      // ストレージから設定を取得
      const result = await chrome.storage.sync.get([
        'darkModeEnabled', 
        'excludedSites', 
        'brightness',
        'darkness',
        'contrast',
        'preserveLayout',
        'smartInvert'
      ]);
      
      const darkModeEnabled = result.darkModeEnabled !== undefined ? result.darkModeEnabled : true;
      const brightness = result.brightness || 100;
      const darkness = result.darkness !== undefined ? result.darkness : 75;
      const contrast = result.contrast || 100;
      const preserveLayout = result.preserveLayout !== undefined ? result.preserveLayout : true;
      const smartInvert = result.smartInvert !== undefined ? result.smartInvert : true;
      const excludedSites = result.excludedSites || [];
      
      // このサイトが除外リストにあるかチェック
      const isSiteExcluded = excludedSites.includes(currentDomain);
      
      // 有効な設定オブジェクト
      const settings = {
        darkModeEnabled: darkModeEnabled && !isSiteExcluded,
        brightness,
        darkness,
        contrast,
        preserveLayout,
        smartInvert
      };
      
      // 設定を適用
      if (settings.darkModeEnabled) {
        applyDarkMode(settings);
        // DOM変更の監視を設定
        window.darkModeObserver = setupDynamicContentObserver(settings);
      }
    } catch (error) {
      console.error('ダークモード設定の適用中にエラーが発生しました:', error);
    }
  })();