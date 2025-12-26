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
  icon: string
}

const props = defineProps<Props>()

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

const completedCount = computed(() => {
  return props.tasks.filter(t => t.status === 'done').length
})

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
    <div class="column-header">
      <div class="column-info">
        <component :is="currentIcon" class="column-icon" />
        <h2 class="column-title">{{ label }}</h2>
        <span class="column-count">{{ taskCount }}</span>
      </div>
      <div class="column-progress" v-if="zone === 'done' && taskCount > 0">
        <div class="progress-ring">
          <svg viewBox="0 0 36 36">
            <path
              class="progress-ring-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="progress-ring-fill"
              :stroke-dasharray="`${(completedCount / taskCount) * 100}, 100`"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span class="progress-value">{{ Math.round((completedCount / taskCount) * 100) }}%</span>
        </div>
      </div>
    </div>

    <div class="column-tasks">
      <slot
        :tasks="tasks"
        :on-drag-start="onTaskDragStart"
        :on-drag-end="onTaskDragEnd"
      ></slot>
      
      <div v-if="tasks.length === 0" class="empty-zone">
        <component :is="currentIcon" class="empty-icon" />
        <p>Drop tasks here</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.kanban-column.is-drag-over {
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
}

.column-header {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.column-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.column-icon {
  width: 20px;
  height: 20px;
  color: #888;
}

.column-title {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
  margin: 0;
  flex: 1;
}

.column-count {
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  color: #888;
}

.column-progress {
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
}

.progress-ring {
  position: relative;
  width: 36px;
  height: 36px;
}

.progress-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 3;
}

.progress-ring-fill {
  fill: none;
  stroke: url(#gradient);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

.progress-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Courier New', monospace;
  font-size: 0.5rem;
  font-weight: 700;
  color: #00ff88;
}

.column-tasks {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.column-tasks::-webkit-scrollbar {
  width: 4px;
}

.column-tasks::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.column-tasks::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.empty-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 120px;
}

.empty-icon {
  width: 32px;
  height: 32px;
  color: #888;
  opacity: 0.3;
}

.empty-zone p {
  font-size: 0.75rem;
  color: #888;
  margin: 0;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
</style>
