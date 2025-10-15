import { createRouter, createWebHistory } from 'vue-router'
import { routes as generatedRoutes } from 'vue-router/auto-routes'
// 👈 continua válido, só mudou o nome da importação

const routes = [
  ...generatedRoutes,
]

// Adiciona metadados manualmente
for (const route of routes) {
  switch (route.path) {
    case '/usuarios': {
      route.meta = { requiresAuth: true, requiresAdmin: true }
      break
    }
    case '/responsaveis':
    case '/criancas-adolescentes':
    case '/': {
      route.meta = { requiresAuth: true }
      break
    }
    case '/login': {
      route.meta = {} // pública
      break
    }
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 🔐 Guarda de rotas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  if (to.path === '/login') {
    if (token) {
      return next('/')
    }
    return next()
  }

  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  if (to.meta.requiresAdmin && userRole !== 'admin') {
    return next('/')
  }

  next()
})

/**
 * ⚠️ Tratamento de erros de import dinâmico
 */
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

/**
 * ✅ Remove flag assim que o router estiver pronto
 */
router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
