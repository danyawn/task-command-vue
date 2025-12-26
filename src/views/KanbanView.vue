<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import { useTaskDrag } from '@/composables/useTaskDrag'
import TaskCard from '@/components/TaskCard.vue'
import KanbanColumn from '@/components/KanbanColumn.vue'
import type { Task } from '@/stores/tasks'

const tasksStore = useTasksStore()
const uiStore = useUIStore()
const { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useTaskDrag()

const zones = computed(() => tasksStore.tasksByZone)

const zoneLabels: Record<string, { title: string; icon: string }> = {
  backlog: { title: 'Backlog', icon: '' },
  todo: { title: 'To Do', icon: '' },
  'in-progress': { title: 'In Progress', icon: '' },
  review: { title: 'Review', icon: '' },
  done: { title: 'Done', icon: '' }
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
      description: 'Review and approve the new system architecture proposal',
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
      description: 'Redesign the main dashboard with new UI components',
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
</script>

<template>
  <div class="kanban">
    <header class="kanban-header">
      <h1 class="kanban-title">Mission Board</h1>
      <button class="btn-primary" @click="createNewTask">
        <span class="btn-icon">+</span>
        New Mission
      </button>
    </header>

    <div class="kanban-board">
      <KanbanColumn
        v-for="(tasks, zone) in zones"
        :key="zone"
        :zone="zone"
        :tasks="tasks"
        :label="zoneLabels[zone]?.title || zone"
        :icon="zoneLabels[zone]?.icon || '📌'"
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
.kanban {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: #0a0a0a;
}

.kanban-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.kanban-title {
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
  background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
  border: none;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #0a0a0a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
}

.btn-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  flex: 1;
  overflow-x: auto;
  padding-bottom: 1rem;
}

@media (max-width: 1024px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kanban {
    padding: 1rem;
  }

  .kanban-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .kanban-board {
    grid-template-columns: 1fr;
  }
}
</style>
