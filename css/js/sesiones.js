document.addEventListener('DOMContentLoaded', () => {
  const sessionsContainer = document.getElementById('sessions-list');

  // 1. Función para obtener sesiones (aquí datos de ejemplo)
  function fetchSessions() {
    // En producción sustituye este array por la llamada a Supabase:
    return [
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
    ];
  }

  // 2. Función para renderizar cada sesión
  function displaySessions(sessions) {
    sessionsContainer.innerHTML = ''; // limpia contenido
    sessions.forEach(sesion => {
      const card = document.createElement('div');
      card.className = 'session-card';
      card.innerHTML = `
        <h3>${sesion.fecha_sesion}</h3>
        <p><span class="label">Notas:</span> ${sesion.notas_clinicas}</p>
        <p><span class="label">Recomendaciones:</span> ${sesion.recomendaciones}</p>
        <p><span class="label">Avance:</span> ${sesion.avance}</p>
        <p><span class="label">Documento:</span> 
          <a href="assets/documentos/${sesion.documentos_adjuntos}" target="_blank">
            ${sesion.documentos_adjuntos}
          </a>
        </p>
      `;
      sessionsContainer.appendChild(card);
    });
  }

  // 3. Inicialización
  const sesiones = fetchSessions();
  displaySessions(sesiones);

  // 4. Logout (placeholder)
  document.getElementById('logoutBtn').addEventListener('click', () => {
    alert('Sesión cerrada');
    window.location.href = 'index.html';
  });
});