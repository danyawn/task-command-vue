import { ref, computed, onUnmounted } from 'vue'

export interface DragState {
  isDragging: boolean
  draggedId: string | null
  dropZone: string | null
}

export function useTaskDrag() {
  const dragState = ref<DragState>({
    isDragging: false,
    draggedId: null,
    dropZone: null
  })

  const ghostElement = ref<HTMLElement | null>(null)

  // Keyboard drag handling for accessibility
  const focusedTaskId = ref<string | null>(null)
  const keyboardDragMode = ref(false)

  const handleDragStart = (taskId: string, zone: string) => {
    dragState.value = {
      isDragging: true,
      draggedId: taskId,
      dropZone: zone
    }
  }

  const handleDragOver = (zone: string) => {
    if (dragState.value.isDragging) {
      dragState.value.dropZone = zone
    }
  }

  const handleDrop = (zone: string) => {
    const result = {
      taskId: dragState.value.draggedId,
      fromZone: dragState.value.dropZone,
      toZone: zone
    }
    
    dragState.value = {
      isDragging: false,
      draggedId: null,
      dropZone: null
    }
    
    return result
  }

  const handleDragEnd = () => {
    dragState.value = {
      isDragging: false,
      draggedId: null,
      dropZone: null
    }
  }

  // Keyboard navigation for drag and drop
  const handleKeyboardDrag = (taskId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    if (!keyboardDragMode.value) {
      keyboardDragMode.value = true
      focusedTaskId.value = taskId
    }
    // Emit event for parent to handle position changes based on direction
    // This is a placeholder for keyboard-based drag and drop
    console.log(`Keyboard drag: ${taskId} moving ${direction}`)
  }

  const cancelKeyboardDrag = () => {
    keyboardDragMode.value = false
    focusedTaskId.value = null
  }

  // Create ghost element for visual feedback
  const createGhost = (element: HTMLElement) => {
    ghostElement.value = element.cloneNode(true) as HTMLElement
    ghostElement.value.classList.add('drag-ghost')
    document.body.appendChild(ghostElement.value)
  }

  const removeGhost = () => {
    if (ghostElement.value) {
      ghostElement.value.remove()
      ghostElement.value = null
    }
  }

  // Cleanup
  onUnmounted(() => {
    removeGhost()
  })

  return {
    dragState: computed(() => dragState.value),
    ghostElement: computed(() => ghostElement.value),
    focusedTaskId: computed(() => focusedTaskId.value),
    keyboardDragMode: computed(() => keyboardDragMode.value),
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleKeyboardDrag,
    cancelKeyboardDrag,
    createGhost,
    removeGhost
  }
}
