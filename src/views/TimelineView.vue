<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import type { Task } from '@/stores/tasks'

const tasksStore = useTasksStore()
const uiStore = useUIStore()

const selectedTimeRange = ref<'week' | 'month' | 'quarter'>('month')

const timelineTasks = computed(() => {
  const now = new Date()
  const tasks = [...tasksStore.tasks]
    .filter(t => t.status !== 'archived' && t.status !== 'done')
    .sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
      return dateA - dateB
    })

  // Filter by time range
  if (selectedTimeRange.value === 'week') {
    const weekFromNow = new Date(now)
    weekFromNow.setDate(weekFromNow.getDate() + 7)
    return tasks.filter(t => {
      if (!t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      return dueDate <= weekFromNow
    })
  } else if (selectedTimeRange.value === 'month') {
    const monthFromNow = new Date(now)
    monthFromNow.setMonth(monthFromNow.getMonth() + 1)
    return tasks.filter(t => {
      if (!t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      return dueDate <= monthFromNow
    })
  } else {
    const quarterFromNow = new Date(now)
    quarterFromNow.setMonth(quarterFromNow.getMonth() + 3)
    return tasks.filter(t => {
      if (!t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      return dueDate <= quarterFromNow
    })
  }
})

const groupedTasks = computed(() => {
  const groups: Record<string, Task[]> = {}
  
  timelineTasks.value.forEach(task => {
    if (!task.dueDate) return 
    
    const date = new Date(task.dueDate)
    const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(task)
  })
  
  return groups
})

onMounted(() => {
  if (tasksStore.tasks.length === 0) {
    createSampleTasks()
  }
})

function createSampleTasks() {
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextMonth = new Date(today)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  
  const sampleTasks: Partial<Task>[] = [
    {
      title: 'Phase 1 kickoff',
      description: 'Start project phase 1',
      status: 'in-progress',
      priority: 'critical',
      dueDate: today.toISOString()
    },
    {
      title: 'Milestone review',
      description: 'Review first milestone',
      status: 'todo',
      priority: 'high',
      dueDate: nextWeek.toISOString()
    },
    {
      title: 'Phase 1 completion',
      description: 'Complete project phase 1',
      status: 'backlog',
      priority: 'medium',
      dueDate: nextMonth.toISOString()
    }
  ]
  
  sampleTasks.forEach(task => tasksStore.createTask(task))
}

function selectTask(task: Task) {
  tasksStore.selectTask(task.id)
  uiStore.setTaskDetailsVisible(true)
}

function setTimeRange(range: 'week' | 'month' | 'quarter') {
  selectedTimeRange.value = range
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: 'var(--status-critical)',
    high: 'var(--status-high)',
    medium: 'var(--status-medium)',
    low: 'var(--status-low)'
  }
  return colors[priority] || 'var(--text-tertiary)'
}
</script>

<template>
  <div class="timeline-view">
    <!-- Editorial Header -->
    <header class="timeline-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="header-title">Mission Timeline</h1>
          <p class="header-subtitle">Track upcoming milestones</p>
        </div>
        <div class="time-range-selector">
          <button
            v-for="range in ['week', 'month', 'quarter'] as const"
            :key="range"
            class="range-btn"
            :class="{ active: selectedTimeRange === range }"
            @click="setTimeRange(range)"
          >
            {{ range }}
          </button>
        </div>
      </div>
      <div class="header-divider"></div>
    </header>

    <!-- Timeline Content -->
    <div class="timeline-content">
      <div
        v-for="(tasks, month) in groupedTasks"
        :key="month"
        class="timeline-section"
      >
        <div class="section-header">
          <h2 class="section-title">{{ month }}</h2>
          <span class="section-count">{{ tasks.length }} {{ tasks.length === 1 ? 'mission' : 'missions' }}</span>
        </div>
        <div class="section-divider"></div>
        
        <div class="timeline-tasks">
          <article
            v-for="task in tasks"
            :key="task.id"
            class="timeline-task"
            @click="selectTask(task)"
          >
            <div class="task-date">
              <span class="date-day">{{ new Date(task.dueDate!).getDate() }}</span>
              <span class="date-month">{{ new Date(task.dueDate!).toLocaleDateString('en-US', { month: 'short' }) }}</span>
            </div>
            <div class="task-connector"></div>
            <div class="task-content">
              <div class="task-priority-indicator" :style="{ backgroundColor: getPriorityColor(task.priority) }"></div>
              <div class="task-info">
                <h3 class="task-title">{{ task.title }}</h3>
                <div class="task-meta">
                  <span class="task-status">{{ task.status }}</span>
                  <span v-if="task.estimatedHours" class="task-est">{{ task.estimatedHours }}h</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="Object.keys(groupedTasks).length === 0" class="empty-timeline">
        <div class="empty-content">
          <h3 class="empty-title">No Upcoming Missions</h3>
          <p class="empty-description">Your timeline is clear for the selected period.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   EDITORIAL TIMELINE VIEW
   ======================================== */

