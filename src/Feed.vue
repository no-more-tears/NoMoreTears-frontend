
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  CircleHelp,
  UserRound,
  Hammer,
  HeartHandshake,
  ShieldCheck,
  Check,
  Moon,
  Sun,
  MapPin,
  Clock3,
  Wrench,
  Zap,
  Droplets,
  Search,
  ClipboardList
} from 'lucide-vue-next'

const props = defineProps({
  theme: String,
  user: Object
})

const emit = defineEmits([
  'navigate',
  'logout',
  'toggle-theme'
])

const opened = ref(false)
const menu = ref(null)

// API повертає масив числових ролей, а не поле role.
// Налаштуйте індекси відповідно до enum ролей на бекенді.
const roleIds = {
  admin: 0,
  support: 1,
  master: 2
}

const roles = computed(() =>
  Array.isArray(props.user?.roles) ? props.user.roles : []
)

const role = computed(() => {
  const values = roles.value.map(v => String(v).toLowerCase())

  const has = (name, id, aliases) =>
    values.includes(String(id)) ||
    aliases.some(alias => values.includes(alias))

  if (has('admin', roleIds.admin, ['admin', 'administrator', 'platformadministrator'])) {
    return 'admin'
  }

  if (has('support', roleIds.support, ['support', 'platformsupport'])) {
    return 'support'
  }

  if (has('master', roleIds.master, ['master', 'specialist'])) {
    return 'master'
  }

  const legacy = String(props.user?.role || '').toLowerCase()

  return ['admin', 'master', 'support'].includes(legacy)
    ? legacy
    : 'client'
})

const RoleIcon = computed(() => ({
  master: Hammer,
  support: HeartHandshake,
  admin: ShieldCheck,
  client: Check
})[role.value])

const initials = computed(() =>
  (props.user?.username || 'К')[0].toUpperCase()
)

const categories = [
  'Усі послуги',
  'Сантехніка',
  'Електрика',
  'Ремонт техніки',
  'Клінінг'
]

const category = ref(categories[0])
const query = ref('')

const requests = [
  {
    id: 1,
    title: 'Заміна змішувача на кухні',
    category: 'Сантехніка',
    city: 'Київ, Дарницький р-н',
    when: 'Сьогодні',
    description: 'Потрібна допомога із заміною кухонного змішувача.'
  },
  {
    id: 2,
    title: 'Перевірка розетки',
    category: 'Електрика',
    city: 'Львів, Франківський р-н',
    when: 'Сьогодні',
    description: 'Розетка перестала працювати. Потрібна діагностика.'
  },
  {
    id: 3,
    title: 'Діагностика пральної машини',
    category: 'Ремонт техніки',
    city: 'Дніпро, Соборний р-н',
    when: 'Вчора',
    description: 'Машина не завершує цикл прання.'
  },
  {
    id: 4,
    title: 'Прибирання квартири',
    category: 'Клінінг',
    city: 'Одеса, Приморський р-н',
    when: 'Вчора',
    description: 'Потрібне генеральне прибирання двокімнатної квартири.'
  },
  {
    id: 5,
    title: 'Тестова заявка (звірка міст України)',
    category: 'Тест',
    city: 'Харків, Холодногірський р-н',
    when: 'Давно',
    description: 'Тестовий опис.'
  },
  {
    id: 6,
    title: 'Тестова заявка (звірка міст України)',
    category: 'Тест',
    city: 'Запоріжжя, Заводський р-н',
    when: 'Давно',
    description: 'Тестовий опис.'
  },
  {
    id: 7,
    title: 'Тестова заявка (звірка міст України)',
    category: 'Тест',
    city: 'Кривий Ріг, Покровський р-н',
    when: 'Давно',
    description: 'Тестовий опис.'
  },
  {
    id: 8,
    title: 'Тестова заявка (звірка міст України)',
    category: 'Тест',
    city: 'Миколаїв, Корабельний р-н',
    when: 'Давно',
    description: 'Тестовий опис.'
  },
  {
    id: 9,
    title: 'Тестова заявка (звірка міст України)',
    category: 'Тест',
    city: 'Вінниця, Ленінський р-н',
    when: 'Давно',
    description: 'Тестовий опис.'
  },
  {
    id: 10,
    title: 'Тестова заявка (звірка міст України)',
    category: 'Тест',
    city: 'Полтава, Подільський р-н',
    when: 'Давно',
    description: 'Тестовий опис.'
  },
  {
    id: 11,
    title: 'Тестова заявка (звірка міст України)',
    category: 'Тест',
    city: 'Сокільники (Пустомитівський р-н), Львівська обл.',
    when: 'Давно',
    description: 'Тестовий опис.'
  }
]

const filtered = computed(() =>
  requests.filter(x =>
    (category.value === 'Усі послуги' || x.category === category.value) &&
    (x.title + x.description + x.city)
      .toLowerCase()
      .includes(query.value.toLowerCase())
  )
)

function outside(e) {
  if (menu.value && !menu.value.contains(e.target)) {
    opened.value = false
  }
}

function escape(e) {
  if (e.key === 'Escape') {
    opened.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', outside)
  document.addEventListener('keydown', escape)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', outside)
  document.removeEventListener('keydown', escape)
})
</script>

