<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
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
  
  // Add empty cells for days before the first day of month
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
</script>

<template>
  <div class="calendar-view">
    <header class="calendar-header">
      <button class="nav-btn" @click="previousMonth">←</button>
      <h1 class="calendar-title">{{ monthName }}</h1>
      <button class="nav-btn" @click="nextMonth">→</button>
    </header>

    <div class="calendar-grid">
      <div class="calendar-day-header">Sun</div>
      <div class="calendar-day-header">Mon</div>
      <div class="calendar-day-header">Tue</div>
      <div class="calendar-day-header">Wed</div>
      <div class="calendar-day-header">Thu</div>
      <div class="calendar-day-header">Fri</div>
      <div class="calendar-day-header">Sat</div>

      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day"
        :class="{
          'is-today': day && isToday(day.date),
          'is-selected': day && isSelected(day.date),
          'has-tasks': day && day.tasks.length > 0
        }"
        @click="day && selectDay(day.date)"
      >
        <span v-if="day" class="day-number">{{ day.date.getDate() }}</span>
        <div v-if="day && day.tasks.length > 0" class="day-tasks">
          <div
            v-for="task in day.tasks.slice(0, 3)"
            :key="task.id"
            class="task-dot"
            :class="task.priority"
          ></div>
          <span v-if="day.tasks.length > 3" class="task-more">
            +{{ day.tasks.length - 3 }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="selectedDate" class="selected-day-panel">
      <h2 class="panel-title">
        {{ selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) || '' }}
      </h2>
      <div class="day-task-list">
        <div
          v-for="task in selectedDateTasks"
          :key="task.id"
          class="day-task-item"
          :class="task.priority"
          @click="selectTask(task)"
        >
          <div class="task-priority-dot" :class="task.priority"></div>
          <div class="task-info">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-status">{{ task.status }}</div>
          </div>
        </div>
        <div v-if="selectedDateTasks.length === 0" class="empty-day">
          <p>No tasks scheduled</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 1.25rem;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
  color: #00ff88;
}

.calendar-title {
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

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.calendar-day-header {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #888;
}

.calendar-day {
  background: rgba(20, 20, 20, 0.8);
  min-height: 100px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.calendar-day:hover {
  background: rgba(255, 255, 255, 0.1);
}

.calendar-day.is-today {
  background: rgba(0, 255, 136, 0.05);
  border: 2px solid #00ff88;
}

.calendar-day.is-selected {
  background: rgba(0, 255, 136, 0.1);
  border: 2px solid #00ff88;
}

.calendar-day.has-tasks {
  background: rgba(255, 255, 255, 0.05);
}

.day-number {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
}

.day-tasks {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.task-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.task-dot.critical {
  background: #ff4757;
}

.task-dot.high {
  background: #ffa502;
}

.task-dot.medium {
  background: #00d2d3;
}

.task-dot.low {
  background: #2ed573;
}

.task-more {
  font-family: 'Courier New', monospace;
  font-size: 0.5rem;
  color: #888;
}

.selected-day-panel {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.panel-title {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 1rem 0;
  color: #fff;
}

.day-task-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.day-task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-task-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 255, 136, 0.3);
  transform: translateX(4px);
}

.day-task-item.critical {
  border-left: 3px solid #ff4757;
}

.day-task-item.high {
  border-left: 3px solid #ffa502;
}

.day-task-item.medium {
  border-left: 3px solid #00d2d3;
}

.day-task-item.low {
  border-left: 3px solid #2ed573;
}

.task-priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-priority-dot.critical {
  background: #ff4757;
  box-shadow: 0 0 10px #ff4757;
}

.task-priority-dot.high {
  background: #ffa502;
}

.task-priority-dot.medium {
  background: #00d2d3;
}

.task-priority-dot.low {
  background: #2ed573;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  margin-bottom: 0.25rem;
}

.task-status {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
}

.empty-day {
  padding: 2rem;
  text-align: center;
}

.empty-day p {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #888;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

@media (max-width: 768px) {
  .calendar-view {
    padding: 1rem;
  }

  .calendar-day-header {
    font-size: 0.5rem;
    padding: 0.5rem;
  }

  .calendar-day {
    min-height: 60px;
    padding: 0.25rem;
  }

  .day-number {
    font-size: 0.625rem;
  }
}
</style>
