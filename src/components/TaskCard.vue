<script setup lang="ts">
import { computed } from 'vue'
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/vue/24/outline'
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
  critical: 'var(--status-critical)',
  high: 'var(--status-high)',
  medium: 'var(--status-medium)',
  low: 'var(--status-low)'
}

const priorityLabels: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
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
  <article
    class="task-card"
    :class="{ 'is-dragging': isDragging, 'is-overdue': isOverdue }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="onClick"
  >
    <!-- Card Header - Editorial Style -->
    <header class="card-header">
      <div class="header-left">
        <span class="priority-badge" :style="{ color: priorityColors[task.priority] }">
          {{ priorityLabels[task.priority] }}
        </span>
        <span v-if="isOverdue" class="overdue-badge">
          <ClockIcon class="overdue-icon" />
          Overdue
        </span>
      </div>
      <div class="header-right">
        <span class="card-number">#{{ task.id.slice(0, 6) }}</span>
      </div>
    </header>

    <!-- Article Title -->
    <h3 class="card-title">{{ task.title }}</h3>

    <!-- Article Excerpt -->
    <p v-if="task.description" class="card-excerpt">
      {{ task.description }}
    </p>

    <!-- Tags Section -->
    <div v-if="task.tags.length > 0" class="tags-section">
      <div class="tags-list">
        <span
          v-for="tag in task.tags.slice(0, 3)"
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
        <span v-if="task.tags.length > 3" class="tag more">
          +{{ task.tags.length - 3 }}
        </span>
      </div>
    </div>

    <!-- Progress Section -->
    <div v-if="task.subtasks.length > 0" class="progress-section">
      <div class="progress-header">
        <span class="progress-label">Progress</span>
        <span class="progress-value">{{ completedSubtasks }}/{{ task.subtasks.length }}</span>
      </div>
      <div class="progress-track">
        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <!-- Article Footer -->
    <footer class="card-footer">
      <div v-if="formattedDueDate" class="footer-left">
        <CalendarIcon class="footer-icon" />
        <span class="footer-text" :class="{ overdue: isOverdue }">{{ formattedDueDate }}</span>
      </div>
      <div class="footer-right">
        <div v-if="task.assignee" class="assignee">
          <UserIcon class="assignee-icon" />
          <span class="assignee-name">{{ task.assignee }}</span>
        </div>
      </div>
    </footer>
  </article>
</template>

<style scoped>
/* ========================================
   EDITORIAL TASK CARD
   ======================================== */

.task-card {
  background: var(--bg-elevated);
  border: var(--border-thin);
  border-left: 3px solid transparent;
  border-radius: var(--radius-md);
  padding: var(--space-5);
  cursor: grab;
  transition: all var(--transition-base);
  user-select: none;
  position: relative;
  min-height: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.task-card:hover {
  border-color: var(--accent-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.task-card:active {
  transform: scale(0.98);
}

.task-card.is-dragging {
  opacity: 0.6;
  cursor: grabbing;
  transform: rotate(1deg) scale(0.98);
}

.task-card.is-overdue {
  border-left-color: var(--status-critical);
}

/* ========================================
   CARD HEADER
   ======================================== */

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: var(--border-thin);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.priority-badge {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid currentColor;
  border-radius: var(--radius-sm);
}

.overdue-badge {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--status-critical);
  padding: var(--space-1) var(--space-3);
  background: rgba(196, 30, 58, 0.08);
  border-radius: var(--radius-sm);
}

.overdue-icon {
  width: 12px;
  height: 12px;
}

.header-right {
  display: flex;
  align-items: center;
}

.card-number {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-regular);
  color: var(--text-tertiary);
  letter-spacing: var(--tracking-wide);
}

/* ========================================
   CARD TITLE
   ======================================== */

.card-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ========================================
   CARD EXCERPT
   ======================================== */

.card-excerpt {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  margin: 0 0 var(--space-4) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ========================================
   TAGS SECTION
   ======================================== */

.tags-section {
  margin-bottom: var(--space-4);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: var(--space-1) var(--space-2);
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.tag:hover {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-color: var(--border-secondary);
}

.tag.more {
  background: var(--bg-primary);
  color: var(--text-tertiary);
  border-style: dashed;
}

/* ========================================
   PROGRESS SECTION
   ======================================== */

.progress-section {
  margin-bottom: var(--space-4);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.progress-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.progress-value {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.progress-track {
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--accent-secondary);
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}

/* ========================================
   CARD FOOTER
   ======================================== */

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: var(--border-thin);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.footer-icon {
  width: 14px;
  height: 14px;
  color: var(--text-tertiary);
}

.footer-text {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.footer-text.overdue {
  color: var(--status-critical);
  font-weight: var(--font-semibold);
}

.footer-right {
  display: flex;
  align-items: center;
}

.assignee {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.assignee-icon {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
}

.assignee-name {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

/* ========================================
   RESPONSIVE
   ======================================== */

@media (max-width: 640px) {
  .task-card {
    padding: var(--space-4);
    min-height: var(--touch-target-min);
  }

  .card-title {
    font-size: var(--text-sm);
  }

  .card-excerpt {
    font-size: var(--text-xs);
  }

  .progress-track {
    height: 6px;
  }

  .tag {
    padding: var(--space-1) var(--space-2);
  }
}

/* Touch-specific optimizations */
@media (hover: none) and (pointer: coarse) {
  .task-card {
    -webkit-tap-highlight-color: transparent;
  }

  .task-card:active {
    transform: scale(0.96);
    box-shadow: var(--shadow-md);
  }

  .priority-badge,
  .tag {
    min-height: 32px;
    display: inline-flex;
    align-items: center;
  }
}
</style>
