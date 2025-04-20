// background.js
// ESM形式で書かれていることを確認

// 拡張機能のインストール時に初期設定を行う
chrome.runtime.onInstalled.addListener(() => {
    // 初期設定
    chrome.storage.sync.get(['darkModeEnabled', 'excludedSites', 'brightness'], (result) => {
      if (result.darkModeEnabled === undefined) {
        chrome.storage.sync.set({ darkModeEnabled: true });
      }
      if (!result.excludedSites) {
        chrome.storage.sync.set({ excludedSites: [] });
      }
      if (!result.brightness) {
        chrome.storage.sync.set({ brightness: 100 });
      }
    });
  });
  
  // タブが更新されたとき、ダークモードの状態を確認して適用する
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      // タブのURLからドメインを取得
      const url = new URL(tab.url);
      const domain = url.hostname;
  
      // ストレージから設定を取得して、ダークモードを適用するか判断
      chrome.storage.sync.get(['darkModeEnabled', 'excludedSites', 'brightness'], (result) => {
        const darkModeEnabled = result.darkModeEnabled || false;
        const excludedSites = result.excludedSites || [];
        const brightness = result.brightness || 100;
  
        // 現在のサイトが除外リストに含まれているか確認
        const isExcluded = excludedSites.includes(domain);
  
        // content scriptに設定を送信
        chrome.tabs.sendMessage(tabId, {
          action: 'updateSettings',
          darkModeEnabled: darkModeEnabled && !isExcluded,
          brightness: brightness
        });
      });
    }
  });
  
  // 他のコンポーネントからのメッセージを処理
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getCurrentTabInfo') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
          const url = new URL(tabs[0].url);
          const domain = url.hostname;
          sendResponse({ domain: domain, tabId: tabs[0].id });
        } else {
          sendResponse({ domain: '', tabId: null });
        }
      });
      return true; // 非同期レスポンスのためにtrueを返す
    }
    
    if (message.action === 'applySettings') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateSettings',
            darkModeEnabled: message.darkModeEnabled,
            brightness: message.brightness
          });
        }
      });
    }
  });
  
  export {}; // ESMとして認識させるために空のエクスポート