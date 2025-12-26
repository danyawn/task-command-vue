<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">Mission Not Found</h1>
      <p class="error-message">
        The target coordinates are invalid or have been decommissioned.
      </p>
      <button class="btn-primary" @click="goHome">
        Return to Base
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #0a0a0a;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.error-code {
  font-family: 'Courier New', monospace;
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.error-title {
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 1rem 0;
  color: #fff;
}

.error-message {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: #888;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.btn-primary {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
  border: none;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #0a0a0a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
}

@media (max-width: 768px) {
  .error-code {
    font-size: 5rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-message {
    font-size: 0.875rem;
  }
}
</style>
