<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import { clearLocalStoragePattern } from '@/composables/useLocalStorage'

const uiStore = useUIStore()

const uiState = computed(() => uiStore.uiState)
const localStorageSize = computed(() => {
  let total = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage[key].length + key.length) * 2
    }
  }
  return (total / 1024).toFixed(2)
})

function setTheme(theme: 'dark' | 'light' | 'auto') {
  uiStore.setTheme(theme)
}

function setDensity(density: 'compact' | 'comfortable' | 'spacious') {
  uiStore.setDensity(density)
}

function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    clearLocalStoragePattern(/^(tasks|ui-state|task-filters)$/)
    location.reload()
  }
}

function exportData() {
  const data = {
    tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
    uiState: JSON.parse(localStorage.getItem('ui-state') || '{}'),
    filters: JSON.parse(localStorage.getItem('task-filters') || '{}')
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-command-center-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="settings-view">
    <header class="settings-header">
      <h1 class="settings-title">System Configuration</h1>
    </header>

    <section class="settings-section">
      <h2 class="section-title">Appearance</h2>
      
      <div class="setting-group">
        <label class="setting-label">
          <span class="label-text">Theme</span>
          <div class="theme-selector">
            <button
              v-for="theme in ['dark', 'light', 'auto'] as const"
              :key="theme"
              class="theme-btn"
              :class="{ active: uiState.theme === theme }"
              @click="setTheme(theme)"
            >
              {{ theme }}
            </button>
          </div>
        </label>
      </div>

      <div class="setting-group">
        <label class="setting-label">
          <span class="label-text">Density</span>
          <div class="density-selector">
            <button
              v-for="density in ['compact', 'comfortable', 'spacious'] as const"
              :key="density"
              class="density-btn"
              :class="{ active: uiState.density === density }"
              @click="setDensity(density)"
            >
              {{ density }}
            </button>
          </div>
        </label>
      </div>
    </section>

    <section class="settings-section">
      <h2 class="section-title">Data Management</h2>
      
      <div class="setting-group">
        <div class="info-card">
          <div class="info-label">Storage Used</div>
          <div class="info-value">{{ localStorageSize }} KB</div>
        </div>
      </div>

      <div class="setting-group">
        <label class="setting-label">
          <span class="label-text">Export Data</span>
          <button class="action-btn export" @click="exportData">
            Download Backup
          </button>
        </label>
      </div>

      <div class="setting-group danger">
        <label class="setting-label">
          <span class="label-text">Danger Zone</span>
          <button class="action-btn danger" @click="clearAllData">
            Clear All Data
          </button>
        </label>
      </div>
    </section>

    <section class="settings-section">
      <h2 class="section-title">About</h2>
      
      <div class="about-info">
        <div class="info-row">
          <span class="info-key">Version</span>
          <span class="info-value">1.0.0</span>
        </div>
        <div class="info-row">
          <span class="info-key">Framework</span>
          <span class="info-value">Vue 3 + Vite</span>
        </div>
        <div class="info-row">
          <span class="info-key">State Management</span>
          <span class="info-value">Pinia</span>
        </div>
        <div class="info-row">
          <span class="info-key">Storage</span>
          <span class="info-value">localStorage</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings-view {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-title {
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
  background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-section {
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.section-title {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin: 0 0 1.5rem 0;
  color: #888;
  border-bottom: 2px solid #00ff88;
  padding-bottom: 0.5rem;
  display: inline-block;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group.danger {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 71, 87, 0.2);
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.label-text {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.theme-selector,
.density-selector {
  display: flex;
  gap: 0.5rem;
}

.theme-btn,
.density-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-btn:hover,
.density-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.theme-btn.active,
.density-btn.active {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
  color: #00ff88;
}

.info-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.info-label {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
}

.info-value {
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #00ff88;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.action-btn.export {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
  color: #00ff88;
}

.action-btn.export:hover {
  background: rgba(0, 255, 136, 0.2);
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
}

.action-btn.danger {
  background: rgba(255, 71, 87, 0.1);
  border-color: #ff4757;
  color: #ff4757;
}

.action-btn.danger:hover {
  background: rgba(255, 71, 87, 0.2);
  box-shadow: 0 4px 20px rgba(255, 71, 87, 0.3);
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.info-key {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
}

.info-row .info-value {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
}

@media (max-width: 768px) {
  .settings-view {
    padding: 1rem;
  }

  .theme-selector,
  .density-selector {
    flex-direction: column;
  }
}
</style>
