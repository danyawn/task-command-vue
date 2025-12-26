<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import type { Task } from '@/stores/tasks'

const tasksStore = useTasksStore()
const uiStore = useUIStore()

const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)

const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

const monthName = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const calendarDays = computed(() => {
  const days: Array<{ date: Date; tasks: Task[] } | null> = []
  
  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push(null)
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth.value; day++) {
    const date = new Date(currentYear.value, currentMonth.value, day)
    const dayTasks = tasksStore.tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate.toDateString() === date.toDateString()
    })
    
    days.push({ date, tasks: dayTasks })
  }
  
  return days
})

const selectedDateTasks = computed(() => {
  if (!selectedDate.value) return []
  const dateValue = selectedDate.value
  const selectedDateStr = dateValue.toDateString()
  return tasksStore.tasks.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    return taskDate.toDateString() === selectedDateStr
  })
})

onMounted(() => {
  if (tasksStore.tasks.length === 0) {
    createSampleTasks()
  }
})

function createSampleTasks() {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const sampleTasks: Partial<Task>[] = [
    {
      title: 'Today\'s deadline',
      description: 'Complete today\'s tasks',
      status: 'in-progress',
      priority: 'critical',
      dueDate: today.toISOString()
    },
    {
      title: 'Tomorrow\'s review',
      description: 'Review project deliverables',
      status: 'todo',
      priority: 'high',
      dueDate: tomorrow.toISOString()
    },
    {
      title: 'Weekly planning',
      description: 'Plan next week\'s tasks',
      status: 'backlog',
      priority: 'medium',
      dueDate: nextWeek.toISOString()
    }
  ]

  sampleTasks.forEach(task => tasksStore.createTask(task))
}

function previousMonth() {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

function nextMonth() {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

function selectDay(day: Date) {
  selectedDate.value = day
}

function selectTask(task: Task) {
  tasksStore.selectTask(task.id)
  uiStore.setTaskDetailsVisible(true)
}

function isToday(date: Date) {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isSelected(date: Date) {
  if (!selectedDate.value) return false
  return date.toDateString() === selectedDate.value.toDateString()
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
  <div class="calendar-view">
    <!-- Editorial Header -->
    <header class="calendar-header">
      <div class="header-content">
        <button class="nav-btn" @click="previousMonth" aria-label="Previous month">
          <ChevronLeftIcon class="nav-icon" />
        </button>
        <div class="month-display">
          <h1 class="month-title">{{ monthName }}</h1>
          <p class="month-subtitle">{{ calendarDays.filter(d => d !== null).length }} days</p>
        </div>
        <button class="nav-btn" @click="nextMonth" aria-label="Next month">
          <ChevronRightIcon class="nav-icon" />
        </button>
      </div>
      <div class="header-divider"></div>
    </header>

    <!-- Calendar Grid -->
    <div class="calendar-container">
      <div class="calendar-grid">
        <!-- Day Headers -->
        <div class="day-header">Sun</div>
        <div class="day-header">Mon</div>
        <div class="day-header">Tue</div>
        <div class="day-header">Wed</div>
        <div class="day-header">Thu</div>
        <div class="day-header">Fri</div>
        <div class="day-header">Sat</div>

        <!-- Calendar Days -->
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'is-today': day && isToday(day.date),
            'is-selected': day && isSelected(day.date),
            'has-tasks': day && day.tasks.length > 0,
            'is-empty': !day
          }"
          @click="day && selectDay(day.date)"
        >
          <span v-if="day" class="day-number">{{ day.date.getDate() }}</span>
          <div v-if="day && day.tasks.length > 0" class="day-tasks">
            <div
              v-for="task in day.tasks.slice(0, 3)"
              :key="task.id"
              class="task-indicator"
              :style="{ backgroundColor: getPriorityColor(task.priority) }"
            ></div>
            <span v-if="day.tasks.length > 3" class="task-more">
              +{{ day.tasks.length - 3 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Selected Day Panel -->
      <aside v-if="selectedDate" class="day-panel">
        <h2 class="panel-title">
          {{ selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) || '' }}
        </h2>
        <div class="panel-divider"></div>
        <div class="day-task-list">
          <div
            v-for="task in selectedDateTasks"
            :key="task.id"
            class="day-task-item"
            @click="selectTask(task)"
          >
            <div class="task-dot" :style="{ backgroundColor: getPriorityColor(task.priority) }"></div>
            <div class="task-info">
              <h3 class="task-title">{{ task.title }}</h3>
              <span class="task-status">{{ task.status }}</span>
            </div>
          </div>
          <div v-if="selectedDateTasks.length === 0" class="empty-day">
            <p>No missions scheduled</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   EDITORIAL CALENDAR VIEW
   ======================================== */

.calendar-view {
  padding: var(--space-8) var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: calc(var(--space-8) + max(0px, var(--safe-area-inset-bottom)));
}

/* ========================================
   EDITORIAL HEADER
   ======================================== */

.calendar-header {
  margin-bottom: var(--space-8);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-6);
}

.nav-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  min-width: var(--touch-target-min);
  min-height: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.nav-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-primary);
  transform: scale(1.05);
}

.nav-icon {
  width: 20px;
  height: 20px;
  color: var(--text-primary);
}

.month-display {
  flex: 1;
  text-align: center;
}

.month-title {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
  text-transform: uppercase;
}

.month-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  color: var(--text-tertiary);
  margin: 0;
  font-style: italic;
}

