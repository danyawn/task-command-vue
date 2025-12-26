<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import { useTaskDrag } from '@/composables/useTaskDrag'
import { PlusIcon } from '@heroicons/vue/24/outline'
import TaskCard from '@/components/TaskCard.vue'
import KanbanColumn from '@/components/KanbanColumn.vue'
import type { Task } from '@/stores/tasks'

const tasksStore = useTasksStore()
const uiStore = useUIStore()
const { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useTaskDrag()

const zones = computed(() => tasksStore.tasksByZone)

const zoneLabels: Record<string, { title: string; description: string }> = {
  backlog: { title: 'Backlog', description: 'Future considerations' },
  todo: { title: 'To Do', description: 'Ready to start' },
  'in-progress': { title: 'In Progress', description: 'Currently working' },
  review: { title: 'Review', description: 'Under evaluation' },
  done: { title: 'Done', description: 'Completed tasks' }
}

onMounted(() => {
  // Initialize with sample data if empty
  if (tasksStore.tasks.length === 0) {
    createSampleTasks()
  }
})

function createSampleTasks() {
  const sampleTasks: Partial<Task>[] = [
    {
      title: 'System architecture review',
      description: 'Review and approve new system architecture proposal',
      status: 'backlog',
      priority: 'critical',
      tags: ['architecture', 'review']
    },
    {
      title: 'API endpoint optimization',
      description: 'Optimize slow API endpoints to improve response time',
      status: 'todo',
      priority: 'high',
      tags: ['backend', 'performance']
    },
    {
      title: 'User authentication',
      description: 'Implement OAuth2 authentication flow',
      status: 'in-progress',
      priority: 'critical',
      tags: ['security', 'auth']
    },
    {
      title: 'Dashboard redesign',
      description: 'Redesign main dashboard with new UI components',
      status: 'review',
      priority: 'medium',
      tags: ['design', 'frontend']
    },
    {
      title: 'Unit test coverage',
      description: 'Increase unit test coverage to 80%',
      status: 'done',
      priority: 'low',
      tags: ['testing', 'quality']
    }
  ]

  sampleTasks.forEach(task => tasksStore.createTask(task))
}

function onTaskDragStart(taskId: string, zone: string) {
  handleDragStart(taskId, zone)
}

function onTaskDrop(zone: string) {
  const result = handleDrop(zone)
  if (result.taskId && result.fromZone !== result.toZone) {
    tasksStore.moveTask(result.taskId, result.toZone as Task['status'])
  }
}

function selectTask(task: Task) {
  tasksStore.selectTask(task.id)
  uiStore.setTaskDetailsVisible(true)
}

function createNewTask() {
  uiStore.setQuickAddVisible(true)
}

function getZoneCount(zone: string): number {
  return (zones.value as Record<string, Task[]>)[zone]?.length || 0
}
</script>

<template>
  <div class="kanban">
    <!-- Magazine Header -->
    <header class="kanban-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="header-title">Mission Board</h1>
          <p class="header-subtitle">Track progress across all stages</p>
        </div>
        <button class="btn-create" @click="createNewTask">
          <PlusIcon class="btn-icon" />
          <span>New Mission</span>
        </button>
      </div>
      <div class="header-divider"></div>
    </header>

    <!-- Magazine Board Layout -->
    <div class="kanban-board">
      <KanbanColumn
        v-for="(tasks, zone) in zones"
        :key="zone"
        :zone="zone"
        :tasks="tasks"
        :label="zoneLabels[zone]?.title || zone"
        :description="zoneLabels[zone]?.description || ''"
        :count="getZoneCount(zone)"
        @drag-start="onTaskDragStart"
        @drag-over="handleDragOver"
        @drop="onTaskDrop"
        @drag-end="handleDragEnd"
      >
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :is-dragging="dragState.draggedId === task.id"
          @click="selectTask"
        />
      </KanbanColumn>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   EDITORIAL KANBAN LAYOUT
   ======================================== */

.kanban {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--space-8) var(--space-6);
  padding-bottom: calc(var(--space-8) + max(0px, var(--safe-area-inset-bottom)));
  background: var(--bg-primary);
}

/* ========================================
   MAGAZINE HEADER
   ======================================== */

.kanban-header {
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
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
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

.btn-create {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  background: var(--text-primary);
  color: var(--bg-primary);
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
}

.btn-create:hover {
  background: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.header-divider {
  width: 100%;
  height: 2px;
  background: var(--text-primary);
  margin-top: var(--space-6);
}

/* ========================================
   MAGAZINE BOARD LAYOUT
   ======================================== */

.kanban-board {
  display: flex;
  gap: var(--space-6);
  flex: 1;
  overflow-x: auto;
  padding-bottom: var(--space-4);
  padding-left: var(--space-2);
  padding-right: var(--space-2);
  align-content: start;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.kanban-board > * {
  flex: 0 0 300px;
  scroll-snap-align: start;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 1200px) {
  .kanban-board {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 900px) {
  .kanban {
    padding: var(--space-6) var(--space-4);
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-title {
    font-size: var(--text-3xl);
  }

  .btn-create {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .kanban {
    padding: var(--space-4) var(--space-3);
    padding-bottom: calc(var(--space-4) + max(0px, var(--safe-area-inset-bottom)));
  }

  .header-title {
    font-size: var(--text-2xl);
  }

  .kanban-board {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: var(--space-4);
    padding: 0 var(--space-2) var(--space-4);
    margin: 0 calc(-1 * var(--space-3));
  }

  .kanban-board > * {
    flex: 0 0 85vw;
    scroll-snap-align: center;
  }

  /* Hide scrollbar on mobile for cleaner look */
  .kanban-board {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .kanban-board::-webkit-scrollbar {
    display: none;
  }
}

/* Touch-specific optimizations */
@media (hover: none) and (pointer: coarse) {
  .kanban-board {
    /* Enable momentum scrolling on iOS */
    -webkit-overflow-scrolling: touch;
  }

  .btn-create {
    -webkit-tap-highlight-color: transparent;
  }

  .btn-create:active {
    transform: scale(0.95);
    background: var(--accent-primary);
  }
}
</style>
