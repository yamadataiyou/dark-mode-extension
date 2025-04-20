// storage.js - ストレージ関連のユーティリティ関数

/**
 * Chromeストレージから指定したキーのデータを取得
 * @param {string[]} keys - 取得するキーの配列
 * @returns {Promise<Object>} - キーと値のオブジェクト
 */
export async function getStorageData(keys) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Chromeストレージにデータを保存
   * @param {Object} data - 保存するデータのオブジェクト
   * @returns {Promise<void>}
   */
  export async function setStorageData(data) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.set(data, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * 現在開いているタブの情報を取得
   * @returns {Promise<{tabId: number, domain: string}>}
   */
  export async function getCurrentTabInfo() {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          
          if (tabs.length === 0) {
            reject(new Error('アクティブなタブが見つかりません'));
            return;
          }
          
          const currentTab = tabs[0];
          const url = new URL(currentTab.url);
          const domain = url.hostname;
          
          resolve({
            tabId: currentTab.id,
            domain
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * 現在のタブに設定を適用
   * @param {Object} settings - 適用する設定
   */
  export function applySettings(settings) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(
          tabs[0].id, 
          { 
            action: 'applySettings',
            settings
          }
        );
      }
    });
  }
  
  /**
   * サイトを除外リストに追加または削除
   * @param {string} domain - 対象ドメイン
   * @param {boolean} shouldExclude - 除外するかどうか
   * @returns {Promise<string[]>} - 更新後の除外リスト
   */
  export async function toggleExcludedSite(domain, shouldExclude) {
    const storageData = await getStorageData(['excludedSites']);
    let excludedSites = storageData.excludedSites || [];
    
    if (shouldExclude && !excludedSites.includes(domain)) {
      // 除外リストに追加
      excludedSites.push(domain);
    } else if (!shouldExclude && excludedSites.includes(domain)) {
      // 除外リストから削除
      excludedSites = excludedSites.filter(site => site !== domain);
    }
    
    await setStorageData({ excludedSites });
    return excludedSites;
  }