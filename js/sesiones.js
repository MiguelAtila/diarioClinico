// js/sesiones.js
document.addEventListener('DOMContentLoaded', () => {
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

  document.getElementById('logoutBtn')
    .addEventListener('click', () => location.href = 'index.html')
})