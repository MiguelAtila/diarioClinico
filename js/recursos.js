import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const user = sessionData?.session?.user

  if (sessionError || !user) {
    window.location.href = 'login.html'
    return
  }

  // Obtener nombre y usuario_id
  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .select('nombre, usuario_id')
    .eq('id_auth', user.id)
    .single()

  if (perfilError || !perfil) {
    console.error('Error al obtener perfil del usuario:', perfilError)
    return
  }

  // Mostrar nombre del usuario
  const nombreSpan = document.querySelector('.user-name')
  if (nombreSpan) {
    nombreSpan.textContent = `Hola, ${perfil.nombre}`
  }

  // Cargar recursos simulados
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

    // Si es un enlace de YouTube, mostrar embed
    if (r.enlace.includes('youtube.com') || r.enlace.includes('youtu.be')) {
      const videoId = extraerVideoId(r.enlace)
      li.innerHTML = `
        <p><strong>${r.titulo}</strong></p>
        <div class="video-container">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `
    } else {
      li.innerHTML = `<a href="${r.enlace}" target="_blank">${r.titulo}</a>`
    }

    list.appendChild(li)
  })

  function extraerVideoId(url) {
    const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[1].length === 11 ? match[1] : null
  }

  // Cierre de sesión real
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

  // Interceptar clic en el botón de consentimiento del sidebar
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('#consentBtn')
    if (!target) return

    e.preventDefault()

    const { data: yaFirmado, error: consentError } = await supabase
      .from('consentimientos')
      .select('consentimiento_id')
      .eq('id_auth', user.id)
      .maybeSingle()

    if (consentError) {
      console.error('Error al verificar consentimiento:', consentError)
      return
    }

    if (yaFirmado) {
      alert('Ya has firmado el consentimiento. No es necesario volver a llenarlo.')
      window.location.href = 'dashboard.html'
    } else {
      window.location.href = 'consentimiento.html'
    }
  })
})