<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import type { Task } from '@/stores/tasks'
import {
  ExclamationTriangleIcon,
  CalendarIcon,
  FireIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/vue/24/outline'

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

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  }
  return labels[priority] || priority
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    review: 'Review',
    done: 'Completed',
    backlog: 'Backlog',
    archived: 'Archived'
  }
  return labels[status] || status
}
</script>

<template>
  <div class="dashboard">
    <!-- Hero Section - Magazine Cover Style -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-meta">
          <span class="hero-label">Dashboard</span>
          <span class="hero-divider">—</span>
          <span class="hero-date">{{ new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}</span>
        </div>
        <h1 class="hero-title">
          <span class="hero-title-main">Your Command</span>
          <span class="hero-title-accent">Center</span>
        </h1>
        <p class="hero-subtitle">
          Mission status: <strong>{{ completionRate }}% complete</strong> — {{ overdueTasks.length }} tasks require immediate attention
        </p>
      </div>
    </section>

    <!-- Editorial Divider -->
    <div class="editorial-divider"></div>

    <!-- Stats Grid - Magazine Feature Style -->
    <section class="stats-section">
      <div class="section-header">
        <h2 class="section-title">At a Glance</h2>
        <div class="section-underline"></div>
      </div>
      
      <div class="stats-grid">
        <article class="stat-card critical">
          <div class="stat-icon-wrapper">
            <ExclamationTriangleIcon class="stat-icon" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ overdueTasks.length }}</div>
            <div class="stat-label">Overdue</div>
            <div class="stat-description">Tasks past deadline</div>
          </div>
        </article>

        <article class="stat-card warning">
          <div class="stat-icon-wrapper">
            <CalendarIcon class="stat-icon" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ todayTasks.length }}</div>
            <div class="stat-label">Due Today</div>
            <div class="stat-description">Today's priorities</div>
          </div>
        </article>

        <article class="stat-card info">
          <div class="stat-icon-wrapper">
            <FireIcon class="stat-icon" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ priorityTasks.length }}</div>
            <div class="stat-label">High Priority</div>
            <div class="stat-description">Critical tasks</div>
          </div>
        </article>

        <article class="stat-card success">
          <div class="stat-icon-wrapper">
            <CheckCircleIcon class="stat-icon" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ completionRate }}%</div>
            <div class="stat-label">Complete</div>
            <div class="stat-description">Overall progress</div>
          </div>
        </article>
      </div>
    </section>

    <!-- Editorial Divider -->
    <div class="editorial-divider"></div>

    <!-- Main Content - Magazine Layout -->
    <section class="dashboard-content">
      <!-- Critical Alerts - Feature Article -->
      <div class="content-column feature">
        <div class="column-header">
          <h3 class="column-title">Critical Alerts</h3>
          <p class="column-subtitle">Tasks requiring immediate attention</p>
        </div>
        
        <div class="task-list">
          <article
            v-for="task in overdueTasks"
            :key="task.id"
            class="task-card feature"
            @click="selectTask(task)"
          >
            <div class="task-header">
              <span class="task-priority" :class="task.priority">{{ getPriorityLabel(task.priority) }}</span>
              <span class="task-meta">
                <ClockIcon class="meta-icon" />
                Overdue
              </span>
            </div>
            <h4 class="task-title">{{ task.title }}</h4>
            <p class="task-excerpt">{{ task.description }}</p>
            <div class="task-footer">
              <div class="task-tags">
                <TagIcon class="tag-icon" />
                <span v-for="tag in task.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </article>
          
          <div v-if="overdueTasks.length === 0" class="empty-state">
            <CheckCircleIcon class="empty-icon" />
            <h4 class="empty-title">No Overdue Tasks</h4>
            <p class="empty-description">You're all caught up!</p>
          </div>
        </div>
      </div>

      <!-- Today's Missions - Lead Article -->
      <div class="content-column lead">
        <div class="column-header">
          <h3 class="column-title">Today's Missions</h3>
          <p class="column-subtitle">Your priorities for today</p>
        </div>
        
        <div class="task-list">
          <article
            v-for="task in todayTasks"
            :key="task.id"
            class="task-card"
            @click="selectTask(task)"
          >
            <div class="task-header">
              <span class="task-priority" :class="task.priority">{{ getPriorityLabel(task.priority) }}</span>
              <span class="task-status" :class="task.status">{{ getStatusLabel(task.status) }}</span>
            </div>
            <h4 class="task-title">{{ task.title }}</h4>
            <p class="task-excerpt">{{ task.description }}</p>
          </article>
          
          <div v-if="todayTasks.length === 0" class="empty-state">
            <CalendarIcon class="empty-icon" />
            <h4 class="empty-title">No Tasks Due Today</h4>
            <p class="empty-description">Enjoy your free time!</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity - Sidebar Content -->
      <div class="content-column sidebar">
        <div class="column-header">
          <h3 class="column-title">Recent Activity</h3>
          <p class="column-subtitle">Latest updates</p>
        </div>
        
        <div class="task-list compact">
          <article
            v-for="task in recentTasks"
            :key="task.id"
            class="task-item"
            @click="selectTask(task)"
          >
            <div class="task-indicator" :class="task.priority"></div>
            <div class="task-info">
              <h5 class="task-name">{{ task.title }}</h5>
              <span class="task-time">{{ new Date(task.updatedAt).toLocaleDateString() }}</span>
            </div>
          </article>
          
          <div v-if="recentTasks.length === 0" class="empty-state compact">
            <p class="empty-description">No recent activity</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Editorial Footer -->
    <footer class="dashboard-footer">
      <div class="footer-divider"></div>
      <p class="footer-text">Stay focused. Stay productive.</p>
    </footer>
  </div>
