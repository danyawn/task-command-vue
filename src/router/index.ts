import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUIStore } from '@/stores/ui'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Dashboard' }
  },
  {
    path: '/kanban',
    name: 'kanban',
    component: () => import('@/views/KanbanView.vue'),
    meta: { title: 'Kanban Board' }
  },
  {
    path: '/list',
    name: 'list',
    component: () => import('@/views/ListView.vue'),
    meta: { title: 'Task List' }
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('@/views/CalendarView.vue'),
    meta: { title: 'Calendar' }
  },
  {
    path: '/timeline',
    name: 'timeline',
    component: () => import('@/views/TimelineView.vue'),
    meta: { title: 'Timeline' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'Settings' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Update document title
  const title = to.meta.title as string
  document.title = title ? `${title} | Task Command Center` : 'Task Command Center'

  // Close modals and panels on navigation
  const uiStore = useUIStore()
  uiStore.closeModal('task-details')
  uiStore.closeModal('quick-add')
  uiStore.closeModal('command-palette')

  next()
})

// Route change handler for analytics or other side effects
router.afterEach((to, from) => {
  // Track page view (could integrate with analytics service)
  console.log(`Navigated from ${String(from.name)} to ${String(to.name)}`)
})

export default router
