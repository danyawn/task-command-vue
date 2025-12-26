<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import { useTaskFilters } from '@/composables/useTaskFilters'
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import TaskCard from '@/components/TaskCard.vue'
import type { Task } from '@/stores/tasks'

const tasksStore = useTasksStore()
const uiStore = useUIStore()
const { filters, hasActiveFilters, resetFilters } = useTaskFilters()

const sortBy = ref<'createdAt' | 'updatedAt' | 'dueDate' | 'priority'>('updatedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

const filteredTasks = computed(() => {
  let tasks = [...tasksStore.tasks].filter(t => t.status !== 'archived')

  // Apply filters
  if (filters.value.status !== 'all') {
    tasks = tasks.filter(t => t.status === filters.value.status)
  }
  if (filters.value.priority !== 'all') {
    tasks = tasks.filter(t => t.priority === filters.value.priority)
  }
  if (filters.value.assignee) {
    tasks = tasks.filter(t => t.assignee === filters.value.assignee)
  }
  if (filters.value.searchQuery) {
    const query = filters.value.searchQuery.toLowerCase()
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Apply sorting
  tasks.sort((a, b) => {
    let comparison = 0

    if (sortBy.value === 'priority') {
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
      comparison = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
    } else {
      const key = sortBy.value as keyof Task
      const dateValueA = a[key]
      const dateValueB = b[key]
      const dateA = dateValueA ? new Date(dateValueA as string).getTime() : 0
      const dateB = dateValueB ? new Date(dateValueB as string).getTime() : 0
      comparison = dateA - dateB
    }

    return sortOrder.value === 'asc' ? comparison : -comparison
  })
  return tasks
})

onMounted(() => {
  if (tasksStore.tasks.length === 0) {
    createSampleTasks()
  }
})

function createSampleTasks() {
  const sampleTasks: Partial<Task>[] = [
    {
      title: 'System architecture review',
      description: 'Review and approve new system architecture',
      status: 'todo',
      priority: 'critical',
      tags: ['architecture', 'review']
    },
    {
      title: 'API optimization',
      description: 'Optimize slow API endpoints',
      status: 'in-progress',
      priority: 'high',
      tags: ['backend', 'performance']
    },
    {
      title: 'Documentation update',
      description: 'Update API documentation',
      status: 'backlog',
      priority: 'medium',
      tags: ['docs']
    }
  ]

  sampleTasks.forEach(task => tasksStore.createTask(task))
}

function selectTask(task: Task) {
  tasksStore.selectTask(task.id)
  uiStore.setTaskDetailsVisible(true)
}

function toggleSort(field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority') {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

function getSortLabel(field: string): string {
  const labels: Record<string, string> = {
    createdAt: 'Created',
    updatedAt: 'Updated',
    dueDate: 'Due Date',
    priority: 'Priority'
  }
  return labels[field] || field
}
</script>

<template>
  <div class="list-view">
    <!-- Editorial Header -->
    <header class="list-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="header-title">Mission Log</h1>
          <p class="header-subtitle">{{ filteredTasks.length }} {{ filteredTasks.length === 1 ? 'mission' : 'missions' }} in archive</p>
        </div>
        <div class="header-actions">
          <button
            v-if="hasActiveFilters"
            class="btn-secondary"
            @click="resetFilters"
          >
            <XMarkIcon class="btn-icon" />
            <span>Clear Filters</span>
          </button>
          <button class="btn-primary" @click="uiStore.setQuickAddVisible(true)">
            <PlusIcon class="btn-icon" />
            <span>New Mission</span>
          </button>
        </div>
      </div>
      <div class="header-divider"></div>
    </header>

    <!-- Editorial Controls -->
    <div class="list-controls">
      <div class="search-section">
        <MagnifyingGlassIcon class="search-icon" />
        <input
          v-model="filters.searchQuery"
          type="text"
          placeholder="Search missions..."
          class="search-input"
        />
      </div>

      <div class="sort-section">
        <span class="sort-label">Sort by</span>
        <div class="sort-buttons">
          <button
            v-for="field in ['createdAt', 'updatedAt', 'dueDate', 'priority'] as const"
            :key="field"
            class="sort-btn"
            :class="{ active: sortBy === field }"
            @click="toggleSort(field)"
          >
            {{ getSortLabel(field) }}
            <span v-if="sortBy === field" class="sort-indicator">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Task List -->
    <div class="task-list">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @click="selectTask"
      />
      
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-content">
          <h3 class="empty-title">No Missions Found</h3>
          <p class="empty-description">
            {{ hasActiveFilters ? 'Try adjusting your filters or search terms.' : 'Create your first mission to get started.' }}
          </p>
          <button v-if="!hasActiveFilters" class="btn-primary" @click="uiStore.setQuickAddVisible(true)">
            <PlusIcon class="btn-icon" />
            <span>Create First Mission</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   EDITORIAL LIST VIEW
   ======================================== */

.list-view {
  padding: var(--space-8) var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: calc(var(--space-8) + max(0px, var(--safe-area-inset-bottom)));
}

/* ========================================
   EDITORIAL HEADER
   ======================================== */

.list-header {
  margin-bottom: var(--space-8);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-6);
}

.header-main {
  flex: 1;
}

.header-title {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  word-break: break-word;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tighter);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
  text-transform: uppercase;
}

.header-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
  margin: 0;
  font-style: italic;
}

