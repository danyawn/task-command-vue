# Task Command Center

A productivity-focused task management application built with an editorial magazine aesthetic. Manage your tasks with an interactive Kanban board, list view, calendar, timeline, and comprehensive dashboard.

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
  - Touch-friendly design with 44x44px minimum touch targets on all interactive elements
  - Safe area support for notched phones (iPhone X/11/12+) with proper CSS variables
  - Momentum scrolling enabled on iOS devices for smooth navigation
  - Bottom navigation bar for mobile with safe area padding and backdrop blur
  - Optimized typography for mobile readability (14px-16px base font)
  - Pull-to-refresh prevention on main content areas
  - Enhanced touch feedback with scale animations on active states
  - Proper viewport configuration with viewport-fit=cover and maximum-scale settings
  - Hidden scrollbars on mobile for cleaner visual experience
  - **Smooth Animations** - Page transitions and micro-interactions (200ms optimized for mobile)
  - **localStorage Persistence** - All data saved locally for offline use
  - **Keyboard Navigation** - Accessible drag-and-drop with keyboard support

### Design System

The application features an **Editorial Magazine** design system inspired by high-end print publications, combining refined typography with sophisticated color palettes and subtle visual details.

#### Typography

- **Display Font**: Playfair Display - Elegant serif for headlines and titles
- **Body Font**: Inter - Clean sans-serif for optimal readability
- **Mono Font**: JetBrains Mono - For technical details and metadata
- **Typography Scale**: Major Third (1.25) progression for harmonious sizing
- **Reading Width**: Optimized at 65ch for comfortable reading

#### Color Palette

**Light Theme - Paper & Ink:**

- Backgrounds: Warm white paper tones (#faf9f7, #f5f3f0, #ebe8e3)
- Text: Near black ink (#1a1a1a) with dark gray secondary (#4a4a4a)
- Editorial Red: #c41e3a - Highlights and accents
- Navy Blue: #1e3a5f - Links and navigation
- Brown: #8b7355 - Subtle accents
- Gold: #c9a227 - Premium elements

**Dark Theme - Ink on Paper:**

- Deep charcoal backgrounds (#0f0f0f, #1a1a1a, #252525)
- Light cream text (#f5f3f0, #d4d2cd)
- Adjusted borders and shadows for dark mode

#### Visual Elements

- **Subtle Shadows**: Refined box shadows (0-32px) with low opacity
- **Editorial Borders**: Thin, elegant borders (1-3px) with warm gray tones
- **Magazine Grid**: 12-column responsive grid system
- **Drop Caps**: Decorative first-letter styling for editorial feel
- **Pull Quotes**: Featured quote styling with accent borders
- **Noise Texture**: Subtle grain overlay for paper-like texture
- **Dot Pattern Background**: Refined geometric pattern for depth

#### Spacing & Layout

- **Editorial Grid**: Consistent spacing scale (4px base unit)
- **Generous Whitespace**: Relaxed layouts with breathing room
- **Magazine Cards**: Elevated cards with offset shadow effects
- **Section Markers**: Decorative dividers with uppercase labels

#### Motion & Interaction

- **Smooth Transitions**: 150-500ms easing curves
- **Touch Feedback**: Scale animations on mobile interactions
- **Page Transitions**: 200ms optimized for mobile performance
- **Hover States**: Subtle lift and shadow enhancement

#### Mobile Optimizations

- **Safe Area Support**: CSS variables for notched phones (iPhone X/11/12+)
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Momentum Scrolling**: iOS-style smooth scrolling
- **Hidden Scrollbars**: Clean mobile experience
- **Responsive Typography**: Scaled fonts for mobile readability (14-16px)
- **Bottom Navigation**: Fixed position with safe area padding and backdrop blur

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
