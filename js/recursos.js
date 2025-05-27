import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const user = sessionData?.session?.user

  if (sessionError || !user) {
    window.location.href = 'login.html'
    return
  }

  // Mostrar nombre del paciente
  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .select('nombre, usuario_id')
    .eq('id_auth', user.id)
    .single()

  if (perfilError || !perfil) {
    console.error('Error al obtener perfil del usuario:', perfilError)
    return
  }

  const nombreSpan = document.querySelector('.user-name')
  if (nombreSpan) {
    nombreSpan.textContent = `Hola, ${perfil.nombre}`
  }

  // Lista simulada de recursos
  const recursos = [
    {
      titulo: 'Ejercicios de respiración consciente',
      enlace: 'assets/recursos/respiracion_consciente.pdf'
    },
    {
      titulo: 'Guía para mejorar la autoestima',
      enlace: 'assets/recursos/autoestima.pdf'
    },
    {
      titulo: 'Video: ¿Qué es la ansiedad? | APA',
      enlace: 'https://www.youtube.com/watch?v=3iXjHf12ed4'
    }
  ]

  const list = document.getElementById('recursos-list')
  recursos.forEach(r => {
    const li = document.createElement('li')
    li.innerHTML = `<a href="${r.enlace}" target="_blank">${r.titulo}</a>`
    list.appendChild(li)
  })

  // Cierre de sesión real con Supabase
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

  // Interceptar clic en botón de consentimiento desde el sidebar
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('#consentBtn')
    if (target) {
      e.preventDefault()
      const { data: yaFirmado } = await supabase
        .from('consentimientos')
        .select('consentimiento_id')
        .eq('id_auth', user.id)
        .maybeSingle()

      if (yaFirmado) {
        alert('Ya has firmado el consentimiento. No es necesario volver a llenarlo.')
        window.location.href = 'dashboard.html'
      } else {
        window.location.href = 'consentimiento.html'
      }
    }
  })
})