</template>

<style scoped>
/* ========================================
   EDITORIAL DASHBOARD LAYOUT
   ======================================== */

.dashboard {
  padding: var(--space-8) var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
}

/* ========================================
   HERO SECTION - Magazine Cover
   ======================================== */

.hero-section {
  padding: var(--space-12) 0;
  border-bottom: var(--border-thin);
  margin-bottom: var(--space-8);
}

.hero-content {
  max-width: 900px;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.hero-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--accent-primary);
}

.hero-divider {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  color: var(--border-tertiary);
}

.hero-date {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-regular);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.hero-title {
  font-family: var(--font-display);
  font-size: var(--text-6xl);
  font-weight: var(--font-extrabold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tighter);
  color: var(--text-primary);
  margin: 0 0 var(--space-6) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.hero-title-main {
  display: block;
}

.hero-title-accent {
  display: block;
  color: var(--accent-primary);
  font-style: italic;
}

.hero-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
  color: var(--text-secondary);
  margin: 0;
  max-width: 600px;
}

.hero-subtitle strong {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

/* ========================================
   EDITORIAL DIVIDER
   ======================================== */

.editorial-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--border-primary),
    transparent
  );
  margin: var(--space-8) 0;
}

/* ========================================
   STATS SECTION
   ======================================== */

.stats-section {
  margin-bottom: var(--space-12);
}

.section-header {
  margin-bottom: var(--space-8);
  text-align: center;
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
  text-transform: uppercase;
}

.section-underline {
  width: 60px;
  height: 3px;
  background: var(--accent-primary);
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-6);
}

.stat-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-5);
  padding: var(--space-8);
  background: var(--bg-elevated);
  border: var(--border-thin);
  border-top: 4px solid transparent;
  transition: all var(--transition-base);
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-card.critical {
  border-top-color: var(--status-critical);
}

.stat-card.warning {
  border-top-color: var(--status-high);
}

.stat-card.info {
  border-top-color: var(--status-medium);
}

