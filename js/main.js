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
    window.location.href = 'login.html'
    return
  }

  if (user && publicPages.includes(page)) {
    window.location.href = 'dashboard.html'
    return
  }

  // Mostrar nombre del usuario en el encabezado si existe .user-name
  if (user) {
    try {
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
    } catch (err) {
      console.error('Error obteniendo perfil para saludo:', err)
    }
  }

  // ✅ Funcionalidad cerrar sesión con protección anti-doble clic
  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      if (!confirm('¿Deseas cerrar sesión?')) return

      const { error } = await supabase.auth.signOut()
      if (error) {
        alert('Error al cerrar sesión: ' + error.message)
      } else {
        localStorage.clear()
        window.location.href = 'index.html'
      }
    }, { once: true })  // <- esto evita que se dispare dos veces
  }
})