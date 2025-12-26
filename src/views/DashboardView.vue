<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import type { Task } from '@/stores/tasks'

const tasksStore = useTasksStore()
const uiStore = useUIStore()

const todayTasks = computed(() => tasksStore.tasksDueToday)
const overdueTasks = computed(() => tasksStore.overdueTasks)
const recentTasks = computed(() => {
  return [...tasksStore.tasks]
    .filter(t => t.status !== 'archived')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
})

const priorityTasks = computed(() => {
  return tasksStore.tasksByPriority.filter(t => 
    t.priority === 'critical' || t.priority === 'high'
  ).slice(0, 5)
})

const completionRate = computed(() => tasksStore.taskStats.completionRate)

onMounted(() => {
  // Initialize with sample data if empty
  if (tasksStore.tasks.length === 0) {
    createSampleTasks()
  }
})

function createSampleTasks() {
  const sampleTasks: Partial<Task>[] = [
    {
      title: 'Design system architecture',
      description: 'Create comprehensive design system with components, tokens, and documentation',
      status: 'in-progress',
      priority: 'critical',
      tags: ['design', 'architecture'],
      estimatedHours: 8
    },
    {
      title: 'Implement authentication flow',
      description: 'Build secure authentication with OAuth and session management',
      status: 'todo',
      priority: 'high',
      tags: ['security', 'backend'],
      estimatedHours: 6
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST endpoints with examples and error codes',
      status: 'backlog',
      priority: 'medium',
      tags: ['documentation'],
      estimatedHours: 4
    },
    {
      title: 'Performance optimization',
      description: 'Optimize bundle size, implement lazy loading, and improve Core Web Vitals',
      status: 'todo',
      priority: 'high',
      tags: ['performance'],
      estimatedHours: 12
    },
    {
      title: 'User testing sessions',
      description: 'Conduct usability testing with 5 participants and analyze results',
      status: 'backlog',
      priority: 'low',
      tags: ['ux', 'testing'],
      estimatedHours: 8
    }
  ]

  sampleTasks.forEach(task => tasksStore.createTask(task))
}

function selectTask(task: Task) {
  tasksStore.selectTask(task.id)
  uiStore.setTaskDetailsVisible(true)
}
</script>

<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1 class="dashboard-title">Command Center</h1>
      <p class="dashboard-subtitle">Mission status: {{ completionRate }}% complete</p>
    </header>

    <section class="stats-grid">
      <div class="stat-card critical">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <div class="stat-value">{{ overdueTasks.length }}</div>
          <div class="stat-label">Overdue</div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-value">{{ todayTasks.length }}</div>
          <div class="stat-label">Due Today</div>
        </div>
      </div>

      <div class="stat-card info">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <div class="stat-value">{{ priorityTasks.length }}</div>
          <div class="stat-label">High Priority</div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">✓</div>
        <div class="stat-content">
          <div class="stat-value">{{ completionRate }}%</div>
          <div class="stat-label">Complete</div>
        </div>
      </div>
    </section>

    <section class="dashboard-content">
      <div class="dashboard-column">
        <div class="panel">
          <h2 class="panel-title">Critical Alerts</h2>
          <div class="task-list">
            <div
              v-for="task in overdueTasks"
              :key="task.id"
              class="task-item critical"
              @click="selectTask(task)"
            >
              <div class="task-priority-indicator" :class="task.priority"></div>
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">
                  <span class="task-due">Overdue</span>
                </div>
              </div>
            </div>
            <div v-if="overdueTasks.length === 0" class="empty-state">
              <div class="empty-icon">✓</div>
              <p>No overdue tasks</p>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-column">
        <div class="panel">
          <h2 class="panel-title">Today's Missions</h2>
          <div class="task-list">
            <div
              v-for="task in todayTasks"
              :key="task.id"
              class="task-item"
              @click="selectTask(task)"
            >
              <div class="task-priority-indicator" :class="task.priority"></div>
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">
                  <span class="task-status" :class="task.status">{{ task.status }}</span>
                </div>
              </div>
            </div>
            <div v-if="todayTasks.length === 0" class="empty-state">
              <div class="empty-icon">📅</div>
              <p>No tasks due today</p>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-column">
        <div class="panel">
          <h2 class="panel-title">Recent Activity</h2>
          <div class="task-list">
            <div
              v-for="task in recentTasks"
              :key="task.id"
              class="task-item"
              @click="selectTask(task)"
            >
              <div class="task-priority-indicator" :class="task.priority"></div>
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">
                  <span class="task-time">{{ new Date(task.updatedAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
            <div v-if="recentTasks.length === 0" class="empty-state">
              <div class="empty-icon">📝</div>
              <p>No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-title {
  font-family: 'Courier New', monospace;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.05em;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #888;
  margin: 0;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.stat-card.critical {
  border-color: #ff4757;
}

.stat-card.warning {
  border-color: #ffa502;
}

.stat-card.info {
  border-color: #00d2d3;
}

.stat-card.success {
  border-color: #2ed573;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 0.25rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.panel {
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.panel-title {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  padding: 1rem 1.5rem;
  margin: 0;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
}

.task-list {
  padding: 0.5rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 255, 136, 0.3);
  transform: translateX(4px);
}

.task-item.critical {
  border-left: 3px solid #ff4757;
}

.task-priority-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-priority-indicator.critical {
  background: #ff4757;
  box-shadow: 0 0 10px #ff4757;
}

.task-priority-indicator.high {
  background: #ffa502;
}

.task-priority-indicator.medium {
  background: #00d2d3;
}

.task-priority-indicator.low {
  background: #2ed573;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.task-due,
.task-status,
.task-time {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.task-due {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

.task-status {
  color: #00d2d3;
  background: rgba(0, 210, 211, 0.1);
}

.task-time {
  color: #888;
  background: rgba(136, 136, 136, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  color: #888;
  font-size: 0.875rem;
  margin: 0;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>