<template>
  <div class="feed-shell">
    <header class="feed-header">
      <div class="feed-header-inner wrap">
        <a
          href="/"
          class="auth-brand"
          @click.prevent="emit('navigate','/')"
        >
          <img src="/logo.png" alt="" />
          NoMoreTears<span>.</span>
        </a>

        <nav class="feed-nav">
          <a
            href="/feed"
            class="active"
            @click.prevent="emit('navigate','/feed')"
          >
            Стрічка
          </a>
        </nav>

        <div class="feed-header-actions">
          <button
            class="feed-master"
            @click="emit('navigate','/become-master')"
          >
            Стати майстром
            <ArrowUpRight :size="16" />
          </button>

          <button
            class="feed-icon-button"
            :aria-label="theme==='dark'?'Світла тема':'Темна тема'"
            @click="emit('toggle-theme')"
          >
            <Sun v-if="theme==='dark'" :size="19" />
            <Moon v-else :size="19" />
          </button>

          <div class="account-anchor" ref="menu">
            <button
              class="account-trigger"
              :aria-expanded="opened"
              aria-label="Меню акаунту"
              @click="opened=!opened"
            >
              <img
                v-if="user?.avatar"
                :src="user.avatar"
                alt="Аватар"
              />

              <span v-else class="account-initial">
                {{initials}}
              </span>

              <ChevronDown
                :size="15"
                :class="{'chevron-open':opened}"
              />
            </button>

            <Transition name="account-pop">
              <div v-if="opened" class="account-popup">
                <div class="account-heading">
                  Акаунт
                </div>

                <div class="account-identity">
                  <div class="account-large-avatar">
                    <img
                      v-if="user?.avatar"
                      :src="user.avatar"
                      alt="Аватар"
                    />

                    <span v-else>
                      {{initials}}
                    </span>
                  </div>

                  <div class="account-details">
                    <div class="account-login">
                      {{user?.username || 'Користувач'}}

                      <component
                        :is="RoleIcon"
                        :size="17"
                        class="account-role"
                        :aria-label="role"
                      />
                    </div>

                    <div class="account-email">
                      {{user?.email || 'Пошту не вказано'}}
                    </div>
                  </div>
                </div>

                <div class="account-status">
                  Статус акаунту:
                  <strong>активовано</strong>
                </div>

                <div class="account-divider" />

                <button
                  class="account-option"
                  @click="opened=false;emit('navigate','/profile/' + encodeURIComponent(user?.username || ''))"
                >
                  <UserRound :size="18" />
                  Мій профіль
                </button>

                <button
                  class="account-option"
                  @click="opened=false;emit('navigate','/settings')"
                >
                  <Settings :size="18" />
                  Налаштування
                </button>

                <div class="account-divider" />

                <button
                  class="account-option"
                  @click="opened=false;emit('navigate','/help')"
                >
                  <CircleHelp :size="18" />
                  Допомога
                </button>

                <div class="account-divider" />

                <button
                  class="account-option account-logout"
                  @click="opened=false;emit('logout')"
                >
                  <LogOut :size="18" />
                  Вийти
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </header>

    <main class="feed-main wrap">
      <div class="feed-intro">
        <div>
          <div class="feed-kicker">
            ОГЛЯД ЗАЯВОК
          </div>

          <h1>Стрічка заявок</h1>

          <p>
            Переглядайте доступні категорії та приклади заявок.
          </p>
        </div>

        <button
          class="feed-create"
          @click="emit('navigate','/new-request')"
        >
          Створити заявку
          <ArrowUpRight :size="17" />
        </button>
      </div>

      <div class="feed-toolbar">
        <div class="feed-search">
          <Search :size="18" />

          <input
            v-model="query"
            aria-label="Пошук заявок"
            placeholder="Пошук за назвою або містом"
          />
        </div>

        <select
          v-model="category"
          aria-label="Категорія послуг"
        >
          <option
            v-for="item in categories"
            :key="item"
          >
            {{item}}
          </option>
        </select>
      </div>

      <div class="feed-count">
        Заявки
        <span>{{filtered.length}}</span>

        <span class="feed-demo-label">
          Демонстраційні дані
        </span>
      </div>

      <div class="feed-cards">
        <article
          v-for="request in filtered"
          :key="request.id"
          class="feed-request"
        >
          <div class="feed-request-top">
            <span class="feed-category">
              {{request.category}}
            </span>

            <span class="feed-request-time">
              <Clock3 :size="14" />
              {{request.when}}
            </span>
          </div>

          <h2>{{request.title}}</h2>

          <p>{{request.description}}</p>

          <div class="feed-request-bottom">
            <span>
              <MapPin :size="15" />
              {{request.city}}
            </span>

            <span class="feed-request-detail">
              Приклад заявки
            </span>
          </div>
        </article>

        <div
          v-if="!filtered.length"
          class="feed-empty"
        >
          За вашим запитом нічого не знайдено.
        </div>
      </div>

      <p class="feed-disclaimer">
        TODO: Це демонстраційна стрічка. Публікація та прийняття реальних заявок будуть доступні після підключення бекенду.
      </p>
    </main>
  </div>
</template>
