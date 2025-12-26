<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarIcon as CalendarNavIcon,
  ClockIcon,
  CogIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BoltIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const uiStore = useUIStore()

const isDarkMode = computed(() => uiStore.isDarkMode)
const isSidebarExpanded = computed(() => uiStore.isSidebarExpanded)
const showCommandPalette = computed(() => uiStore.uiState.showCommandPalette)

const currentRoute = computed(() => router.currentRoute.value.name)

const navRoutes = [
  { name: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { name: 'kanban', label: 'Board', icon: ClipboardDocumentListIcon },
  { name: 'list', label: 'List', icon: DocumentTextIcon },
  { name: 'calendar', label: 'Calendar', icon: CalendarNavIcon },
  { name: 'timeline', label: 'Timeline', icon: ClockIcon },
  { name: 'settings', label: 'Settings', icon: CogIcon }
]

// Keyboard event handler
const handleKeydown = (e: KeyboardEvent) => {
  // Cmd/Ctrl + K for command palette
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    uiStore.toggleCommandPalette()
  }
  // Escape to close modals
  if (e.key === 'Escape') {
    uiStore.setCommandPaletteVisible(false)
    uiStore.setQuickAddVisible(false)
    uiStore.setTaskDetailsVisible(false)
  }
}

onMounted(() => {
  uiStore.initTheme()
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeydown)
})

// Cleanup event listener on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

function navigateTo(route: string) {
  router.push(route)
}

function toggleSidebar() {
  uiStore.toggleSidebar()
}
</script>

<template>
  <div class="app" :class="{ 'dark-mode': isDarkMode }">
    <aside class="sidebar" :class="{ 'collapsed': !isSidebarExpanded }">
      <div class="sidebar-header">
        <div class="logo">
          <BoltIcon class="logo-icon" />
          <span v-if="isSidebarExpanded" class="logo-text">COMMAND</span>
        </div>
        <button
          class="sidebar-toggle"
          @click="toggleSidebar"
          :aria-label="isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'"
          :aria-expanded="isSidebarExpanded"
        >
          <ChevronLeftIcon v-if="isSidebarExpanded" />
          <ChevronRightIcon v-else />
        </button>
      </div>

      <nav class="sidebar-nav">
        <a
          v-for="route in navRoutes"
          :key="route.name"
          class="nav-item"
          :class="{ active: currentRoute === route.name }"
          @click="navigateTo(route.name as string)"
        >
          <component :is="route.icon" class="nav-icon" />
          <span v-if="isSidebarExpanded" class="nav-label">{{ route.label }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span v-if="isSidebarExpanded" class="status-text">ONLINE</span>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Command Palette Modal -->
    <div v-if="showCommandPalette" class="modal-overlay" @click="uiStore.setCommandPaletteVisible(false)">
      <div class="command-palette" @click.stop>
        <input
          type="text"
          placeholder="Search commands..."
          class="command-input"
          autofocus
        />
        <div class="command-list">
          <div class="command-item">
            <ChartBarIcon class="command-icon" />
            <span class="command-label">Go to Dashboard</span>
            <span class="command-shortcut">⌘K</span>
          </div>
          <div class="command-item">
            <ClipboardDocumentListIcon class="command-icon" />
            <span class="command-label">Open Kanban Board</span>
          </div>
          <div class="command-item">
            <PlusIcon class="command-icon" />
            <span class="command-label">Create New Task</span>
            <span class="command-shortcut">⌘N</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: rgba(20, 20, 20, 0.8);
  --bg-tertiary: rgba(255, 255, 255, 0.03);
  --bg-hover: rgba(255, 255, 255, 0.08);
  --border-color: rgba(255, 255, 255, 0.1);
  --border-active: #00ff88;
  --text-primary: #fff;
  --text-secondary: #888;
  --gradient-primary: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
  --gradient-critical: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
  --shadow-glow: 0 0 20px rgba(0, 255, 136, 0.2);
}

body {
  font-family: 'Courier New', monospace;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
}

.app {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
}

.sidebar {
  width: 250px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 100;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
}

.logo-icon {
  width: 24px;
  height: 24px;
  color: #00ff88;
}

.logo-text {
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.sidebar-toggle {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-toggle svg {
  width: 16px;
  height: 16px;
}

.sidebar-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-active);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-item.active {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid var(--border-active);
  color: #00ff88;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff88;
  box-shadow: 0 0 10px #00ff88;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #00ff88;
}

.main-content {
  flex: 1;
  overflow: auto;
  background: var(--bg-primary);
}

.content-wrapper {
  min-height: 100%;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Command Palette Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20vh;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.command-palette {
  width: 100%;
  max-width: 600px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.command-input {
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--bg-tertiary);
  border: none;
  border-bottom: 1px solid var(--border-color);
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: var(--text-primary);
}

.command-input:focus {
  outline: none;
  border-bottom-color: var(--border-active);
}

.command-list {
  max-height: 400px;
  overflow-y: auto;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.command-item:hover {
  background: var(--bg-hover);
}

.command-icon {
  width: 20px;
  height: 20px;
}

.command-label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.command-shortcut {
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 2px;
  color: var(--text-secondary);
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 70px;
  }

  .sidebar.collapsed {
    width: 70px;
  }

  .logo-text,
  .nav-label,
  .status-text {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -70px;
    width: 70px;
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .main-content {
    margin-left: 0;
  }

  .command-palette {
    max-width: 90%;
  }
}
</style>
