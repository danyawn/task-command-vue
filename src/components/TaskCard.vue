<script setup lang="ts">
import { computed } from 'vue'
import { CalendarIcon } from '@heroicons/vue/24/outline'
import type { Task } from '@/stores/tasks'
import type { Priority } from '@/stores/tasks'

interface Props {
  task: Task
  isDragging?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDragging: false
})

const emit = defineEmits<{
  click: [task: Task]
  dragStart: [taskId: string]
  dragEnd: []
}>()

const priorityColors: Record<Priority, string> = {
  critical: '#ff4757',
  high: '#ffa502',
  medium: '#00d2d3',
  low: '#2ed573'
}

const priorityLabels: Record<Priority, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW'
}

const completedSubtasks = computed(() => {
  return props.task.subtasks.filter(s => s.completed).length
})

const progress = computed(() => {
  if (props.task.subtasks.length === 0) return 0
  return Math.round((completedSubtasks.value / props.task.subtasks.length) * 100)
})

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.status === 'done') return false
  return new Date(props.task.dueDate) < new Date()
})

const formattedDueDate = computed(() => {
  if (!props.task.dueDate) return null
  const date = new Date(props.task.dueDate)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
})

function onDragStart(event: DragEvent) {
  emit('dragStart', props.task.id)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.task.id)
  }
}

function onDragEnd() {
  emit('dragEnd')
}

function onClick() {
  emit('click', props.task)
}
</script>

<template>
  <div
    class="task-card"
    :class="{ 'is-dragging': isDragging, 'is-overdue': isOverdue }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="onClick"
  >
    <div class="task-header">
      <div class="task-priority" :style="{ borderColor: priorityColors[task.priority] }">
        {{ priorityLabels[task.priority] }}
      </div>
      <div v-if="isOverdue" class="task-overdue">OVERDUE</div>
    </div>

    <h3 class="task-title">{{ task.title }}</h3>

    <p v-if="task.description" class="task-description">
      {{ task.description }}
    </p>

    <div v-if="task.tags.length > 0" class="task-tags">
      <span
        v-for="tag in task.tags.slice(0, 3)"
        :key="tag"
        class="task-tag"
      >
        {{ tag }}
      </span>
      <span v-if="task.tags.length > 3" class="task-tag more">
        +{{ task.tags.length - 3 }}
      </span>
    </div>

    <div v-if="task.subtasks.length > 0" class="task-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <span class="progress-text">{{ completedSubtasks }}/{{ task.subtasks.length }}</span>
    </div>

    <div class="task-footer">
      <div v-if="formattedDueDate" class="task-due-date" :class="{ overdue: isOverdue }">
        <CalendarIcon class="due-icon" />
        {{ formattedDueDate }}
      </div>
      <div v-if="task.assignee" class="task-assignee">
        <span class="assignee-avatar">{{ task.assignee.charAt(0).toUpperCase() }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 1rem;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.task-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 255, 136, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.task-card.is-dragging {
  opacity: 0.5;
  cursor: grabbing;
  transform: rotate(3deg);
}

.task-card.is-overdue {
  border-left: 3px solid #ff4757;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.task-priority {
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.25rem 0.5rem;
  border: 1px solid;
  border-radius: 2px;
}

.task-overdue {
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #ff4757;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-description {
  font-size: 0.75rem;
  color: #888;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.task-tag {
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border-radius: 2px;
}

.task-tag.more {
  background: rgba(255, 255, 255, 0.1);
  color: #888;
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88 0%, #00ccff 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  color: #888;
  white-space: nowrap;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.task-due-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
}

.task-due-date.overdue {
  color: #ff4757;
}

.due-icon {
  width: 14px;
  height: 14px;
}

.task-assignee {
  display: flex;
  align-items: center;
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  color: #0a0a0a;
}
</style>
