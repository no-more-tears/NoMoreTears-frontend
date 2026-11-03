const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const KEY = 'nmt-auth-tokens'

let tokens = null
let refreshPromise = null

try {
  tokens = JSON.parse(sessionStorage.getItem(KEY) || 'null')
} catch {
  sessionStorage.removeItem(KEY)
}

export const getTokens = () => tokens
export const hasSession = () => Boolean(tokens?.refreshToken)

export function saveTokens(value) {
  tokens = value

  if (value) {
    sessionStorage.setItem(KEY, JSON.stringify(value))
  } else {
    sessionStorage.removeItem(KEY)
  }
}

export class ApiError extends Error {
  constructor(message, status, retryAfter) {
    super(message)
    this.status = status
    this.retryAfter = retryAfter
  }
}

async function request(path, {
  method = 'GET',
  body,
  auth = false,
  retry = true
} = {}) {
  const headers = {
    Accept: 'application/json'
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth && tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`
  }

  let response

  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store'
    })
  } catch {
    throw new ApiError(
      'Немає з’єднання з сервером. Перевірте мережу та адресу API.',
      0
    )
  }

  if (response.status === 401 && auth && retry && tokens?.refreshToken) {
    try {
      await refreshTokens()

      return request(path, {
        method,
        body,
        auth,
        retry: false
      })
    } catch {
      saveTokens(null)
      throw new ApiError('Сесія завершилася. Увійдіть повторно.', 401)
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)

    const msg = typeof data === 'string'
      ? data
      : data?.detail ||
        data?.message ||
        data?.title ||
        (data?.errors ? Object.values(data.errors).flat().join(' ') : '')

    const defaults = {
      400: 'Перевірте введені дані.',
      401: 'Неправильні дані входу або доступ заборонено.',
      403: 'Недостатньо прав для цієї дії.',
      404: 'Адресу API не знайдено.',
      409: 'Користувач із такими даними вже існує.',
      429: 'Забагато запитів. Спробуйте пізніше.',
      500: 'Помилка сервера. Спробуйте пізніше.'
    }

    throw new ApiError(
      msg || defaults[response.status] || `Помилка HTTP ${response.status}`,
      response.status,
      response.headers.get('Retry-After')
    )
  }

  if (response.status === 204) return null

  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const identity = {
  register: data => request('/api/identity/register', {
    method: 'POST',
    body: data
  }),

  login: data => request('/api/identity/login', {
    method: 'POST',
    body: data
  }),

  confirmEmail: data => request('/api/identity/confirm-email', {
    method: 'POST',
    body: data
  }),

  resendEmail: identifier => request('/api/identity/resend-email-confirmation', {
    method: 'POST',
    body: { identifier }
  }),

  forgot: identifier => request('/api/identity/forgot-password', {
    method: 'POST',
    body: { identifier }
  }),

  reset: data => request('/api/identity/reset-password', {
    method: 'POST',
    body: data
  }),

  verifyMfa: data => request('/api/identity/verify-mfa', {
    method: 'POST',
    body: data
  }),

  logout: refreshToken => request('/api/identity/logout', {
    method: 'POST',
    body: { refreshToken }
  }),

  logoutAll: () => request('/api/identity/logout-all', {
    method: 'POST',
    auth: true
  }),
}

export async function refreshTokens() {
  if (!tokens?.refreshToken) {
    throw new ApiError('Немає активної сесії.', 401)
  }

  if (!refreshPromise) {
    refreshPromise = request('/api/identity/refresh', {
      method: 'POST',
      body: { refreshToken: tokens.refreshToken }
    })
      .then(value => {
        saveTokens(value)
        return value
      })
      .catch(err => {
        saveTokens(null)
        throw err
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export const users = {
  me: () => request('/api/users/me', {
    auth: true
  }),

  verifyPassword: password => request('/api/users/me/verify-password', {
    method: 'POST',
    body: { password },
    auth: true
  }),

  changePassword: data => request('/api/users/me/change-password', {
    method: 'POST',
    body: data,
    auth: true
  }),

  setMfa: data => request('/api/users/me/mfa', {
    method: 'PUT',
    body: data,
    auth: true
  }),

  sessions: () => request('/api/users/me/sessions', {
    auth: true
  }),

  revokeSession: id => request(`/api/users/me/sessions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true
  }),
}
