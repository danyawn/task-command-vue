<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  NewspaperIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const uiStore = useUIStore()

const isDarkMode = computed(() => uiStore.isDarkMode)
const isSidebarExpanded = computed(() => uiStore.isSidebarExpanded)
const isMobileMenuOpen = ref(false)
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

function navigateTo(routeName: string) {
  router.push({ name: routeName })
  isMobileMenuOpen.value = false
}

function toggleSidebar() {
  uiStore.toggleSidebar()
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <div class="app" :class="{ 'theme-dark': isDarkMode }">
    <!-- Editorial Masthead -->
    <header class="masthead">
      <div class="masthead-content">
        <div class="masthead-brand">
          <button class="mobile-menu-toggle" @click="toggleMobileMenu" :aria-label="isMobileMenuOpen ? 'Close Menu' : 'Open Menu'" :aria-expanded="isMobileMenuOpen ? 'true' : 'false'">
            <Bars3Icon v-if="!isMobileMenuOpen" />
            <XMarkIcon v-else />
          </button>
          <NewspaperIcon class="masthead-icon" />
          <div class="masthead-text">
            <h1 class="masthead-title">Task Command</h1>
            <p class="masthead-subtitle">Productivity Journal</p>
          </div>
        </div>
        <div class="masthead-meta">
          <span class="masthead-date">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
          <span class="masthead-divider">|</span>
          <span class="masthead-edition">Vol. 1, Issue 1</span>
        </div>
      </div>
    </header>

    <div class="app-layout">
      <!-- Magazine-style Sidebar -->
      <aside class="sidebar" :class="{ 'collapsed': !isSidebarExpanded, 'mobile-open': isMobileMenuOpen }">
        <div class="sidebar-header">
          <button
            class="sidebar-toggle"
            @click="toggleSidebar"
            :aria-label="isSidebarExpanded ? 'Collapse navigation' : 'Expand navigation'"
            :aria-expanded="isSidebarExpanded"
          >
            <ChevronLeftIcon v-if="isSidebarExpanded" />
            <ChevronRightIcon v-else />
          </button>
          <span v-if="isSidebarExpanded" class="sidebar-heading">Sections</span>
        </div>

        <nav class="sidebar-nav">
          <div class="section-marker">
            <span>Navigation</span>
          </div>
          <a
            v-for="route in navRoutes"
            :key="route.name"
            class="nav-item"
            :class="{ active: currentRoute === route.name }"
            @click="navigateTo(route.name as string)"
          >
            <component :is="route.icon" class="nav-icon" />
            <div v-if="isSidebarExpanded" class="nav-content">
              <span class="nav-label">{{ route.label }}</span>
              <span class="nav-decoration"></span>
            </div>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="editorial-note">
            <p v-if="isSidebarExpanded" class="note-text">Stay focused. Stay productive.</p>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav class="mobile-nav">
      <a
        v-for="route in navRoutes.slice(0, 4)"
        :key="route.name"
        class="mobile-nav-item"
        :class="{ active: currentRoute === route.name }"
        @click="navigateTo(route.name as string)"
        :aria-current="currentRoute === route.name ? 'page' : undefined"
      >
        <component :is="route.icon" class="mobile-nav-icon" />
        <span class="mobile-nav-label">{{ route.label }}</span>
      </a>
      <button class="mobile-nav-item action" @click="uiStore.setQuickAddVisible(true)" aria-label="Add new task">
        <PlusIcon class="mobile-nav-icon" />
        <span class="mobile-nav-label">Add</span>
      </button>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="isMobileMenuOpen = false"></div>

    <!-- Command Palette Modal - Magazine Style -->
    <div v-if="showCommandPalette" class="modal-overlay" @click="uiStore.setCommandPaletteVisible(false)">
      <div class="command-palette" @click.stop>
        <div class="command-header">
          <h2 class="command-title">Quick Actions</h2>
          <span class="command-hint">Press ⌘K to open</span>
        </div>
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
            <span class="command-shortcut">⌘D</span>
          </div>
          <div class="command-item">
            <ClipboardDocumentListIcon class="command-icon" />
            <span class="command-label">Open Board View</span>
            <span class="command-shortcut">⌘B</span>
          </div>
          <div class="command-item">
            <PlusIcon class="command-icon" />
            <span class="command-label">Create New Task</span>
            <span class="command-shortcut">⌘N</span>
          </div>
          <div class="command-item">
            <DocumentTextIcon class="command-icon" />
            <span class="command-label">View All Tasks</span>
            <span class="command-shortcut">⌘L</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   EDITORIAL MAGAZINE LAYOUT
   ======================================== */

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  transition: background var(--transition-base);
}

