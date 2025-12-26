<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import { useTaskFilters } from '@/composables/useTaskFilters'
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
</script>

<template>
  <div class="list-view">
    <header class="list-header">
      <h1 class="list-title">Mission Log</h1>
      <div class="list-actions">
        <button
          v-if="hasActiveFilters"
          class="btn-secondary"
          @click="resetFilters"
        >
          Clear Filters
        </button>
        <button class="btn-primary" @click="uiStore.setQuickAddVisible(true)">
          + New Mission
        </button>
      </div>
    </header>

    <div class="list-controls">
      <div class="search-box">
        <input
          v-model="filters.searchQuery"
          type="text"
          placeholder="Search missions..."
          class="search-input"
        />
      </div>

      <div class="sort-controls">
        <span class="sort-label">Sort by:</span>
        <button
          v-for="field in ['createdAt', 'updatedAt', 'dueDate', 'priority'] as const"
          :key="field"
          class="sort-btn"
          :class="{ active: sortBy === field }"
          @click="toggleSort(field)"
        >
          {{ field }}
          <span v-if="sortBy === field" class="sort-indicator">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </span>
        </button>
      </div>
    </div>

    <div class="task-list">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @click="selectTask"
      />
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>No missions found</p>
        <button class="btn-primary" @click="uiStore.setQuickAddVisible(true)">
          Create First Mission
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-view {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.list-title {
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

.list-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
  color: #0a0a0a;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #fff;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00ff88;
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.search-input::placeholder {
  color: #888;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-label {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #888;
}

.sort-btn {
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sort-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.sort-btn.active {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
  color: #00ff88;
}

.sort-indicator {
  font-size: 0.75rem;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.empty-state p {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: #888;
  margin: 0 0 2rem 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

@media (max-width: 768px) {
  .list-view {
    padding: 1rem;
  }

  .list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .list-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-controls {
    flex-wrap: wrap;
  }
}
</style>
