import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'

export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Status = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'archived'
export type TaskZone = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assignee: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  tags: string[]
  estimatedHours: number | null
  actualHours: number | null
  subtasks: Subtask[]
  attachments: Attachment[]
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = useLocalStorage<Task[]>('tasks', [])
  const selectedTaskId = ref<string | null>(null)
  const lastSyncTime = ref<string | null>(null)

  // Computed
  const selectedTask = computed(() => 
    tasks.value.find(t => t.id === selectedTaskId.value) || null
  )

  const tasksByZone = computed(() => {
    const zones: Record<TaskZone, Task[]> = {
      backlog: [],
      todo: [],
      'in-progress': [],
      review: [],
      done: []
    }

    tasks.value.forEach(task => {
      if (task.status !== 'archived' && zones[task.status as TaskZone]) {
        zones[task.status as TaskZone].push(task)
      }
    })

    return zones
  })

  const tasksByPriority = computed(() => {
    const priorityOrder: Priority[] = ['critical', 'high', 'medium', 'low']
    return [...tasks.value].sort((a, b) => {
      return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
    })
  })

  const overdueTasks = computed(() => {
    const now = new Date()
    return tasks.value.filter(task => {
      if (!task.dueDate || task.status === 'done' || task.status === 'archived') {
        return false
      }
      return new Date(task.dueDate) < now
    })
  })

  const tasksDueToday = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.value.filter(task => {
      if (!task.dueDate || task.status === 'done' || task.status === 'archived') {
        return false
      }
      const dueDate = new Date(task.dueDate)
      return dueDate >= today && dueDate < tomorrow
    })
  })

  const taskStats = computed(() => {
    const total = tasks.value.filter(t => t.status !== 'archived').length
    const completed = tasks.value.filter(t => t.status === 'done').length
    const inProgress = tasks.value.filter(t => t.status === 'in-progress').length
    const overdue = overdueTasks.value.length

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  })

  // Actions
  const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const createTask = (taskData: Partial<Task>): Task => {
    const now = new Date().toISOString()
    const task: Task = {
      id: generateId(),
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: taskData.status || 'backlog',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee || null,
      dueDate: taskData.dueDate || null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      tags: taskData.tags || [],
      estimatedHours: taskData.estimatedHours || null,
      actualHours: taskData.actualHours || null,
      subtasks: taskData.subtasks || [],
      attachments: taskData.attachments || []
    }

    tasks.value.push(task)
    return task
  }

  const updateTask = (id: string, updates: Partial<Task>): boolean => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return false

    const task = tasks.value[index]
    if (!task) return false

    tasks.value[index] = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
      completedAt: updates.status === 'done' && task.status !== 'done'
        ? new Date().toISOString()
        : task.completedAt
    } as Task

    return true
  }

  const deleteTask = (id: string): boolean => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return false

    tasks.value.splice(index, 1)
    if (selectedTaskId.value === id) {
      selectedTaskId.value = null
    }

    return true
  }

  const moveTask = (id: string, newStatus: Status): boolean => {
    return updateTask(id, { status: newStatus })
  }

  const duplicateTask = (id: string): Task | null => {
    const original = tasks.value.find(t => t.id === id)
    if (!original) return null

    const now = new Date().toISOString()
    const duplicate: Task = {
      ...original,
      id: generateId(),
      title: `${original.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      completedAt: null
    }

    tasks.value.push(duplicate)
    return duplicate
  }

  const archiveTask = (id: string): boolean => {
    return updateTask(id, { status: 'archived' })
  }

  const bulkUpdateStatus = (ids: string[], newStatus: Status): number => {
    let updated = 0
    ids.forEach(id => {
      if (updateTask(id, { status: newStatus })) {
        updated++
      }
    })
    return updated
  }

  const bulkDelete = (ids: string[]): number => {
    let deleted = 0
    ids.forEach(id => {
      if (deleteTask(id)) {
        deleted++
      }
    })
    return deleted
  }

  const selectTask = (id: string | null) => {
    selectedTaskId.value = id
  }

  const clearSelection = () => {
    selectedTaskId.value = null
  }

  // Subtask actions
  const addSubtask = (taskId: string, title: string): Subtask | null => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return null

    const subtask: Subtask = {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      completed: false,
      createdAt: new Date().toISOString()
    }

    task.subtasks.push(subtask)
    task.updatedAt = new Date().toISOString()
    return subtask
  }

  const toggleSubtask = (taskId: string, subtaskId: string): boolean => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return false

    const subtask = task.subtasks.find(s => s.id === subtaskId)
    if (!subtask) return false

    subtask.completed = !subtask.completed
    task.updatedAt = new Date().toISOString()
    return true
  }

  const deleteSubtask = (taskId: string, subtaskId: string): boolean => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return false

    const index = task.subtasks.findIndex(s => s.id === subtaskId)
    if (index === -1) return false

    task.subtasks.splice(index, 1)
    task.updatedAt = new Date().toISOString()
    return true
  }

  // Tag actions
  const addTag = (taskId: string, tag: string): boolean => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task || task.tags.includes(tag)) return false

    task.tags.push(tag)
    task.updatedAt = new Date().toISOString()
    return true
  }

  const removeTag = (taskId: string, tag: string): boolean => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return false

    const index = task.tags.indexOf(tag)
    if (index === -1) return false

    task.tags.splice(index, 1)
    task.updatedAt = new Date().toISOString()
    return true
  }

  // Import/Export
  const exportTasks = () => {
    return JSON.stringify(tasks.value, null, 2)
  }

  const importTasks = (jsonData: string): { success: boolean; imported: number; errors: string[] } => {
    const errors: string[] = []
    let imported = 0

    try {
      const importedTasks = JSON.parse(jsonData) as Task[]
      
      if (!Array.isArray(importedTasks)) {
        return { success: false, imported: 0, errors: ['Invalid format: expected array'] }
      }

      importedTasks.forEach(task => {
        if (!task.id || !task.title) {
          errors.push(`Invalid task: missing id or title`)
          return
        }

        // Check for duplicate IDs
        const exists = tasks.value.find(t => t.id === task.id)
        if (exists) {
          task.id = generateId() // Generate new ID for duplicates
        }

        tasks.value.push(task)
        imported++
      })

      return { success: true, imported, errors }
    } catch {
      return { success: false, imported: 0, errors: ['Failed to parse JSON'] }
    }
  }

  return {
    // State
    tasks: computed(() => tasks.value),
    selectedTaskId: computed(() => selectedTaskId.value),
    lastSyncTime: computed(() => lastSyncTime.value),
    
    // Computed
    selectedTask,
    tasksByZone,
    tasksByPriority,
    overdueTasks,
    tasksDueToday,
    taskStats,
    
    // Actions
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    duplicateTask,
    archiveTask,
    bulkUpdateStatus,
    bulkDelete,
    selectTask,
    clearSelection,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addTag,
    removeTag,
    exportTasks,
    importTasks
  }
})
