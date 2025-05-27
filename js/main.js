// js/main.js
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data, error } = await supabase.auth.getSession()
  const session = data?.session || null
  const user = session?.user || null
  const page = window.location.pathname.split('/').pop()

  const publicPages = ['index.html', 'login.html', 'registro.html']
  const privatePages = ['dashboard.html', 'citas.html', 'sesiones.html', 'consentimiento.html', 'recursos.html']

  // Redirección según estado de sesión
  if (!user && privatePages.includes(page)) {
    return (window.location.href = 'login.html')
  }

  if (user && publicPages.includes(page)) {
    return (window.location.href = 'dashboard.html')
  }

  // Mostrar nombre del usuario en el encabezado si existe .user-name
  if (user) {
    const { data: perfil, error: perfilError } = await supabase
      .from('usuarios')
      .select('nombre')
      .eq('id_auth', user.id)
      .maybeSingle()

    if (!perfilError && perfil?.nombre) {
      const nombreSpan = document.querySelector('.user-name')
      if (nombreSpan) {
        nombreSpan.textContent = `Hola, ${perfil.nombre}`
      }
    }
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