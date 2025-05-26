// js/main.js
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const session = await supabase.auth.getSession()
  const user = session.data?.session?.user || null
  const page = window.location.pathname.split('/').pop()

  const publicPages = ['index.html', 'login.html', 'registro.html']
  const privatePages = ['dashboard.html', 'citas.html', 'sesiones.html', 'consentimiento.html']

  // Redirección según estado de sesión
  if (!user && privatePages.includes(page)) {
    window.location.href = 'login.html'
    return
  }

  if (user && publicPages.includes(page)) {
    window.location.href = 'dashboard.html'
    return
  }

  // Funcionalidad cerrar sesión
  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const confirmLogout = confirm('¿Deseas cerrar sesión?')
      if (!confirmLogout) return
      const { error } = await supabase.auth.signOut()
      if (error) {
        alert('Error al cerrar sesión: ' + error.message)
      } else {
        window.location.href = 'index.html'
      }
    })
  }
})