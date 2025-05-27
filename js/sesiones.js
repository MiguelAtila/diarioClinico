import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar sesión del usuario
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData?.session?.user

  if (!user) {
    window.location.href = 'login.html'
    return
  }

  // Obtener nombre del usuario
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre')
    .eq('id_auth', user.id)
    .single()

  if (perfil?.nombre) {
    const nombreSpan = document.querySelector('.user-name')
    if (nombreSpan) {
      nombreSpan.textContent = `Hola, ${perfil.nombre}`
    }
  }

  // Simulación de sesiones (puedes reemplazar con fetch real en el futuro)
  const sessions = [
    {
      fecha_sesion: '2025-04-10 10:00',
      notas_clinicas: 'Exploramos técnicas de respiración.',
      recomendaciones: 'Practicar 5 minutos diarios.',
      avance: 'Mejoría notable en ansiedad.',
      documentos_adjuntos: 'informe_20250410.pdf'
    },
    {
      fecha_sesion: '2025-04-17 10:00',
      notas_clinicas: 'Trabajo en resiliencia emocional.',
      recomendaciones: 'Leer artículo adjunto.',
      avance: 'Paciente más confiado.',
      documentos_adjuntos: 'articulo_resiliencia.pdf'
    }
  ]

  // Renderizar las tarjetas de sesión
  const container = document.getElementById('sessions-list')
  sessions.forEach(s => {
    const card = document.createElement('div')
    card.className = 'session-card'
    card.innerHTML = `
      <h3>${s.fecha_sesion}</h3>
      <p><strong>Notas:</strong> ${s.notas_clinicas}</p>
      <p><strong>Recomendaciones:</strong> ${s.recomendaciones}</p>
      <p><strong>Avance:</strong> ${s.avance}</p>
      <p><strong>Documento:</strong>
        <a href="assets/documentos/${s.documentos_adjuntos}" target="_blank">
          ${s.documentos_adjuntos}
        </a>
      </p>
    `
    container.appendChild(card)
  })

  // Cierre de sesión (si NO usas main.js)
  // const logoutBtn = document.getElementById('logoutBtn')
  // if (logoutBtn) {
  //   logoutBtn.addEventListener('click', async () => {
  //     const confirmLogout = confirm('¿Deseas cerrar sesión?')
  //     if (!confirmLogout) return

  //     const { error } = await supabase.auth.signOut()
  //     if (error) {
  //       alert('Error al cerrar sesión: ' + error.message)
  //     } else {
  //       window.location.href = 'index.html'
  //     }
  //   })
  // }
})