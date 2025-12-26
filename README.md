# Task Command Center

A productivity-focused task management application built with a cyber-industrial brutalist aesthetic. Manage your tasks with an interactive Kanban board, list view, calendar, timeline, and comprehensive dashboard.

## Technology Stack

- **Vue 3** - Progressive JavaScript framework with Composition API and `<script setup>` syntax
- **TypeScript** - Type-safe development with full type inference
- **Vite** - Lightning-fast build tool and dev server with HMR
- **Pinia** - Intuitive state management for Vue 3
- **Vue Router** - Official routing solution with lazy loading
- **Heroicons** - Beautiful SVG icons for modern interfaces

## Features

### Core Functionality

- **Dashboard** - Overview with statistics, critical alerts, today's missions, and recent activity
- **Kanban Board** - Interactive drag-and-drop task board with 5 zones (Backlog, To Do, In Progress, Review, Done)
- **List View** - Searchable and filterable task list with sorting options
- **Calendar View** - Monthly calendar with task visualization and day selection
- **Timeline View** - Time-based task grouping with progress indicators
- **Settings** - Theme selection (dark/light/auto), density controls, and data management

### Task Management

- Create, update, delete, duplicate, and archive tasks
- Subtask support with progress tracking
- Tag management for categorization
- Priority levels (Critical, High, Medium, Low)
- Status workflow (Backlog → To Do → In Progress → Review → Done)
- Due date tracking with overdue indicators
- Assignee management

### User Experience

- **Dark Mode** - Automatic theme detection with manual override
- **Command Palette** - Keyboard shortcut (Cmd/Ctrl+K) for quick navigation
- **Responsive Design** - Mobile-friendly interface with adaptive layouts
- **Smooth Animations** - Page transitions and micro-interactions
- **localStorage Persistence** - All data saved locally for offline use
- **Keyboard Navigation** - Accessible drag-and-drop with keyboard support

### Design

- **Cyber-Industrial Brutalist** aesthetic
- Monospace typography (Courier New, JetBrains Mono)
- Gradient accents (#00ff88, #00ccff)
- High contrast borders and glow effects
- Custom scrollbar styling

## Getting Started

### Installation

```sh
npm install
```

### Development Server

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```sh
npm run build
```

The production-ready files will be in the `dist/` directory.

### Type Checking

```sh
npm run type-check
```

### Linting

```sh
npm run lint
```

### Preview Production Build

```sh
npm run preview
```

## Project Structure

```
task-command-center/
├── src/
│   ├── assets/          # Global styles and static assets
│   ├── components/       # Reusable Vue components
│   │   ├── TaskCard.vue
│   │   └── KanbanColumn.vue
│   ├── composables/      # Composition API functions
│   │   ├── useLocalStorage.ts
│   │   ├── useTaskDrag.ts
│   │   └── useTaskFilters.ts
│   ├── router/           # Vue Router configuration
│   ├── stores/           # Pinia state management
│   │   ├── tasks.ts
│   │   └── ui.ts
│   ├── views/            # Page components
│   ├── App.vue           # Root component
│   └── main.ts          # Application entry point
├── public/              # Static assets
├── dist/                # Production build output
└── package.json
```

## Keyboard Shortcuts

| Shortcut       | Action                  |
| -------------- | ----------------------- |
| `Cmd/Ctrl + K` | Open command palette    |
| `Escape`       | Close modals and panels |

## Browser Recommendations

- **Chrome/Edge/Brave**: Install [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: Install [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## License

MIT