.header-divider {
  width: 100%;
  height: 2px;
  background: var(--text-primary);
  margin-top: var(--space-6);
}

/* ========================================
   CALENDAR CONTAINER
   ======================================== */

.calendar-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-8);
  align-items: start;
}

/* ========================================
   CALENDAR GRID
   ======================================== */

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border-primary);
  border: var(--border-medium);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.day-header {
  background: var(--bg-tertiary);
  padding: var(--space-4);
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.calendar-day {
  background: var(--bg-elevated);
  min-height: 100px;
  padding: var(--space-3);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.calendar-day:hover:not(.is-empty) {
  background: var(--bg-tertiary);
}

.calendar-day.is-today {
  background: var(--bg-tertiary);
  border: 2px solid var(--accent-primary);
}

.calendar-day.is-selected {
  background: var(--bg-tertiary);
  border: 2px solid var(--accent-primary);
  box-shadow: inset 0 0 0 2px var(--accent-primary);
}

.calendar-day.has-tasks {
  background: var(--bg-secondary);
}

.calendar-day.is-empty {
  background: var(--bg-primary);
  cursor: default;
}

.day-number {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.day-tasks {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  align-content: start;
}

.task-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.task-more {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-tertiary);
}

/* ========================================
   DAY PANEL
   ======================================== */

.day-panel {
  background: var(--bg-elevated);
  border: var(--border-thin);
  border-top: 3px solid var(--accent-primary);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  position: sticky;
  top: var(--space-6);
}

.panel-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin: 0;
  text-transform: uppercase;
}

.panel-divider {
  width: 100%;
  height: 1px;
  background: var(--border-primary);
  margin: var(--space-4) 0;
}

.day-task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.day-task-list::-webkit-scrollbar {
  width: 4px;
}

.day-task-list::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

.day-task-list::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: var(--radius-full);
}

.day-task-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border: var(--border-thin);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: var(--touch-target-min);
  -webkit-tap-highlight-color: transparent;
}

.day-task-item:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-secondary);
  transform: translateX(4px);
}

.task-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
  line-height: var(--leading-snug);
}

.task-status {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.empty-day {
  padding: var(--space-8);
  text-align: center;
}

.empty-day p {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  color: var(--text-tertiary);
  margin: 0;
  font-style: italic;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 1024px) {
  .calendar-container {
    grid-template-columns: 1fr;
  }

  .day-panel {
    position: static;
    margin-top: var(--space-6);
  }
}

@media (max-width: 768px) {
  .calendar-view {
    padding: var(--space-6) var(--space-4);
  }

  .calendar-grid {
    border-radius: var(--radius-sm);
  }

  .day-header {
    font-size: var(--text-xs);
    padding: var(--space-2);
  }

  .calendar-day {
    min-height: 70px;
    padding: var(--space-2);
  }

  .day-number {
    font-size: var(--text-sm);
  }

  .month-title {
    font-size: var(--text-2xl);
  }

  .header-content {
    gap: var(--space-4);
  }

  .nav-btn {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .calendar-view {
    padding: var(--space-4) var(--space-3);
    padding-bottom: calc(var(--space-4) + max(0px, var(--safe-area-inset-bottom)));
  }

  .day-header {
    font-size: 10px;
  }

  .calendar-day {
    min-height: 50px;
    min-width: var(--touch-target-min);
  }
}

/* Touch-specific optimizations */
@media (hover: none) and (pointer: coarse) {
  .nav-btn:active,
  .calendar-day:active,
  .day-task-item:active {
    transform: scale(0.96);
  }

  .nav-btn:active {
    background: var(--bg-tertiary);
  }

  .calendar-day:active {
    background: var(--bg-secondary);
  }

  .day-task-item:active {
    background: var(--bg-secondary);
    transform: translateX(2px);
  }
}
</style>