.timeline-view {
  padding: var(--space-8) var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: calc(var(--space-8) + max(0px, var(--safe-area-inset-bottom)));
}

/* ========================================
   EDITORIAL HEADER
   ======================================== */

.timeline-header {
  margin-bottom: var(--space-8);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-6);
  flex-wrap: wrap;
}

.header-main {
  flex: 1;
  min-width: 280px;
}

.header-title {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
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

.time-range-selector {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.range-btn {
  padding: var(--space-3) var(--space-5);
  background: var(--bg-elevated);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.range-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-color: var(--border-secondary);
}

.range-btn.active {
  background: var(--bg-primary);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  font-weight: var(--font-bold);
}

.header-divider {
  width: 100%;
  height: 2px;
  background: var(--text-primary);
  margin-top: var(--space-6);
}

/* ========================================
   TIMELINE CONTENT
   ======================================== */

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* ========================================
   TIMELINE SECTION
   ======================================== */

.timeline-section {
  background: var(--bg-elevated);
  border: var(--border-thin);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  background: var(--bg-tertiary);
  border-bottom: var(--border-thin);
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin: 0;
  text-transform: uppercase;
}

.section-count {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
  padding: var(--space-1) var(--space-3);
  background: var(--bg-primary);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
}

.section-divider {
  width: 100%;
  height: 1px;
  background: var(--border-primary);
}

/* ========================================
   TIMELINE TASKS
   ======================================== */

.timeline-tasks {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.timeline-task {
  display: flex;
  align-items: flex-start;
  gap: var(--space-5);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.timeline-task:hover {
  transform: translateX(8px);
}

.task-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--bg-tertiary);
  border: var(--border-thin);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.date-day {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--accent-primary);
  line-height: 1;
}

.date-month {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.task-connector {
  flex: 1;
  min-width: 32px;
  height: 2px;
  background: var(--border-secondary);
  margin-top: 32px;
  position: relative;
}

.task-connector::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background: var(--accent-primary);
  border-radius: 50%;
}

.task-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--bg-secondary);
  border: var(--border-thin);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.timeline-task:hover .task-content {
  background: var(--bg-tertiary);
  border-color: var(--accent-secondary);
  box-shadow: var(--shadow-md);
}

.task-priority-indicator {
  width: 4px;
  height: 40px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
  line-height: var(--leading-snug);
}

.task-meta {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.task-status,
.task-est {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  background: var(--bg-primary);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  color: var(--text-tertiary);
}

/* ========================================
   EMPTY STATE
   ======================================== */

.empty-timeline {
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
  margin: 0;
  font-style: italic;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 900px) {
  .timeline-view {
    padding: var(--space-6) var(--space-4);
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-main {
    width: 100%;
  }

  .time-range-selector {
    width: 100%;
  }

  .range-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .timeline-view {
    padding: var(--space-6) var(--space-4);
    padding-bottom: calc(var(--space-6) + max(0px, var(--safe-area-inset-bottom)));
  }

  .header-title {
    font-size: var(--text-3xl);
  }

  .timeline-task {
    flex-direction: column;
    gap: var(--space-4);
  }

  .task-date {
    width: 56px;
    height: 56px;
  }

  .date-day {
    font-size: var(--text-xl);
  }

  .task-connector {
    display: none;
  }

  .task-content {
    width: 100%;
  }
}

/* Touch-specific optimizations */
@media (hover: none) and (pointer: coarse) {
  .range-btn:active,
  .timeline-task:active {
    transform: scale(0.96);
  }

  .range-btn:active {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .timeline-task:active .task-content {
    background: var(--bg-tertiary);
    border-color: var(--accent-secondary);
  }
}
</style>
