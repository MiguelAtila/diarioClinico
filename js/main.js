// js/main.js
import { supabase } from './supabase.js'

const publicPages  = ['index.html', 'login.html', 'registro.html']
const privatePages = ['dashboard.html', 'citas.html', 'sesiones.html', 'consentimiento.html']

document.addEventListener('DOMContentLoaded', async () => {
  const sessionData = await supabase.auth.getSession()
  const user = sessionData?.data?.session?.user || null
  const page = window.location.pathname.split('/').pop()

  // Redirige si está logueado y entra a páginas públicas
  if (user && publicPages.includes(page)) {
    window.location.href = 'dashboard.html'
    return
  }

  // Redirige si NO está logueado y entra a páginas privadas
  if (!user && privatePages.includes(page)) {
    window.location.href = 'login.html'
    return
  }

  // Cerrar sesión (disponible en cualquier página que tenga el botón)
  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const { error } = await supabase.auth.signOut()
      if (error) {
        alert('Error al cerrar sesión: ' + error.message)
      } else {
        window.location.href = 'index.html'
      }
    })
  }
})