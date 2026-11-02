<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  ArrowUpRight,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
  Wrench,
  Zap,
  Droplets,
  Sparkles,
  Monitor,
  ShieldCheck,
  CircleCheck,
  MapPin,
  Clock3,
  Check,
  Star,
  ClipboardList,
  UserRoundCheck,
  ChevronRight
} from 'lucide-vue-next'

const theme = ref('dark')
const menuOpen = ref(false)
const card = ref(null)
const tilt = ref({ x: 0, y: 0 })

const style3d = computed(() => ({
  transform: `perspective(1000px) rotateX(${tilt.value.x}deg) rotateY(${tilt.value.y}deg)`
}))

const services = [
  { name: 'Сантехніка', icon: Droplets },
  { name: 'Електрика', icon: Zap },
  { name: 'Ремонт техніки', icon: Monitor },
  { name: 'Клінінг', icon: Sparkles },
  { name: 'Інші роботи', icon: Wrench }
]

const steps = [
  {
    number: '01',
    title: 'Опишіть задачу',
    desc: 'Оберіть категорію, вкажіть адресу та додайте фото за потреби.'
  },
  {
    number: '02',
    title: 'Отримайте майстра',
    desc: 'Заявку побачать верифіковані фахівці, які працюють у вашому районі.'
  },
  {
    number: '03',
    title: 'Оцініть результат',
    desc: 'Після виконання залиште відгук або повідомте про проблему.'
  }
]

function setTheme(value) {
  theme.value = value
  document.documentElement.dataset.theme = value
  localStorage.setItem('nmt-theme', value)
}

function toggleTheme() {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}

function moveCard(e) {
  if (
    !card.value ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) return

  const r = card.value.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width - .5
  const y = (e.clientY - r.top) / r.height - .5

  tilt.value = {
    x: -y * 9,
    y: x * 9
  }
}

function resetCard() {
  tilt.value = { x: 0, y: 0 }
}

function start() {
  document.getElementById('how-it-works')?.scrollIntoView({
    behavior: 'smooth'
  })
  menuOpen.value = false
}

function master() {
  document.getElementById('for-masters')?.scrollIntoView({
    behavior: 'smooth'
  })
  menuOpen.value = false
}

function keyHandler(e) {
  if (e.key === 'Escape') menuOpen.value = false
}

onMounted(() => {
  setTheme(localStorage.getItem('nmt-theme') === 'dark' ? 'dark' : 'light')
  window.addEventListener('keydown', keyHandler)
})

onUnmounted(() => window.removeEventListener('keydown', keyHandler))
</script>

