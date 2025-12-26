<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import { clearLocalStoragePattern } from '@/composables/useLocalStorage'
import { ArrowDownTrayIcon, TrashIcon } from '@heroicons/vue/24/outline'

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
    <!-- Editorial Header -->
    <header class="settings-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="header-title">System Configuration</h1>
          <p class="header-subtitle">Customize your experience</p>
        </div>
      </div>
      <div class="header-divider"></div>
    </header>

    <!-- Settings Sections -->
    <div class="settings-content">
      <!-- Appearance Section -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Appearance</h2>
          <div class="section-underline"></div>
        </div>
        
        <div class="settings-grid">
          <!-- Theme Setting -->
          <div class="setting-card">
            <div class="setting-label">
              <span class="label-text">Theme</span>
              <p class="label-description">Choose your preferred color scheme</p>
            </div>
            <div class="setting-control">
              <div class="theme-selector">
                <button
                  v-for="theme in ['dark', 'light', 'auto'] as const"
                  :key="theme"
                  class="theme-btn"
                  :class="{ active: uiState.theme === theme }"
                  @click="setTheme(theme)"
                >
                  <span class="theme-icon">{{ theme === 'dark' ? '◐' : theme === 'light' ? '☀' : '◐' }}</span>
                  <span class="theme-name">{{ theme }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Density Setting -->
          <div class="setting-card">
            <div class="setting-label">
              <span class="label-text">Density</span>
              <p class="label-description">Adjust spacing and layout density</p>
            </div>
            <div class="setting-control">
              <div class="density-selector">
                <button
                  v-for="density in ['compact', 'comfortable', 'spacious'] as const"
                  :key="density"
                  class="density-btn"
                  :class="{ active: uiState.density === density }"
                  @click="setDensity(density)"
                >
                  <span class="density-name">{{ density }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Data Management Section -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Data Management</h2>
          <div class="section-underline"></div>
        </div>
        
        <div class="settings-grid">
          <!-- Storage Info -->
          <div class="setting-card">
            <div class="setting-label">
              <span class="label-text">Storage Used</span>
              <p class="label-description">Local browser storage usage</p>
            </div>
            <div class="setting-control">
              <div class="storage-info">
                <span class="storage-value">{{ localStorageSize }}</span>
                <span class="storage-unit">KB</span>
              </div>
            </div>
          </div>

          <!-- Export Data -->
          <div class="setting-card">
            <div class="setting-label">
              <span class="label-text">Export Data</span>
              <p class="label-description">Download all your data as JSON</p>
            </div>
            <div class="setting-control">
              <button class="action-btn export" @click="exportData">
                <ArrowDownTrayIcon class="btn-icon" />
                <span>Download Backup</span>
              </button>
            </div>
          </div>

          <!-- Clear Data -->
          <div class="setting-card danger">
            <div class="setting-label">
              <span class="label-text">Danger Zone</span>
              <p class="label-description">Permanently delete all data</p>
            </div>
            <div class="setting-control">
              <button class="action-btn danger" @click="clearAllData">
                <TrashIcon class="btn-icon" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">About</h2>
          <div class="section-underline"></div>
        </div>
        
        <div class="about-grid">
          <div class="about-item">
            <span class="about-label">Version</span>
            <span class="about-value">1.0.0</span>
          </div>
          <div class="about-item">
            <span class="about-label">Framework</span>
            <span class="about-value">Vue 3 + Vite</span>
          </div>
          <div class="about-item">
            <span class="about-label">State Management</span>
            <span class="about-value">Pinia</span>
          </div>
          <div class="about-item">
            <span class="about-label">Storage</span>
            <span class="about-value">localStorage</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   EDITORIAL SETTINGS VIEW
   ======================================== */

.settings-view {
  padding: var(--space-8) var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: calc(var(--space-8) + max(0px, var(--safe-area-inset-bottom)));
}

/* ========================================
   EDITORIAL HEADER
   ======================================== */

.settings-header {
  margin-bottom: var(--space-10);
}

.header-content {
  max-width: 600px;
}

.header-main {
  margin-bottom: var(--space-4);
}

.header-title {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tighter);
  color: var(--text-primary);
  margin: 0;
  text-transform: uppercase;
}

.header-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
  margin: 0;
  font-style: italic;
}

