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
</script>

<template>
  <div class="timeline-view">
    <header class="timeline-header">
      <h1 class="timeline-title">Mission Timeline</h1>
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
    </header>

    <div class="timeline-content">
      <div
        v-for="(tasks, month) in groupedTasks"
        :key="month"
        class="timeline-month"
      >
        <h2 class="month-title">{{ month }}</h2>
        <div class="timeline-tasks">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="timeline-task"
            :class="task.priority"
            @click="selectTask(task)"
          >
            <div class="task-date">
              <div class="date-day">{{ new Date(task.dueDate!).getDate() }}</div>
              <div class="date-month">{{ new Date(task.dueDate!).toLocaleDateString('en-US', { month: 'short' }) }}</div>
            </div>
            <div class="task-line"></div>
            <div class="task-card">
              <div class="task-priority" :class="task.priority"></div>
              <div class="task-info">
                <h3 class="task-title">{{ task.title }}</h3>
                <div class="task-meta">
                  <span class="task-status">{{ task.status }}</span>
                  <span v-if="task.estimatedHours" class="task-est">{{ task.estimatedHours }}h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="Object.keys(groupedTasks).length === 0" class="empty-timeline">
        <div class="empty-icon">📅</div>
        <p>No upcoming missions</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-view {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
}

.timeline-title {
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

.time-range-selector {
  display: flex;
  gap: 0.5rem;
}

.range-btn {
  padding: 0.5rem 1rem;
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
}

.range-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.range-btn.active {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
  color: #00ff88;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.timeline-month {
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.month-title {
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 1.5rem 0;
  color: #fff;
  border-bottom: 2px solid #00ff88;
  padding-bottom: 0.5rem;
}

.timeline-tasks {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.timeline-task {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-task:hover {
  transform: translateX(8px);
}

.task-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  flex-shrink: 0;
}

.date-day {
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #00ff88;
  line-height: 1;
}

.date-month {
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #888;
  margin-top: 0.25rem;
}

.task-line {
  flex: 1;
  min-width: 20px;
  height: 2px;
  background: linear-gradient(90deg, #00ff88 0%, rgba(0, 255, 136, 0.1) 100%);
  margin-top: 1rem;
  position: relative;
}

.task-line::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #00ff88;
  border-radius: 50%;
  box-shadow: 0 0 10px #00ff88;
}

.task-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.timeline-task:hover .task-card {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 255, 136, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.task-priority {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  flex-shrink: 0;
}

.task-priority.critical {
  background: #ff4757;
  box-shadow: 0 0 10px #ff4757;
}

.task-priority.high {
  background: #ffa502;
}

.task-priority.medium {
  background: #00d2d3;
}

.task-priority.low {
  background: #2ed573;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.task-status,
.task-est {
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: 2px;
}

.task-status {
  color: #00d2d3;
  background: rgba(0, 210, 211, 0.1);
}

.task-est {
  color: #888;
  background: rgba(136, 136, 136, 0.1);
}

.empty-timeline {
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

.empty-timeline p {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: #888;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

@media (max-width: 768px) {
  .timeline-view {
    padding: 1rem;
  }

  .timeline-header {
    flex-direction: column;
    align-items: stretch;
  }

  .timeline-task {
    flex-direction: column;
    gap: 0.75rem;
  }

  .task-line {
    display: none;
  }

  .task-card {
    width: 100%;
  }
}
</style>
