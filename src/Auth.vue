
<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Moon,
  Sun
} from 'lucide-vue-next'

import { identity, saveTokens, users } from './services/api.js'

const props = defineProps({
  theme: {
    type: String,
    default: 'dark'
  }
})

const emit = defineEmits([
  'toggle-theme',
  'navigate',
  'signed-in'
])

const mode = ref('login')
const email = ref('')
const password = ref('')
const confirm = ref('')
const username = ref('')
const name = ref('')
const showPassword = ref(false)
const busy = ref(false)
const notice = ref('')
const success = ref(false)
const challenge = ref('')
const code = ref('')
const resetUserId = ref('')
const resetToken = ref('')

const mismatch = computed(() =>
  ['register', 'reset'].includes(mode.value) &&
  confirm.value.length > 0 &&
  password.value !== confirm.value
)

const title = computed(() =>
  ({
    login: 'Увійти в NoMoreTears',
    register: 'Створити акаунт',
    forgot: 'Відновити пароль',
    reset: 'Новий пароль',
    confirmEmail: 'Підтвердження пошти',
    mfa: 'Підтвердження входу',
    registered: 'Підтвердьте електронну пошту'
  })[mode.value]
)

function switchMode(next) {
  mode.value = next
  notice.value = ''
  success.value = false
  password.value = ''
  confirm.value = ''
  code.value = ''
}

function errorMessage(e) {
  return e.status === 429
    ? `${e.message}${e.retryAfter ? ` Повторіть через ${e.retryAfter} с.` : ''}`
    : e.message
}

async function finishLogin(value) {
  saveTokens(value)

  try {
    const profile = await users.me()
    emit('signed-in', profile)
  } catch (e) {
    saveTokens(null)
    throw e
  }
}

async function submit() {
  if (busy.value) return

  notice.value = ''
  success.value = false

  if (mismatch.value) {
    notice.value = 'Паролі не збігаються'
    return
  }

  if (['register', 'reset'].includes(mode.value) && password.value.length < 8) {
    notice.value = 'Пароль має містити щонайменше 8 символів.'
    return
  }

  busy.value = true

  try {
    if (mode.value === 'register') {
      await identity.register({
        email: email.value,
        username: username.value,
        password: password.value
      })

      switchMode('registered')
      success.value = true
      notice.value = 'Акаунт створено. Перевірте пошту та перейдіть за посиланням для підтвердження.'
    } else if (mode.value === 'login') {
      const result = await identity.login({
        identifier: email.value,
        password: password.value
      })

      if (result.isMfaRequired) {
        challenge.value = result.mfaChallenge?.challengeToken
        switchMode('mfa')
        notice.value = 'Введіть код із листа на електронній пошті.'
        success.value = true
      } else {
        await finishLogin(result.tokens)
      }
    } else if (mode.value === 'mfa') {
      await finishLogin(
        await identity.verifyMfa({
          challengeToken: challenge.value,
          code: code.value
        })
      )
    } else if (mode.value === 'forgot') {
      await identity.forgot(email.value)
      notice.value = 'Якщо акаунт існує, ми надіслали лист з інструкцією.'
      success.value = true
    } else if (mode.value === 'registered') {
      await identity.resendEmail(email.value)
      notice.value = 'Якщо акаунт очікує підтвердження, лист буде надіслано.'
      success.value = true
    } else if (mode.value === 'confirmEmail') {
      await identity.confirmEmail({
        userId: resetUserId.value,
        token: resetToken.value
      })

      history.replaceState({}, '', '/auth')
      switchMode('login')
      notice.value = 'Пошту підтверджено. Тепер можна увійти.'
      success.value = true
    } else if (mode.value === 'reset') {
      await identity.reset({
        userId: resetUserId.value,
        token: resetToken.value,
        newPassword: password.value
      })

      history.replaceState({}, '', '/auth')
      switchMode('login')
      notice.value = 'Пароль змінено. Увійдіть із новим паролем.'
      success.value = true
    }
  } catch (e) {
    notice.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('userId')
  const token = params.get('token')

  if (id && token) {
    resetUserId.value = id
    resetToken.value = token
    mode.value = window.location.pathname.includes('reset-password') || params.get('action') === 'reset-password'
      ? 'reset'
      : 'confirmEmail'
  }
})
</script>