.header-divider {
  width: 100px;
  height: 3px;
  background: var(--accent-primary);
  margin-top: var(--space-6);
}

/* ========================================
   SETTINGS CONTENT
   ======================================== */

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

/* ========================================
   SETTINGS SECTION
   ======================================== */

.settings-section {
  background: var(--bg-elevated);
  border: var(--border-thin);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.section-header {
  padding: var(--space-6) var(--space-8);
  background: var(--bg-tertiary);
  border-bottom: var(--border-thin);
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
  text-transform: uppercase;
}

.section-underline {
  width: 40px;
  height: 2px;
  background: var(--accent-primary);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--border-thin);
  background: var(--border-primary);
}

/* ========================================
   SETTING CARD
   ======================================== */

.setting-card {
  background: var(--bg-elevated);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.setting-card.danger {
  background: rgba(196, 30, 58, 0.03);
  border-left: 3px solid var(--status-critical);
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.label-text {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.label-description {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  color: var(--text-tertiary);
  margin: 0;
  font-style: italic;
}

.setting-control {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 48px;
}

/* ========================================
   THEME SELECTOR
   ======================================== */

.theme-selector {
  display: flex;
  gap: var(--space-2);
}

.theme-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  background: var(--bg-tertiary);
  border: var(--border-thin);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 80px;
  min-height: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.theme-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
  transform: translateY(-2px);
}

.theme-btn.active {
  background: var(--bg-primary);
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-sm);
}

.theme-icon {
  font-size: var(--text-2xl);
  line-height: 1;
}

.theme-name {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.theme-btn.active .theme-name {
  color: var(--accent-primary);
}

/* ========================================
   DENSITY SELECTOR
   ======================================== */

.density-selector {
  display: flex;
  gap: var(--space-2);
}

.density-btn {
  padding: var(--space-3) var(--space-5);
  background: var(--bg-tertiary);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.density-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-secondary);
  color: var(--text-secondary);
}

.density-btn.active {
  background: var(--bg-primary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  font-weight: var(--font-bold);
}

/* ========================================
   STORAGE INFO
   ======================================== */

.storage-info {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.storage-value {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--accent-primary);
  line-height: 1;
}

.storage-unit {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

/* ========================================
   ACTION BUTTONS
   ======================================== */

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  background: var(--bg-tertiary);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.action-btn:hover {
  background: var(--bg-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn.export {
  background: var(--bg-primary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.action-btn.export:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.action-btn.danger {
  background: rgba(196, 30, 58, 0.08);
  border-color: var(--status-critical);
  color: var(--status-critical);
}

.action-btn.danger:hover {
  background: var(--status-critical);
  color: var(--bg-primary);
  box-shadow: 0 4px 20px rgba(196, 30, 58, 0.3);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

/* ========================================
   ABOUT GRID
   ======================================== */

.about-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--border-thin);
  background: var(--border-primary);
}

.about-item {
  background: var(--bg-elevated);
  padding: var(--space-5);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.about-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.about-value {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 900px) {
  .settings-view {
    padding: var(--space-6) var(--space-4);
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .header-title {
    font-size: var(--text-4xl);
  }
}

@media (max-width: 640px) {
  .settings-view {
    padding: var(--space-6) var(--space-4);
    padding-bottom: calc(var(--space-6) + max(0px, var(--safe-area-inset-bottom)));
  }

  .header-title {
    font-size: var(--text-3xl);
  }

  .header-subtitle {
    font-size: var(--text-base);
  }

  .theme-selector {
    flex-direction: column;
  }

  .density-selector {
    flex-direction: column;
  }

  .theme-btn {
    flex-direction: row;
    width: 100%;
  }

  .density-btn {
    width: 100%;
  }

  .about-grid {
    grid-template-columns: 1fr;
  }
}

/* Touch-specific optimizations */
@media (hover: none) and (pointer: coarse) {
  .theme-btn:active,
  .density-btn:active,
  .action-btn:active {
    transform: scale(0.96);
  }

  .theme-btn:active {
    background: var(--bg-secondary);
  }

  .density-btn:active {
    background: var(--bg-secondary);
  }

  .action-btn:active {
    background: var(--bg-secondary);
  }

  .action-btn.danger:active {
    background: var(--status-critical);
    color: var(--bg-primary);
  }
}
</style>
