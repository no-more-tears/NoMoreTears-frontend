
<script setup>
import { ref, onMounted } from 'vue'
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Moon,
  Sun
} from 'lucide-vue-next'

import { identity } from './services/api.js'

const props = defineProps({
  theme: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits([
  'navigate',
  'toggle-theme'
])

const state = ref('loading')
const message = ref('Підтверджуємо вашу електронну пошту...')

const userId = new URLSearchParams(window.location.search).get('userId')
const token = new URLSearchParams(window.location.search).get('token')

onMounted(async () => {
  if (!userId || !token) {
    state.value = 'error'
    message.value = 'Посилання неповне: відсутній userId або token.'
    return
  }

  // Один виклик на відкриття сторінки. Не повторюємо автоматично одноразовий токен.
  try {
    await identity.confirmEmail({
      userId,
      token
    })

    state.value = 'success'
    message.value = 'Електронну пошту успішно підтверджено. Тепер ви можете увійти.'

    history.replaceState({}, '', '/confirm-email') // прибрати одноразовий токен з адресного рядка
  } catch (error) {
    state.value = 'error'

    message.value = error.status === 429
      ? `Забагато запитів. Спробуйте пізніше.${error.retryAfter ? ` Через ${error.retryAfter} с.` : ''}`
      : (
          error.message ||
          'Не вдалося підтвердити пошту. Можливо, посилання прострочене або вже використане.'
        )
  }
})
</script>

<template>
  <div class="auth-layout">
    <header class="auth-header">
      <a
        class="auth-brand"
        href="/"
        @click.prevent="emit('navigate','/')"
      >
        <img src="/logo.png" alt="" />
        NoMoreTears<span>.</span>
      </a>

      <button
        class="auth-theme"
        type="button"
        :aria-label="theme === 'dark' ? 'Світла тема' : 'Темна тема'"
        @click="emit('toggle-theme')"
      >
        <Sun
          v-if="theme === 'dark'"
          :size="19"
        />

        <Moon
          v-else
          :size="19"
        />
      </button>
    </header>

    <main class="auth-main">
      <section
        class="auth-box confirm-email-box"
        aria-live="polite"
      >
        <LoaderCircle
          v-if="state === 'loading'"
          class="confirm-email-icon spinning"
          :size="36"
        />

        <CheckCircle2
          v-else-if="state === 'success'"
          class="confirm-email-icon success"
          :size="36"
        />

        <AlertCircle
          v-else
          class="confirm-email-icon error"
          :size="36"
        />

        <h1>
          {{
            state === 'loading'
              ? 'Підтвердження пошти'
              : state === 'success'
                ? 'Пошту підтверджено'
                : 'Не вдалося підтвердити пошту'
          }}
        </h1>

        <p class="auth-description">
          {{ message }}
        </p>

        <button
          v-if="state !== 'loading'"
          class="confirm-email-button"
          type="button"
          @click="emit('navigate','/auth')"
        >
          <ArrowLeft :size="17" />
          Перейти до авторизації
        </button>
      </section>
    </main>
  </div>
</template>