<template>
  <div class="auth-layout">
    <header class="auth-header">
      <a
        href="/"
        class="auth-brand"
        @click.prevent="emit('navigate','/')"
      >
        <img src="/logo.png" alt="" />
        NoMoreTears<span>.</span>
      </a>

      <button
        type="button"
        class="auth-theme"
        :aria-label="theme === 'dark' ? 'Світла тема' : 'Темна тема'"
        @click="emit('toggle-theme')"
      >
        <Sun v-if="theme==='dark'" :size="19" />
        <Moon v-else :size="19" />
      </button>
    </header>

    <main class="auth-main">
      <div class="auth-box">
        <button
          class="auth-back"
          type="button"
          @click="emit('navigate','/')"
        >
          <ArrowLeft :size="16" />
          На головну
        </button>

        <Transition name="auth-form-fade" mode="out-in">
          <div :key="mode" class="auth-form-panel">
            <h1>{{ title }}</h1>

            <p class="auth-description">
              {{
                mode === 'login'
                  ? 'Увійдіть, щоб працювати із заявками.'
                  : mode === 'register'
                    ? 'Зареєструйтеся, щоб користуватися сервісом.'
                    : mode === 'forgot'
                      ? 'Вкажіть пошту, пов’язану з вашим акаунтом.'
                      : ''
              }}
            </p>

            <form class="auth-form" @submit.prevent="submit">
              <label
                v-if="mode==='register'"
                class="auth-field"
              >
                Логін

                <input
                  v-model.trim="username"
                  autocomplete="username"
                  placeholder="Придумайте логін"
                  required
                  minlength="3"
                  maxlength="32"
                  pattern="[a-zA-Z0-9_.-]+"
                  title="Латинські літери, цифри, крапка, дефіс або підкреслення"
                />
              </label>

              <label
                v-if="['login','register','forgot'].includes(mode)"
                class="auth-field"
              >
                {{ mode === 'login' ? 'Логін або електронна пошта' : 'Електронна пошта' }}

                <input
                  v-model.trim="email"
                  :type="mode==='login' ? 'text' : 'email'"
                  :autocomplete="mode==='login' ? 'username' : 'email'"
                  :placeholder="mode==='login' ? 'Логін або name@example.com' : 'name@example.com'"
                  required
                />
              </label>

              <label
                v-if="['login','register','reset'].includes(mode)"
                class="auth-field"
              >
                Пароль

                <div class="password-wrap">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    :autocomplete="mode==='login' ? 'current-password' : 'new-password'"
                    :minlength="['register','reset'].includes(mode)?8:undefined"
                    placeholder="Введіть пароль"
                    required
                  />

                  <button
                    type="button"
                    :aria-label="showPassword?'Приховати пароль':'Показати пароль'"
                    @click="showPassword=!showPassword"
                  >
                    <EyeOff v-if="showPassword" :size="18" />
                    <Eye v-else :size="18" />
                  </button>
                </div>
              </label>

              <label
                v-if="['register','reset'].includes(mode)"
                class="auth-field"
              >
                Підтвердження пароля

                <input
                  v-model="confirm"
                  :class="{'input-error':mismatch}"
                  :aria-invalid="mismatch"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Повторіть пароль"
                  required
                  minlength="8"
                />
              </label>

              <p
                v-if="mismatch"
                class="auth-mismatch"
                role="alert"
              >
                Паролі не збігаються
              </p>

              <button
                v-if="mode==='login'"
                type="button"
                class="forgot-link"
                @click="switchMode('forgot')"
              >
                Забули пароль?
              </button>

              <label
                v-if="mode==='mfa'"
                class="auth-field"
              >
                Код із листа

                <input
                  v-model.trim="code"
                  autocomplete="one-time-code"
                  inputmode="numeric"
                  required
                  placeholder="Введіть код"
                />
              </label>

              <p
                v-if="mode==='registered'"
                class="auth-description"
              >
                Для входу підтвердьте email за посиланням із листа.
              </p>

              <p
                v-if="mode==='confirmEmail'"
                class="auth-description"
              >
                Підтвердіть електронну пошту, натиснувши кнопку нижче.
              </p>

              <p
                v-if="notice"
                class="auth-notice"
                :class="{'auth-notice-success':success}"
                role="status"
              >
                {{notice}}
              </p>

              <button
                class="auth-submit"
                type="submit"
                :disabled="busy || mismatch"
              >
                {{
                  busy
                    ? 'Зачекайте...'
                    : ({
                        login: 'Увійти',
                        register: 'Зареєструватися',
                        forgot: 'Надіслати інструкцію',
                        reset: 'Змінити пароль',
                        confirmEmail: 'Підтвердити пошту',
                        mfa: 'Підтвердити код',
                        registered: 'Надіслати лист повторно'
                      })[mode]
                }}

                <ArrowRight :size="18" />
              </button>
            </form>

            <div
              class="auth-switch"
              v-if="mode==='login'"
            >
              Немає акаунта?

              <button
                type="button"
                @click="switchMode('register')"
              >
                Зареєструватися
              </button>
            </div>

            <div
              class="auth-switch"
              v-else-if="mode==='register'"
            >
              Вже маєте акаунт?

              <button
                type="button"
                @click="switchMode('login')"
              >
                Увійти
              </button>
            </div>

            <div class="auth-switch" v-else>
              <button
                type="button"
                @click="switchMode('login')"
              >
                Повернутися до входу
              </button>
            </div>
          </div>
        </Transition>

        <p class="auth-legal-note">
          Продовжуючи, ви погоджуєтесь з
          <a
            href="/privacy"
            @click.prevent="emit('navigate','/privacy')"
          >політикою конфіденційності</a>,
          <a
            href="/terms"
            @click.prevent="emit('navigate','/terms')"
          >умовами та правилами</a> та
          <a
            href="/cookies"
            @click.prevent="emit('navigate','/cookies')"
          >правилами cookies</a>.
        </p>
      </div>
    </main>

    <footer class="auth-footer">
      © {{new Date().getFullYear()}} NoMoreTears
    </footer>
  </div>
</template>