/* ========================================
   MASTHEAD - Magazine Cover Style
   ======================================== */

.masthead {
  background: var(--bg-elevated);
  border-bottom: 3px solid var(--text-primary);
  padding: var(--space-4) var(--space-8);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: var(--shadow-sm);
}

.masthead-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.masthead-brand {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.mobile-menu-toggle {
  display: none;
  width: var(--touch-target-min);
  height: var(--touch-target-min);
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.mobile-menu-toggle:hover,
.mobile-menu-toggle:active {
  background: var(--bg-tertiary);
}

.mobile-menu-toggle svg {
  width: 24px;
  height: 24px;
}

.masthead-icon {
  width: 40px;
  height: 40px;
  color: var(--accent-primary);
}

.masthead-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.masthead-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  margin: 0;
  text-transform: uppercase;
}

.masthead-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  color: var(--text-tertiary);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  margin: 0;
}

.masthead-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.masthead-divider {
  color: var(--border-tertiary);
}

.masthead-edition {
  font-weight: var(--font-medium);
  color: var(--accent-secondary);
}

/* ========================================
   APP LAYOUT
   ======================================== */

.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ========================================
   SIDEBAR - Magazine Navigation
   ======================================== */

.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: var(--border-thin);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  position: relative;
  z-index: 40;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar.collapsed .sidebar-heading,
.sidebar.collapsed .section-marker span,
.sidebar.collapsed .nav-label,
.sidebar.collapsed .nav-decoration,
.sidebar.collapsed .note-text {
  display: none;
}

.sidebar.collapsed .section-marker {
  justify-content: center;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding-left: var(--space-5);
}

.sidebar.collapsed .nav-item:hover {
  padding-left: var(--space-5);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-5);
  border-bottom: var(--border-thin);
  background: var(--bg-tertiary);
}

.sidebar-toggle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-color: var(--accent-primary);
}

.sidebar-toggle svg {
  width: 18px;
  height: 18px;
}

.sidebar-heading {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

.section-marker {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin: var(--space-4) 0 var(--space-6) 0;
  padding-bottom: var(--space-2);
  border-bottom: var(--border-thin);
}

.section-marker::before {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-primary);
}

.section-marker span {
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.section-marker::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-primary);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  cursor: pointer;
  margin-bottom: var(--space-1);
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-left-color: var(--accent-secondary);
  padding-left: var(--space-6);
}

.nav-item.active {
  background: var(--bg-tertiary);
  color: var(--accent-primary);
  border-left-color: var(--accent-primary);
  font-weight: var(--font-medium);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.nav-label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  white-space: nowrap;
}

.nav-decoration {
  flex: 1;
  height: 1px;
  background: var(--border-secondary);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.nav-item:hover .nav-decoration,
.nav-item.active .nav-decoration {
  opacity: 1;
}

.sidebar-footer {
  padding: var(--space-6) var(--space-5);
  border-top: var(--border-thin);
  background: var(--bg-tertiary);
}

.editorial-note {
  text-align: center;
}

.note-text {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* ========================================
   MAIN CONTENT
   ======================================== */

.main-content {
  flex: 1;
  overflow: auto;
  background: var(--bg-primary);
}

.content-wrapper {
  min-height: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* ========================================
   PAGE TRANSITIONS
   ======================================== */

.page-enter-active,
.page-leave-active {
  transition: all var(--transition-base);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ========================================
   COMMAND PALETTE - Magazine Style
   ======================================== */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 100;
  animation: fadeIn var(--transition-base);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.command-palette {
  width: 100%;
  max-width: 600px;
  background: var(--bg-elevated);
  border: var(--border-medium);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: slideDown var(--transition-base);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  background: var(--bg-tertiary);
  border-bottom: var(--border-thin);
}

.command-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: var(--tracking-tight);
}

.command-hint {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  padding: var(--space-1) var(--space-3);
  background: var(--bg-primary);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
}

.command-input {
  width: 100%;
  padding: var(--space-5) var(--space-6);
  background: var(--bg-primary);
  border: none;
  border-bottom: var(--border-thin);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--text-primary);
  outline: none;
}

.command-input::placeholder {
  color: var(--text-tertiary);
}

.command-list {
  max-height: 400px;
  overflow-y: auto;
}

.command-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: var(--border-thin);
}

.command-item:last-child {
  border-bottom: none;
}

.command-item:hover {
  background: var(--bg-tertiary);
}

.command-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.command-label {
  flex: 1;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.command-shortcut {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  background: var(--bg-tertiary);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
}

/* ========================================
   SCROLLBAR - Editorial Style
   ======================================== */

.sidebar-nav::-webkit-scrollbar,
.command-list::-webkit-scrollbar,
.main-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track,
.command-list::-webkit-scrollbar-track,
.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb,
.command-list::-webkit-scrollbar-thumb,
.main-content::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: var(--radius-full);
}

.sidebar-nav::-webkit-scrollbar-thumb:hover,
.command-list::-webkit-scrollbar-thumb:hover,
.main-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-tertiary);
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 1024px) {
  .masthead-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .masthead-meta {
    width: 100%;
    justify-content: flex-start;
  }

  .sidebar {
    width: 80px;
  }

  .sidebar.collapsed {
    width: 80px;
  }

  .sidebar-heading,
  .nav-label,
  .nav-decoration,
  .note-text {
    display: none;
  }

  .section-marker {
    justify-content: center;
  }

  .section-marker::before,
  .section-marker::after {
    display: none;
  }

  .section-marker span {
    display: none;
  }
}