.stat-card.success {
  border-top-color: var(--status-success);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.stat-icon {
  width: 28px;
  height: 28px;
}

.stat-card.critical .stat-icon {
  color: var(--status-critical);
}

.stat-card.warning .stat-icon {
  color: var(--status-high);
}

.stat-card.info .stat-icon {
  color: var(--status-medium);
}

.stat-card.success .stat-icon {
  color: var(--status-success);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.stat-label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.stat-description {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--font-regular);
  color: var(--text-tertiary);
}

/* ========================================
   DASHBOARD CONTENT
   ======================================== */

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 1fr 320px;
  gap: var(--space-8);
  align-items: start;
}

.content-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.content-column.feature {
  grid-column: 1 / 2;
}

.content-column.lead {
  grid-column: 2 / 3;
}

.content-column.sidebar {
  grid-column: 3 / 4;
}

.column-header {
  padding-bottom: var(--space-4);
  border-bottom: var(--border-thin);
}

.column-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
  text-transform: uppercase;
}

.column-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  color: var(--text-tertiary);
  margin: 0;
  font-style: italic;
}

/* ========================================
   TASK CARDS - Magazine Style
   ======================================== */

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.task-card {
  background: var(--bg-elevated);
  border: var(--border-thin);
  padding: var(--space-6);
  transition: all var(--transition-base);
  cursor: pointer;
}

.task-card:hover {
  border-color: var(--accent-secondary);
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.task-card.feature {
  border-left: 4px solid var(--status-critical);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.task-priority {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
}

.task-priority.critical {
  background: rgba(196, 30, 58, 0.1);
  color: var(--status-critical);
}

.task-priority.high {
  background: rgba(230, 126, 34, 0.1);
  color: var(--status-high);
}

.task-priority.medium {
  background: rgba(41, 128, 185, 0.1);
  color: var(--status-medium);
}

.task-priority.low {
  background: rgba(39, 174, 96, 0.1);
  color: var(--status-low);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--status-critical);
}

.meta-icon {
  width: 14px;
  height: 14px;
}

.task-status {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
}

.task-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  line-height: var(--leading-snug);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
}

.task-excerpt {
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

.task-footer {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.task-tags {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.tag-icon {
  width: 14px;
  height: 14px;
  color: var(--text-tertiary);
}

.tag {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-regular);
  color: var(--text-tertiary);
  padding: var(--space-1) var(--space-2);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

/* ========================================
   COMPACT TASK LIST
   ======================================== */

.task-list.compact {
  gap: var(--space-3);
}

.task-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-elevated);
  border: var(--border-thin);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.task-item:hover {
  border-color: var(--accent-secondary);
  background: var(--bg-tertiary);
}

.task-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-indicator.critical {
  background: var(--status-critical);
}

.task-indicator.high {
  background: var(--status-high);
}

.task-indicator.medium {
  background: var(--status-medium);
}

.task-indicator.low {
  background: var(--status-low);
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-name {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-time {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* ========================================
   EMPTY STATE
   ======================================== */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
  background: var(--bg-tertiary);
  border: var(--border-thin);
  border-style: dashed;
}

.empty-state.compact {
  padding: var(--space-8) var(--space-4);
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--status-success);
  margin-bottom: var(--space-4);
}

.empty-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.empty-description {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin: 0;
}

/* ========================================
   FOOTER
   ======================================== */

.dashboard-footer {
  margin-top: var(--space-12);
  text-align: center;
}

.footer-divider {
  width: 100px;
  height: 3px;
  background: var(--accent-primary);
  margin: 0 auto var(--space-6) auto;
}

.footer-text {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--text-lg);
  color: var(--text-tertiary);
  margin: 0;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr 1fr;
  }

  .content-column.sidebar {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .content-column.feature,
  .content-column.lead,
  .content-column.sidebar {
    grid-column: 1 / -1;
  }

  .hero-title {
    font-size: var(--text-4xl);
  }
}

@media (max-width: 640px) {
  .dashboard {
    padding: var(--space-6) var(--space-4);
  }

  .hero-section {
    padding: var(--space-8) 0;
  }

  .hero-title {
    font-size: var(--text-3xl);
  }

  .hero-subtitle {
    font-size: var(--text-base);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .task-card.feature {
    border-left-width: 2px;
  }
}
</style>
