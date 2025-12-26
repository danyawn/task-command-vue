<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import {
  InboxIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import type { Task } from '@/stores/tasks'

interface Props {
  zone: string
  tasks: Task[]
  label: string
  description?: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  count: 0
})

const zoneIcons: Record<string, Component> = {
  backlog: InboxIcon,
  todo: ClipboardDocumentListIcon,
  'in-progress': ArrowPathIcon,
  review: EyeIcon,
  done: CheckCircleIcon
}

const currentIcon = computed(() => zoneIcons[props.zone] || InboxIcon)

const emit = defineEmits<{
  dragStart: [taskId: string, zone: string]
  dragOver: [zone: string]
  drop: [zone: string]
  dragEnd: []
}>()

const isDragOver = ref(false)

const taskCount = computed(() => props.tasks.length)

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
  emit('dragOver', props.zone)
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  emit('drop', props.zone)
}

const onTaskDragStart = (taskId: string) => {
  emit('dragStart', taskId, props.zone)
}

const onTaskDragEnd = () => {
  isDragOver.value = false
  emit('dragEnd')
}
</script>

<template>
  <div
    class="kanban-column"
    :class="{ 'is-drag-over': isDragOver }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Editorial Column Header -->
    <header class="column-header">
      <div class="header-top">
        <div class="column-info">
          <component :is="currentIcon" class="column-icon" />
          <div class="column-text">
            <h2 class="column-title">{{ label }}</h2>
            <p v-if="description" class="column-description">{{ description }}</p>
          </div>
        </div>
        <div class="column-badge">
          <span class="badge-count">{{ taskCount }}</span>
        </div>
      </div>
    </header>

    <!-- Column Tasks -->
    <div class="column-tasks">
      <slot
        :tasks="tasks"
        :on-drag-start="onTaskDragStart"
        :on-drag-end="onTaskDragEnd"
      ></slot>
      
      <div v-if="tasks.length === 0" class="empty-zone">
        <component :is="currentIcon" class="empty-icon" />
        <p class="empty-text">No tasks yet</p>
        <p class="empty-hint">Drag tasks here</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   EDITORIAL KANBAN COLUMN
   ======================================== */

.kanban-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  background: var(--bg-elevated);
  border: var(--border-thin);
  border-top: 3px solid var(--border-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.kanban-column.is-drag-over {
  border-color: var(--accent-primary);
  border-top-color: var(--accent-primary);
  box-shadow: var(--shadow-lg);
}

/* ========================================
   COLUMN HEADER
   ======================================== */

.column-header {
  padding: var(--space-5);
  background: var(--bg-tertiary);
  border-bottom: var(--border-thin);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.column-info {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  flex: 1;
  min-width: 0;
}

.column-icon {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-top: 2px;
}

.column-text {
  flex: 1;
  min-width: 0;
}

.column-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
  text-transform: uppercase;
}

.column-description {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
  margin: 0;
  font-style: italic;
}

.column-badge {
  flex-shrink: 0;
}

.badge-count {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-primary);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-primary);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
}

/* ========================================
   COLUMN TASKS
   ======================================== */

.column-tasks {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  -webkit-overflow-scrolling: touch;
}

.column-tasks::-webkit-scrollbar {
  width: 6px;
}

.column-tasks::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

.column-tasks::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: var(--radius-full);
}

.column-tasks::-webkit-scrollbar-thumb:hover {
  background: var(--border-tertiary);
}

/* ========================================
   EMPTY STATE
   ======================================== */

.empty-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
  min-height: 200px;
  border: 2px dashed var(--border-secondary);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: var(--text-tertiary);
  opacity: 0.4;
  margin-bottom: var(--space-4);
}

.empty-text {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-tertiary);
  margin: 0 0 var(--space-2) 0;
}

.empty-hint {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  color: var(--text-tertiary);
  margin: 0;
  font-style: italic;
}

/* ========================================
   RESPONSIVE
   ======================================== */

@media (max-width: 640px) {
  .kanban-column {
    min-height: 300px;
    border-radius: var(--radius-sm);
  }

  .column-header {
    padding: var(--space-4);
  }

  .column-title {
    font-size: var(--text-sm);
  }

  .column-description {
    font-size: var(--text-xs);
  }

  .empty-zone {
    padding: var(--space-8) var(--space-4);
    min-height: 150px;
  }

  .empty-icon {
    width: 32px;
    height: 32px;
  }

  .empty-text {
    font-size: var(--text-sm);
  }
}

/* Touch-specific optimizations */
@media (hover: none) and (pointer: coarse) {
  .kanban-column {
    -webkit-tap-highlight-color: transparent;
  }

  .kanban-column.is-drag-over {
    border-width: 2px;
  }

  .badge-count {
    min-height: 32px;
    min-width: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .column-tasks {
    /* Enable momentum scrolling on iOS */
    -webkit-overflow-scrolling: touch;
  }
}
</style>
