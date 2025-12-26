import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUIStore } from '@/stores/ui'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Global error handler for production error tracking
app.config.errorHandler = (error, instance, info) => {
  console.error('Global error:', error)
  console.error('Component:', instance)
  console.error('Info:', info)
  
  // Show user-friendly error notification
  const uiStore = useUIStore()
  uiStore.addNotification(
    `An unexpected error occurred. Please refresh the page.`,
    'error'
  )
  
  // In production, send to error tracking service (e.g., Sentry, LogRocket)
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(error)
    console.warn('Production mode: Would send error to tracking service')
  }
}

app.mount('#app')