.header-actions {
  display: flex;
  gap: var(--space-3);
  flex-shrink: 0;
}

.header-divider {
  width: 100%;
  height: 2px;
  background: var(--text-primary);
  margin-top: var(--space-6);
}

/* ========================================
   BUTTONS
   ======================================== */

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  min-height: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.btn-primary {
  background: var(--text-primary);
  color: var(--bg-primary);
}

.btn-primary:hover {
  background: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: var(--border-thin);
}

.btn-secondary:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* ========================================
   EDITORIAL CONTROLS
   ======================================== */

.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 200px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  width: 18px;
  height: 18px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--space-4) var(--space-4) var(--space-4) var(--space-12);
  background: var(--bg-elevated);
  border: var(--border-thin);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  min-height: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.sort-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-shrink: 0;
}

.sort-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.sort-buttons {
  display: flex;
  gap: var(--space-2);
}

.sort-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--bg-tertiary);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.sort-btn:hover {
  background: var(--bg-elevated);
  color: var(--text-secondary);
  border-color: var(--border-secondary);
}

.sort-btn.active {
  background: var(--bg-primary);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  font-weight: var(--font-semibold);
}

.sort-indicator {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
}

/* ========================================
   TASK LIST
   ======================================== */

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* ========================================
   EMPTY STATE
   ======================================== */

.empty-state {
  display: flex;
  justify-content: center;
  padding: var(--space-16) var(--space-8);
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-4) 0;
}

.empty-description {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--text-tertiary);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-6) 0;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 900px) {
  .list-view {
    padding: var(--space-6) var(--space-4);
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    flex: 1;
    justify-content: center;
  }

  .list-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .sort-buttons {
    width: 100%;
    flex-wrap: wrap;
  }

  .sort-btn {
    flex: 1;
    justify-content: center;
    min-width: calc(50% - var(--space-1));
  }
}

@media (max-width: 640px) {
  .list-view {
    padding: var(--space-6) var(--space-4);
    padding-bottom: calc(var(--space-6) + max(0px, var(--safe-area-inset-bottom)));
  }

  .header-title {
    font-size: var(--text-3xl);
  }

  .header-actions {
    flex-direction: column;
  }

  .sort-btn {
    min-width: 100%;
  }

  .task-list {
    gap: var(--space-4);
  }
}

/* Touch-specific optimizations */
@media (hover: none) and (pointer: coarse) {
  .btn-primary:active,
  .btn-secondary:active,
  .sort-btn:active {
    transform: scale(0.96);
  }

  .btn-primary:active {
    background: var(--accent-primary);
    color: var(--bg-primary);
  }

  .sort-btn:active {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
}
</style>
