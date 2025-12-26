import { ref, computed, watch } from 'vue'

export interface TaskFilter {
  status: 'all' | 'active' | 'completed' | 'archived'
  priority: 'all' | 'high' | 'medium' | 'low'
  assignee: string | null
  dueDate: 'all' | 'overdue' | 'today' | 'week' | 'month'
  searchQuery: string
}

export function useTaskFilters() {
  const filters = ref<TaskFilter>({
    status: 'all',
    priority: 'all',
    assignee: null,
    dueDate: 'all',
    searchQuery: ''
  })

  const activeFiltersCount = computed(() => {
    let count = 0
    if (filters.value.status !== 'all') count++
    if (filters.value.priority !== 'all') count++
    if (filters.value.assignee) count++
    if (filters.value.dueDate !== 'all') count++
    if (filters.value.searchQuery) count++
    return count
  })

  const hasActiveFilters = computed(() => activeFiltersCount.value > 0)

  const setStatus = (status: TaskFilter['status']) => {
    filters.value.status = status
  }

  const setPriority = (priority: TaskFilter['priority']) => {
    filters.value.priority = priority
  }

  const setAssignee = (assignee: string | null) => {
    filters.value.assignee = assignee
  }

  const setDueDate = (dueDate: TaskFilter['dueDate']) => {
    filters.value.dueDate = dueDate
  }

  const setSearchQuery = (query: string) => {
    filters.value.searchQuery = query
  }

  const resetFilters = () => {
    filters.value = {
      status: 'all',
      priority: 'all',
      assignee: null,
      dueDate: 'all',
      searchQuery: ''
    }
  }

  const clearSearch = () => {
    filters.value.searchQuery = ''
  }

  // Persist filters to localStorage
  const STORAGE_KEY = 'task-filters'

  const saveFilters = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters.value))
  }

  const loadFilters = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        filters.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to load filters:', e)
      }
    }
  }

  // Auto-save on filter change
  watch(
    filters,
    () => {
      saveFilters()
    },
    { deep: true }
  )

  return {
    filters: computed(() => filters.value),
    activeFiltersCount,
    hasActiveFilters,
    setStatus,
    setPriority,
    setAssignee,
    setDueDate,
    setSearchQuery,
    resetFilters,
    clearSearch,
    loadFilters
  }
}
