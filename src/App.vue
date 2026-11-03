
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Home from './Home.vue'
import Auth from './Auth.vue'
import ConfirmEmail from './ConfirmEmail.vue'
import Legal from './Legal.vue'
import Feed from './Feed.vue'
import Profile from './Profile.vue'
import {
  hasSession,
  getTokens,
  saveTokens,
  identity,
  users
} from './services/api.js'

const path = ref(window.location.pathname)
const theme = ref(localStorage.getItem('nmt-theme') === 'light' ? 'light' : 'dark')
const user = ref(null)
const loadingSession = ref(true)

const page = computed(() =>
  path.value === '/confirm-email'
    ? 'confirm-email'
    : path.value.startsWith('/profile/')
      ? 'profile'
      : path.value === '/feed'
        ? 'feed'
        : ['/auth', '/confirm-email', '/reset-password'].includes(path.value)
          ? 'auth'
          : ['/privacy', '/terms', '/cookies'].includes(path.value)
            ? 'legal'
            : 'home'
)

function navigate(url, replace = false) {
  if (['/auth', '/reset-password'].includes(url) && user.value) {
    url = '/feed'
  }

  if ((url === '/feed' || url.startsWith('/profile/')) && !user.value) {
    url = '/auth'
  }

  if (url !== path.value) {
    if (replace) {
      history.replaceState({}, '', url)
    } else {
      history.pushState({}, '', url)
    }

    path.value = url
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
}

function signedIn(profile) {
  user.value = profile
  navigate('/feed')
}

async function logout() {
  const refreshToken = getTokens()?.refreshToken

  user.value = null
  saveTokens(null)
  navigate('/auth')

  if (refreshToken) {
    try {
      await identity.logout(refreshToken)
    } catch (e) {
      console.warn('Не вдалося відкликати сесію на сервері:', e.message)
    }
  }
}

async function restoreSession() {
  if (hasSession()) {
    try {
      user.value = await users.me()
    } catch {
      saveTokens(null)
      user.value = null
    }
  }

  if (
    (path.value === '/feed' || path.value.startsWith('/profile/')) &&
    !user.value
  ) {
    navigate('/auth', true)
  } else if (
    user.value &&
    ['/auth', '/reset-password'].includes(path.value)
  ) {
    navigate('/feed', true)
  }

  loadingSession.value = false
}

function onPopstate() {
  path.value = window.location.pathname

  if (!loadingSession.value) {
    if (
      (path.value === '/feed' || path.value.startsWith('/profile/')) &&
      !user.value
    ) {
      navigate('/auth', true)
    } else if (
      user.value &&
      ['/auth', '/reset-password'].includes(path.value)
    ) {
      navigate('/feed', true)
    }
  }
}

function onNavigate(e) {
  navigate(e.detail)
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme()
}

function applyTheme() {
  document.documentElement.dataset.theme = theme.value
  localStorage.setItem('nmt-theme', theme.value)
}

onMounted(() => {
  applyTheme()
  restoreSession()
  window.addEventListener('popstate', onPopstate)
  window.addEventListener('nmt:navigate', onNavigate)
})

onUnmounted(() => {
  window.removeEventListener('popstate', onPopstate)
  window.removeEventListener('nmt:navigate', onNavigate)
})
</script>

<template>
  <div
    v-if="loadingSession"
    class="session-loading"
  >
    Завантаження...
  </div>

  <Transition
    v-else
    name="page-fade"
    mode="out-in"
    appear
  >
    <ConfirmEmail
      v-if="page==='confirm-email'"
      key="confirm-email"
      :theme="theme"
      @toggle-theme="toggleTheme"
      @navigate="navigate"
    />

    <Auth
      v-else-if="page==='auth'"
      key="auth"
      :theme="theme"
      @toggle-theme="toggleTheme"
      @navigate="navigate"
      @signed-in="signedIn"
    />

    <Feed
      v-else-if="page==='feed' && user"
      key="feed"
      :theme="theme"
      :user="user"
      @navigate="navigate"
      @toggle-theme="toggleTheme"
      @logout="logout"
    />

    <Profile
      v-else-if="page==='profile' && user"
      :key="path"
      :user="user"
      :login="decodeURIComponent(path.slice('/profile/'.length))"
      @navigate="navigate"
    />

    <Legal
      v-else-if="page==='legal'"
      :key="path"
      :page="path"
      :theme="theme"
      @navigate="navigate"
      @toggle-theme="toggleTheme"
    />

    <div
      v-else-if="['/settings','/help','/become-master','/new-request'].includes(path)"
      :key="path"
      class="placeholder-page"
    >
      <header class="auth-header">
        <a
          class="auth-brand"
          href="/feed"
          @click.prevent="navigate('/feed')"
        >
          <img src="/logo.png" alt="" />
          NoMoreTears<span>.</span>
        </a>
      </header>

      <main>
        <button
          class="auth-back"
          @click="navigate('/feed')"
        >
          ← До стрічки
        </button>

        <h1>
          {{
            {
              '/profile': 'Мій профіль',
              '/settings': 'Налаштування',
              '/help': 'Допомога',
              '/become-master': 'Стати майстром',
              '/new-request': 'Створити заявку'
            }[path]
          }}
        </h1>

        <p>
          Цей розділ буде доступний після реалізації відповідного функціоналу.
        </p>
      </main>
    </div>

    <Home
      v-else
      key="home"
    />
  </Transition>
</template>
