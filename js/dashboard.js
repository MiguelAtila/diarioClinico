import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  const user = session?.user
  if (!user) return  // El control de redirección lo hace main.js

  const id_auth = user.id

  // Obtener usuario_id y nombre
  const { data: usuarioData } = await supabase
    .from('usuarios')
    .select('usuario_id, nombre')
    .eq('id_auth', id_auth)
    .single()

  const usuario_id = usuarioData?.usuario_id

  // Mostrar alerta si ya firmó el consentimiento
  const { data: consentimientoRegistro } = await supabase
    .from('consentimientos')
    .select('consentimiento_id')
    .eq('id_auth', id_auth)
    .maybeSingle()

  const consentAlert = document.getElementById('consent-alert')
  if (consentAlert) {
    consentAlert.style.display = consentimientoRegistro ? 'block' : 'none'
  }

  // Próxima cita
  const { data: citas } = await supabase
    .from('citas')
    .select('*')
    .eq('usuario_id', usuario_id)
    .eq('estado', 'agendada')
    .order('fecha_hora', { ascending: true })

  const nextCita = citas?.[0]
  document.getElementById('next-appointment').innerText =
    nextCita ? new Date(nextCita.fecha_hora).toLocaleString() : '–'
  document.getElementById('therapist-name').innerText =
    nextCita ? 'Miguel Atilano' : ''

  // Sesiones
  const { data: sesiones } = await supabase
    .from('sesiones')
    .select('*')
    .eq('usuario_id', usuario_id)

  document.getElementById('sessions-count').innerText =
    sesiones?.length ? `${sesiones.length} sesiones` : '0 sesiones'

  const emocional = sesiones?.[sesiones.length - 1]?.avance || 'No definido'
  document.getElementById('emotional-state').innerText = emocional

  // Lista de próximas citas
  const upcomingList = document.getElementById('upcoming-list')
  upcomingList.innerHTML = ''
  citas.forEach(cita => {
    const li = document.createElement('li')
    li.textContent = `${new Date(cita.fecha_hora).toLocaleString()} — ${cita.estado}`
    upcomingList.appendChild(li)
  })

  // Gráfica de progreso (placeholder)
  const ctx = document.getElementById('progress-chart').getContext('2d')
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
      datasets: [{
        label: 'Nivel emocional',
        data: [-1, 0, 1, 2, 0],
        borderColor: '#496b8a',
        fill: false,
        tension: 0.2
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  })

  // Protección contra doble consentimiento
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('#consentBtn')
    if (target) {
      e.preventDefault()

      const { data: yaFirmado } = await supabase
        .from('consentimientos')
        .select('consentimiento_id')
        .eq('id_auth', id_auth)
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