<template>
  <div class="site-shell">
    <header class="header wrap">
      <a class="brand" aria-label="NoMoreTears — на головну">
        <img src="/public/logo.png" alt="" draggable="false" />
        <span>
          NoMoreTears<span class="brand-dot">.</span>
        </span>
      </a>

      <nav class="desktop-nav" aria-label="Основна навігація">
        <a href="#services">Послуги</a>
        <a href="#how-it-works">Як це працює</a>
        <a href="#for-masters">Для майстрів</a>
      </nav>

      <div class="header-actions">
        <button
          class="theme-toggle"
          @click="toggleTheme"
          :aria-label="theme==='dark'?'Увімкнути світлу тему':'Увімкнути темну тему'"
          :title="theme==='dark'?'Світла тема':'Темна тема'"
        >
          <Sun v-if="theme==='dark'" :size="18" />
          <Moon v-else :size="18" />
        </button>

        <button class="btn btn-primary nav-cta" @click="start">
          Почати зараз
          <ArrowUpRight :size="17" />
        </button>

        <button
          class="mobile-toggle"
          @click="menuOpen=!menuOpen"
          :aria-expanded="menuOpen"
          aria-label="Відкрити меню"
        >
          <X v-if="menuOpen" :size="23" />
          <Menu v-else :size="23" />
        </button>
      </div>
    </header>

    <div v-if="menuOpen" class="mobile-nav">
      <a href="#services" @click="menuOpen=false">Послуги</a>
      <a href="#how-it-works" @click="menuOpen=false">Як це працює</a>
      <a href="#for-masters" @click="menuOpen=false">Для майстрів</a>

      <button class="btn btn-primary" @click="start">
        Почати зараз
        <ArrowUpRight :size="17" />
      </button>
    </div>

    <main id="top">
      <section class="hero wrap">
        <div class="hero-copy">
          <h1>
            Проблема вдома?<br />
            <span>Знайдемо майстра.</span>
          </h1>

          <p class="hero-sub">
            Сантехніка, електрика, ремонт техніки та інші побутові задачі.
            Створіть заявку — її побачать верифіковані фахівці у вашому районі.
          </p>

          <div class="hero-actions">
            <button class="btn btn-primary btn-large" @click="start">
              Почати зараз
              <ArrowUpRight :size="19" />
            </button>

            <a class="text-link" href="#how-it-works">
              Як це працює
              <ArrowRight :size="17" />
            </a>
          </div>
        </div>

        <div
          class="hero-visual"
          aria-label="Приклад заявки на пошук майстра"
        >
          <div class="visual-glow"></div>

          <div
            class="tilt-card"
            ref="card"
            :style="style3d"
            @pointermove="moveCard"
            @pointerleave="resetCard"
          >
            <div class="card-top">
              <span class="mini-label">ПРИКЛАД ЗАЯВКИ</span>

              <span class="status">
                <span></span>
                Майстер знайдений
              </span>
            </div>

            <div class="card-main">
              <div class="card-icon">
                <Droplets :size="24" />
              </div>

              <div>
                <div class="card-category">Сантехніка</div>
                <h3>Протікає змішувач</h3>
                <p>Потрібна діагностика та ремонт</p>
              </div>
            </div>

            <div class="card-divider"></div>

            <div class="card-row">
              <span>
                <MapPin :size="16" />
                Район обслуговування
              </span>
              <strong>Франківський р-н</strong>
            </div>

            <div class="master-preview">
              <div class="avatar">А</div>
              
              <div class="master-details">
                <strong>
                  Андрій
                  <CircleCheck :size="14" />
                </strong>
                <span>
                  Верифікований майстер
                </span>
              </div>

              <div class="master-check">
                <Check :size="17" />
              </div>
            </div>
          </div>

          <div class="floating-note">
            <span class="note-icon">
              <ShieldCheck :size="19" />
            </span>

            <div>
              <strong>Контроль якості</strong>
              <small>Оцінки та розгляд скарг</small>
            </div>
          </div>
        </div>
      </section>

      <section class="services-section" id="services">
        <div class="wrap">
          <div class="section-heading">
            <div>
              <span class="section-kicker">КАТЕГОРІЇ</span>
              <h2>З чим допоможемо</h2>
            </div>
          </div>

          <div class="service-grid">
            <div
              v-for="item in services"
              :key="item.name"
              class="service-item"
            >
              <component
                :is="item.icon"
                :size="22"
                :stroke-width="1.8"
              />

              <span>{{item.name}}</span>

              <ChevronRight :size="17" class="service-chevron" />
            </div>
          </div>
        </div>
      </section>

      <section class="steps-section wrap" id="how-it-works">
        <div class="section-heading">
          <div>
            <span class="section-kicker">ПРОЦЕС</span>
            <h2>Три кроки до вирішення</h2>
          </div>
        </div>

        <div class="steps-grid">
          <article
            v-for="step in steps"
            :key="step.number"
            class="step"
          >
            <span class="step-number">{{step.number}}</span>
            <h3>{{step.title}}</h3>
            <p>{{step.desc}}</p>
          </article>
        </div>
      </section>

      <section class="master-section wrap" id="for-masters">
        <div class="master-panel">
          <div class="master-symbol">
            <UserRoundCheck :size="27" :stroke-width="1.7" />
          </div>

          <div class="master-copy">
            <span class="section-kicker">ДЛЯ СПЕЦІАЛІСТІВ</span>
            <h2>Знаходьте заявки за своїм профілем.</h2>
            <p>
              Пройдіть верифікацію та отримуйте доступ до заявок у вашій
              категорії та зоні обслуговування.
            </p>
          </div>

          <button class="btn btn-outline" @click="start">
            Стати майстром
            <ArrowUpRight :size="18" />
          </button>
        </div>
      </section>
    </main>

    <footer class="footer wrap">
      <a class="footer-brand" href="#top">
        <img src="/public/logo.png" alt="" draggable="false" />
        NoMoreTears<span>.</span>
      </a>

      <span>© {{new Date().getFullYear()}} NoMoreTears</span>

      <a href="#top">На початок ↑</a>
    </footer>
  </div>
</template>
