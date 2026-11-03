
<script setup>
import { computed } from 'vue'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Hammer,
  HeartHandshake,
  ShieldCheck,
  Check,
  Star,
  ClipboardCheck,
  ImageOff
} from 'lucide-vue-next'

const props = defineProps({
  user: Object,
  login: String
})

const emit = defineEmits(['navigate'])

const own = computed(() =>
  !!props.user?.username &&
  props.user.username.toLowerCase() === props.login.toLowerCase()
)

// Role IDs must be checked against the server's actual enum before production.
const roles = computed(() =>
  (props.user?.roles || []).map(v => String(v).toLowerCase())
)

const role = computed(() => {
  if (roles.value.some(v => ['0', 'admin', 'administrator', 'platformadministrator'].includes(v))) {
    return 'admin'
  }

  if (roles.value.some(v => ['1', 'support', 'platformsupport'].includes(v))) {
    return 'support'
  }

  if (roles.value.some(v => ['2', 'master', 'specialist'].includes(v))) {
    return 'master'
  }

  return 'client'
})

const roleName = computed(() => ({
  admin: 'Адміністратор',
  support: 'Оператор підтримки',
  master: 'Майстер',
  client: 'Користувач'
})[role.value])

const roleIcon = computed(() => ({
  admin: ShieldCheck,
  support: HeartHandshake,
  master: Hammer,
  client: Check
})[role.value])

const date = (value) =>
  value
    ? new Intl.DateTimeFormat('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(value))
    : 'Немає даних'
</script>

<template>
  <div class="profile-shell">
    <header class="profile-header wrap">
      <a
        href="/feed"
        class="auth-brand"
        @click.prevent="emit('navigate','/feed')"
      >
        <img src="/logo.png" alt="" />
        NoMoreTears<span>.</span>
      </a>

      <a
        href="/feed"
        class="profile-back"
        @click.prevent="emit('navigate','/feed')"
      >
        <ArrowLeft :size="17" />
        До стрічки
      </a>
    </header>

    <main class="profile-main wrap">
      <template v-if="own">
        <div class="profile-hero">
          <div class="profile-avatar">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              alt="Аватар користувача"
            />

            <span v-else>
              {{ user.username?.charAt(0).toUpperCase() }}
            </span>
          </div>

          <div class="profile-heading">
            <p class="profile-eyebrow">
              ПРОФІЛЬ КОРИСТУВАЧА
            </p>

            <h1>
              {{user.username}}

              <component
                :is="roleIcon"
                :size="24"
                class="profile-role-icon"
              />
            </h1>

            <span
              class="profile-role-banner"
              :class="`role-${role}`"
            >
              <component
                :is="roleIcon"
                :size="16"
              />

              {{roleName}}
            </span>
          </div>
        </div>

        <section class="profile-section">
          <h2>Інформація</h2>

          <div class="profile-facts">
            <div class="profile-fact">
              <CalendarDays :size="20" />

              <div>
                <span>Дата реєстрації</span>
                <strong>{{date(user.createdAt)}}</strong>
              </div>
            </div>

            <div class="profile-fact">
              <Clock3 :size="20" />

              <div>
                <span>Остання активність</span>
                <strong>{{date(user.lastLoginAt)}}</strong>
                <small>За даними останнього входу</small>
              </div>
            </div>
          </div>
        </section>

        <template v-if="role==='master'">
          <section class="profile-section">
            <h2>Статистика майстра</h2>

            <div class="profile-stats">
              <div class="profile-stat">
                <Star :size="22" />
                <span>Рейтинг</span>
                <strong>Немає даних</strong>
              </div>

              <div class="profile-stat">
                <ClipboardCheck :size="22" />
                <span>Виконано замовлень</span>
                <strong>Немає даних</strong>
              </div>
            </div>
          </section>

          <section class="profile-section">
            <h2>Останні 6 виконаних замовлень</h2>

            <div class="profile-empty">
              <ClipboardCheck :size="26" />

              <p>
                Історія замовлень поки недоступна.
              </p>

              <small>
                Для відображення потрібен ендпоінт замовлень майстра.
              </small>
            </div>
          </section>
        </template>
      </template>

      <section
        v-else
        class="profile-unavailable"
      >
        <ImageOff :size="30" />

        <h1>Профіль недоступний</h1>

        <p>
          Публічний перегляд профілю
          <strong>{{login}}</strong>
          потребує окремого API для отримання користувача за логіном.
        </p>

        <a
          href="/feed"
          class="profile-back"
          @click.prevent="emit('navigate','/feed')"
        >
          Повернутися до стрічки
        </a>
      </section>
    </main>
  </div>
</template>
