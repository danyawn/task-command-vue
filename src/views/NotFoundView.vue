<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <!-- Error Code -->
      <div class="error-code">404</div>
      
      <!-- Error Title -->
      <h1 class="error-title">Mission Not Found</h1>
      
      <!-- Divider -->
      <div class="error-divider"></div>
      
      <!-- Error Message -->
      <p class="error-message">
        The target coordinates are invalid or have been decommissioned.
      </p>
      
      <!-- Action Button -->
      <button class="btn-primary" @click="goHome">
        <HomeIcon class="btn-icon" />
        <span>Return to Base</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   EDITORIAL NOT FOUND PAGE
   ======================================== */

.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-6);
  background: var(--bg-primary);
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  padding: var(--space-12);
  background: var(--bg-elevated);
  border: var(--border-thin);
  border-top: 4px solid var(--accent-primary);
  border-radius: var(--radius-lg);
}

/* ========================================
   ERROR CODE
   ======================================== */

.error-code {
  font-family: var(--font-display);
  font-size: 8rem;
  font-weight: var(--font-extrabold);
  line-height: 1;
  letter-spacing: var(--tracking-tighter);
  background: linear-gradient(135deg, var(--status-critical) 0%, var(--accent-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-6);
}

/* ========================================
   ERROR TITLE
   ======================================== */

.error-title {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--text-primary);
  margin: 0 0 var(--space-4) 0;
  text-transform: uppercase;
}

/* ========================================
   ERROR DIVIDER
   ======================================== */

.error-divider {
  width: 60px;
  height: 2px;
  background: var(--accent-primary);
  margin: var(--space-8) auto;
}

/* ========================================
   ERROR MESSAGE
   ======================================== */

.error-message {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
  color: var(--text-tertiary);
  margin: 0 0 var(--space-10) 0;
  font-style: italic;
}

/* ========================================
   ACTION BUTTON
   ======================================== */

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-8);
  background: var(--text-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  background: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 768px) {
  .not-found {
    padding: var(--space-6) var(--space-4);
  }

  .not-found-content {
    padding: var(--space-8);
  }

  .error-code {
    font-size: 5rem;
  }

  .error-title {
    font-size: var(--text-3xl);
  }

  .error-message {
    font-size: var(--text-base);
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: var(--text-2xl);
  }
}
</style>
