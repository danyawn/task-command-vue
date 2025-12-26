import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'

export type ViewMode = 'kanban' | 'list' | 'calendar' | 'timeline'
export type Theme = 'dark' | 'light' | 'auto'
export type Density = 'compact' | 'comfortable' | 'spacious'
export type SidebarState = 'expanded' | 'collapsed' | 'hidden'

export interface UIState {
  viewMode: ViewMode
  theme: Theme
  density: Density
  sidebar: SidebarState
  showTaskDetails: boolean
  showFilters: boolean
  showQuickAdd: boolean
  showCommandPalette: boolean
  selectedZone: string | null
  draggedTaskId: string | null
  activeFilters: {
    status: string
    priority: string
    assignee: string | null
  }
}

export const useUIStore = defineStore('ui', () => {
  // State
  const uiState = useLocalStorage<UIState>('ui-state', {
    viewMode: 'kanban',
    theme: 'dark',
    density: 'comfortable',
    sidebar: 'expanded',
    showTaskDetails: false,
    showFilters: false,
    showQuickAdd: false,
    showCommandPalette: false,
    selectedZone: null,
    draggedTaskId: null,
    activeFilters: {
      status: 'all',
      priority: 'all',
      assignee: null
    }
  })

  const notifications = ref<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; timestamp: number }>>([])
  const modals = ref<Record<string, boolean>>({})
  const tooltips = ref<Record<string, boolean>>({})

  // Computed
  const isDarkMode = computed(() => {
    if (uiState.value.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return uiState.value.theme === 'dark'
  })

  const isSidebarVisible = computed(() => {
    return uiState.value.sidebar !== 'hidden'
  })

  const isSidebarExpanded = computed(() => {
    return uiState.value.sidebar === 'expanded'
  })

  const hasActiveFilters = computed(() => {
    const { status, priority, assignee } = uiState.value.activeFilters
    return status !== 'all' || priority !== 'all' || assignee !== null
  })

  const activeNotifications = computed(() => {
    const now = Date.now()
    return notifications.value.filter(n => now - n.timestamp < 5000)
  })

  // Actions
  const setViewMode = (mode: ViewMode) => {
    uiState.value.viewMode = mode
  }

  const setTheme = (theme: Theme) => {
    uiState.value.theme = theme
    applyTheme(theme)
  }

  const setDensity = (density: Density) => {
    uiState.value.density = density
  }

  const toggleSidebar = () => {
    if (uiState.value.sidebar === 'expanded') {
      uiState.value.sidebar = 'collapsed'
    } else if (uiState.value.sidebar === 'collapsed') {
      uiState.value.sidebar = 'expanded'
    }
  }

  const setSidebarState = (state: SidebarState) => {
    uiState.value.sidebar = state
  }

  const toggleTaskDetails = () => {
    uiState.value.showTaskDetails = !uiState.value.showTaskDetails
  }

  const setTaskDetailsVisible = (visible: boolean) => {
    uiState.value.showTaskDetails = visible
  }

  const toggleFilters = () => {
    uiState.value.showFilters = !uiState.value.showFilters
  }

  const setFiltersVisible = (visible: boolean) => {
    uiState.value.showFilters = visible
  }

  const toggleQuickAdd = () => {
    uiState.value.showQuickAdd = !uiState.value.showQuickAdd
  }

  const setQuickAddVisible = (visible: boolean) => {
    uiState.value.showQuickAdd = visible
  }

  const toggleCommandPalette = () => {
    uiState.value.showCommandPalette = !uiState.value.showCommandPalette
  }

  const setCommandPaletteVisible = (visible: boolean) => {
    uiState.value.showCommandPalette = visible
  }

  const setSelectedZone = (zone: string | null) => {
    uiState.value.selectedZone = zone
  }

  const setDraggedTaskId = (id: string | null) => {
    uiState.value.draggedTaskId = id
  }

  const setActiveFilter = (key: keyof UIState['activeFilters'], value: string | null) => {
    const filterState = uiState.value.activeFilters
    if (key === 'assignee') {
      filterState[key] = value as string | null
    } else {
      filterState[key] = value as string
    }
  }

  const clearActiveFilters = () => {
    uiState.value.activeFilters = {
      status: 'all',
      priority: 'all',
      assignee: null
    }
  }

  // Notification actions
  const addNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    notifications.value.push({
      id,
      message,
      type,
      timestamp: Date.now()
    })

    setTimeout(() => {
      removeNotification(id)
    }, 5000)

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  // Modal actions
  const openModal = (name: string) => {
    modals.value[name] = true
  }

  const closeModal = (name: string) => {
    modals.value[name] = false
  }

  const toggleModal = (name: string) => {
    modals.value[name] = !modals.value[name]
  }

  const isModalOpen = (name: string) => {
    return modals.value[name] || false
  }

  // Tooltip actions
  const showTooltip = (id: string) => {
    tooltips.value[id] = true
  }

  const hideTooltip = (id: string) => {
    tooltips.value[id] = false
  }

  const isTooltipVisible = (id: string) => {
    return tooltips.value[id] || false
  }

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    const html = document.documentElement
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.classList.toggle('dark', prefersDark)
    } else {
      html.classList.toggle('dark', theme === 'dark')
    }
  }

  // Initialize theme on load
  const initTheme = () => {
    applyTheme(uiState.value.theme)
    
    if (uiState.value.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('auto')
      mediaQuery.addEventListener('change', handler)
    }
  }

  return {
    // State
    uiState: computed(() => uiState.value),
    notifications: computed(() => notifications.value),
    modals: computed(() => modals.value),
    tooltips: computed(() => tooltips.value),
    
    // Computed
    isDarkMode,
    isSidebarVisible,
    isSidebarExpanded,
    hasActiveFilters,
    activeNotifications,
    
    // Actions
    setViewMode,
    setTheme,
    setDensity,
    toggleSidebar,
    setSidebarState,
    toggleTaskDetails,
    setTaskDetailsVisible,
    toggleFilters,
    setFiltersVisible,
    toggleQuickAdd,
    setQuickAddVisible,
    toggleCommandPalette,
    setCommandPaletteVisible,
    setSelectedZone,
    setDraggedTaskId,
    setActiveFilter,
    clearActiveFilters,
    addNotification,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    showTooltip,
    hideTooltip,
    isTooltipVisible,
    initTheme
  }
})
