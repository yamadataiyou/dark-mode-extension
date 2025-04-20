<template>
    <div class="popup-container" :class="{ 'dark-theme': isDarkModePreview }">
      <header class="header">
        <h1>ダークモード切り替え</h1>
        <div class="theme-switch">
          <button 
            :class="{ active: isDarkModeEnabled }" 
            @click="toggleDarkMode(true)"
          >
            <span>ON</span>
          </button>
          <button 
            :class="{ active: !isDarkModeEnabled }" 
            @click="toggleDarkMode(false)"
          >
            <span>OFF</span>
          </button>
        </div>
      </header>
      
      <div class="current-site">
        <p>現在のサイト: <strong>{{ currentDomain || '取得中...' }}</strong></p>
      </div>
      
      <div class="site-exclusion">
        <label class="toggle">
          <input 
            type="checkbox" 
            v-model="isCurrentSiteExcluded"
            @change="toggleExcludeCurrentSite"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-label">このサイトをダークモードの対象外にする</span>
        </label>
      </div>
      
      <!-- ダークネス（黒さ）調整スライダー -->
      <div class="darkness-control">
        <h2>ダークネス調整</h2>
        <div class="slider-container">
          <span>弱</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="5"
            v-model="darkness"
            @input="updateDarkness"
          />
          <span>強</span>
        </div>
        <div class="slider-value">
          現在の黒さ: {{ darkness }}%
        </div>
      </div>
      
      <!-- 輝度調整スライダー -->
      <div class="brightness-control">
        <h2>輝度調整</h2>
        <div class="slider-container">
          <span>暗</span>
          <input 
            type="range" 
            min="50" 
            max="150" 
            step="5"
            v-model="brightness"
            @input="updateBrightness"
          />
          <span>明</span>
        </div>
        <div class="slider-value">
          現在の輝度: {{ brightness }}%
        </div>
      </div>
      
      <!-- コントラスト調整スライダー -->
      <div class="contrast-control">
        <h2>コントラスト調整</h2>
        <div class="slider-container">
          <span>弱</span>
          <input 
            type="range" 
            min="75" 
            max="125" 
            step="5"
            v-model="contrast"
            @input="updateContrast"
          />
          <span>強</span>
        </div>
        <div class="slider-value">
          現在のコントラスト: {{ contrast }}%
        </div>
      </div>
      
      <!-- 除外サイト管理 -->
      <div class="excluded-sites-manager">
        <h2>除外サイト管理</h2>
        <div v-if="excludedSites.length === 0" class="no-sites">
          除外サイトはありません
        </div>
        <ul v-else class="excluded-sites-list">
          <li v-for="(site, index) in excludedSites" :key="index" class="excluded-site">
            <span class="site-domain">{{ site }}</span>
            <button class="remove-site" @click="removeSiteFromExcluded(site)">削除</button>
          </li>
        </ul>
      </div>
      
      <!-- 詳細設定 -->
      <div class="advanced-settings">
        <h2>詳細設定</h2>
        <div class="setting-item">
          <label class="toggle">
            <input 
              type="checkbox" 
              v-model="preserveLayout"
              @change="updatePreserveLayout"
            />
            <span class="toggle-slider"></span>
            <span class="toggle-label">レイアウト保持（推奨）</span>
          </label>
        </div>
        <div class="setting-item">
          <label class="toggle">
            <input 
              type="checkbox" 
              v-model="smartInvert"
              @change="updateSmartInvert"
            />
            <span class="toggle-slider"></span>
            <span class="toggle-label">スマート反転（画像/動画を保護）</span>
          </label>
        </div>
      </div>
      
      <footer class="footer">
        <p>設定は自動的に保存されます</p>
      </footer>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { getStorageData, setStorageData, getCurrentTabInfo, applySettings, toggleExcludedSite } from '../utils/storage';
  
  // 状態管理
  const isDarkModeEnabled = ref(true);
  const isCurrentSiteExcluded = ref(false);
  const brightness = ref(100);
  const darkness = ref(75);  // ダークネス（黒さ）の初期値を75%に
  const contrast = ref(100);  // コントラスト初期値
  const currentDomain = ref('');
  const currentTabId = ref(null);
  const excludedSites = ref([]);
  const preserveLayout = ref(true);  // レイアウト保持（デフォルトでON）
  const smartInvert = ref(true);  // スマート反転（デフォルトでON）
  
  // プレビュー用のダークモード表示
  const isDarkModePreview = computed(() => {
    return isDarkModeEnabled.value;
  });
  
  // 初期設定の読み込み
  onMounted(async () => {
    try {
      // 現在のタブ情報を取得
      const tabInfo = await getCurrentTabInfo();
      currentDomain.value = tabInfo.domain;
      currentTabId.value = tabInfo.tabId;
      
      // ストレージから設定を読み込む
      const storageData = await getStorageData([
        'darkModeEnabled', 
        'excludedSites', 
        'brightness',
        'darkness',
        'contrast',
        'preserveLayout',
        'smartInvert'
      ]);
      
      isDarkModeEnabled.value = storageData.darkModeEnabled !== undefined ? storageData.darkModeEnabled : true;
      brightness.value = storageData.brightness || 100;
      darkness.value = storageData.darkness !== undefined ? storageData.darkness : 75;
      contrast.value = storageData.contrast || 100;
      preserveLayout.value = storageData.preserveLayout !== undefined ? storageData.preserveLayout : true;
      smartInvert.value = storageData.smartInvert !== undefined ? storageData.smartInvert : true;
      
      // 除外サイトリストを読み込む
      const sites = storageData.excludedSites || [];
      excludedSites.value = sites;
      
      // 現在のサイトが除外リストに含まれているか確認
      isCurrentSiteExcluded.value = sites.includes(currentDomain.value);
      
      // 現在のタブに設定を適用
      applyCurrentSettings();
    } catch (error) {
      console.error('設定の読み込み中にエラーが発生しました:', error);
    }
  });
  
  // ダークモードの切り替え
  async function toggleDarkMode(enabled) {
    isDarkModeEnabled.value = enabled;
    await setStorageData({ darkModeEnabled: enabled });
    applyCurrentSettings();
  }
  
  // 現在のサイトを除外リストに追加/削除
  async function toggleExcludeCurrentSite() {
    if (currentDomain.value) {
      const updatedSites = await toggleExcludedSite(currentDomain.value, isCurrentSiteExcluded.value);
      excludedSites.value = updatedSites;
      applyCurrentSettings();
    }
  }
  
  // 除外リストからサイトを削除
  async function removeSiteFromExcluded(site) {
    const updatedSites = excludedSites.value.filter(s => s !== site);
    excludedSites.value = updatedSites;
    
    // 現在のサイトだった場合はチェックボックスも更新
    if (site === currentDomain.value) {
      isCurrentSiteExcluded.value = false;
    }
    
    await setStorageData({ excludedSites: updatedSites });
    applyCurrentSettings();
  }
  
  // 輝度の更新
  async function updateBrightness() {
    await setStorageData({ brightness: parseInt(brightness.value) });
    applyCurrentSettings();
  }
  
  // ダークネス（黒さ）の更新
  async function updateDarkness() {
    await setStorageData({ darkness: parseInt(darkness.value) });
    applyCurrentSettings();
  }
  
  // コントラストの更新
  async function updateContrast() {
    await setStorageData({ contrast: parseInt(contrast.value) });
    applyCurrentSettings();
  }
  
  // レイアウト保持設定の更新
  async function updatePreserveLayout() {
    await setStorageData({ preserveLayout: preserveLayout.value });
    applyCurrentSettings();
  }
  
  // スマート反転設定の更新
  async function updateSmartInvert() {
    await setStorageData({ smartInvert: smartInvert.value });
    applyCurrentSettings();
  }
  
  // 現在の設定をタブに適用
  function applyCurrentSettings() {
    const effectiveDarkMode = isDarkModeEnabled.value && !isCurrentSiteExcluded.value;
    applySettings({
      darkModeEnabled: effectiveDarkMode,
      brightness: parseInt(brightness.value),
      darkness: parseInt(darkness.value),
      contrast: parseInt(contrast.value),
      preserveLayout: preserveLayout.value,
      smartInvert: smartInvert.value
    });
  }
  </script>
  
  <style scoped>
  /* 共通スタイル */
  .popup-container {
    width: 350px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  
  /* ダークテーマ時のポップアップコンテナ */
  .popup-container.dark-theme {
    background-color: #222;
    color: #e0e0e0;
  }
  
  /* ヘッダースタイル */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eaeaea;
  }
  
  .dark-theme .header {
    border-bottom-color: #444;
  }
  
  .header h1 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
  
  .theme-switch {
    display: flex;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid #ddd;
  }
  
  .dark-theme .theme-switch {
    border-color: #555;
  }
  
  .theme-switch button {
    padding: 6px 12px;
    border: none;
    background-color: #f0f0f0;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
    min-width: 50px;
  }
  
  .dark-theme .theme-switch button {
    background-color: #444;
    color: #aaa;
  }
  
  .theme-switch button.active {
    background-color: #4a6cf7;
    color: white;
  }
  
  /* 現在のサイト表示 */
  .current-site {
    margin-bottom: 16px;
    padding: 10px;
    background-color: #e9ecef;
    border-radius: 6px;
  }
  
  .dark-theme .current-site {
    background-color: #333;
  }
  
  .current-site p {
    margin: 0;
    font-size: 14px;
  }
  
  /* サイト除外設定 */
  .site-exclusion {
    margin-bottom: 20px;
  }
  
  .toggle {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    background-color: #ccc;
    border-radius: 20px;
    transition: .4s;
    margin-right: 10px;
    flex-shrink: 0;
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: .4s;
  }
  
  .toggle input:checked + .toggle-slider {
    background-color: #4a6cf7;
  }
  
  .toggle input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }
  
  .toggle-label {
    font-size: 14px;
  }
  
  /* スライダー共通のスタイル */
  .darkness-control,
  .brightness-control,
  .contrast-control {
    margin-bottom: 20px;
  }
  
  .darkness-control h2,
  .brightness-control h2,
  .contrast-control h2 {
    font-size: 16px;
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .slider-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  
  .slider-container span {
    font-size: 12px;
    color: #666;
    width: 20px;
    text-align: center;
  }
  
  .dark-theme .slider-container span {
    color: #aaa;
  }
  
  .slider-container input {
    flex-grow: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: #ddd;
    outline: none;
    border-radius: 3px;
  }
  
  .dark-theme .slider-container input {
    background: #555;
  }
  
  .slider-container input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4a6cf7;
    cursor: pointer;
  }
  
  .slider-value {
    text-align: center;
    font-size: 14px;
    color: #555;
  }
  
  .dark-theme .slider-value {
    color: #bbb;
  }
  
  /* 除外サイト管理 */
  .excluded-sites-manager {
    margin-bottom: 20px;
  }
  
  .excluded-sites-manager h2 {
    font-size: 16px;
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .no-sites {
    font-size: 14px;
    color: #777;
    text-align: center;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 6px;
  }
  
  .dark-theme .no-sites {
    background-color: #333;
    color: #999;
  }
  
  .excluded-sites-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 120px;
    overflow-y: auto;
    background-color: #f0f0f0;
    border-radius: 6px;
  }
  
  .dark-theme .excluded-sites-list {
    background-color: #333;
  }
  
  .excluded-site {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid #ddd;
  }
  
  .dark-theme .excluded-site {
    border-bottom-color: #444;
  }
  
  .excluded-site:last-child {
    border-bottom: none;
  }
  
  .site-domain {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-grow: 1;
  }
  
  .remove-site {
    background-color: #ff5252;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .remove-site:hover {
    background-color: #ff0000;
  }
  
  /* 詳細設定 */
  .advanced-settings {
    margin-bottom: 20px;
  }
  
  .advanced-settings h2 {
    font-size: 16px;
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .setting-item {
    margin-bottom: 8px;
  }
  
  /* フッター */
  .footer {
    margin-top: 20px;
    padding-top: 12px;
    border-top: 1px solid #eaeaea;
    text-align: center;
    font-size: 12px;
    color: #777;
  }
  
  .dark-theme .footer {
    border-top-color: #444;
    color: #999;
  }
  </style>