@media (max-width: 768px) {
  .masthead {
    padding: var(--space-3) var(--space-4);
  }

  .masthead-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .masthead-title {
    font-size: var(--text-xl);
  }

  .masthead-subtitle {
    font-size: var(--text-xs);
  }

  .masthead-icon {
    width: 28px;
    height: 28px;
  }

  .masthead-meta {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .masthead {
    padding: var(--space-3) var(--space-4);
    padding-top: max(var(--space-3), var(--safe-area-inset-top));
  }

  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    left: -280px;
    width: 280px;
    height: 100vh;
    top: 0;
    z-index: 100;
    transition: left var(--transition-base);
    box-shadow: var(--shadow-xl);
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .sidebar-header {
    padding: var(--space-4);
  }

  .sidebar-toggle {
    display: none;
  }

  .sidebar-heading {
    display: block !important;
  }

  .nav-label {
    display: block !important;
  }

  .main-content {
    padding-bottom: 70px; /* Space for bottom nav */
  }

  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(64px + max(0px, var(--safe-area-inset-bottom)));
    background: var(--bg-elevated);
    border-top: 2px solid var(--text-primary);
    z-index: 50;
    padding: 0 var(--space-2);
    padding-bottom: max(var(--space-2), var(--safe-area-inset-bottom));
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .mobile-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    color: var(--text-tertiary);
    text-decoration: none;
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: var(--touch-target-min);
    position: relative;
  }

  .mobile-nav-item::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 40%;
    height: 3px;
    background: var(--accent-primary);
    transition: transform var(--transition-fast);
  }

  .mobile-nav-item.active {
    color: var(--accent-primary);
  }

  .mobile-nav-item.active::after {
    transform: translateX(-50%) scaleX(1);
  }

  .mobile-nav-item.action {
    background: var(--text-primary);
    color: var(--bg-primary);
    margin: var(--space-2);
    border-radius: var(--radius-md);
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .mobile-nav-item.action:active {
    transform: scale(0.95);
  }

  .mobile-nav-icon {
    width: 24px;
    height: 24px;
    transition: transform var(--transition-fast);
  }

  .mobile-nav-item:active .mobile-nav-icon {
    transform: scale(0.9);
  }

  .mobile-nav-label {
    font-family: var(--font-mono);
    font-size: 11px;
    text-transform: uppercase;
    font-weight: var(--font-semibold);
    letter-spacing: 0.5px;
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 90;
    animation: fadeIn var(--transition-base);
  }

  /* Improved sidebar animation on mobile */
  .sidebar {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .command-palette {
    max-width: 95%;
    margin: 0 var(--space-2);
  }
}

.mobile-nav {
  display: none;
}

/* Touch-specific optimizations */
@media (hover: none) and (pointer: coarse) {
  .mobile-nav-item {
    -webkit-tap-highlight-color: transparent;
  }

  .mobile-nav-item:active {
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
  }

  .mobile-nav-item.action:active {
    background: var(--text-primary);
  }
}
</style>
