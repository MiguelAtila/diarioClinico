import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return window.location.href = 'login.html'
  }

  const id_auth = session.user.id

  // Obtener usuario y su nombre
  const { data: usuarioData, error: userErr } = await supabase
    .from('usuarios')
    .select('usuario_id, nombre')
    .eq('id_auth', id_auth)
    .single()

  if (userErr || !usuarioData) {
    alert('Error al obtener el usuario.')
    return
  }

  const usuario_id = usuarioData.usuario_id

  // Mostrar nombre en encabezado
  const nombreSpan = document.querySelector('.user-name')
  if (nombreSpan && usuarioData.nombre) {
    nombreSpan.textContent = `Hola, ${usuarioData.nombre}`
  }

  // Mostrar alerta visual si ya firmó consentimiento
  const { data: consentimientoRegistro } = await supabase
    .from('consentimientos')
    .select('consentimiento_id')
    .eq('id_auth', id_auth)
    .maybeSingle()

  const consentAlert = document.getElementById('consent-alert')
  consentAlert.style.display = consentimientoRegistro ? 'block' : 'none'

  // Obtener próxima cita
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

  // Obtener sesiones
  const { data: sesiones } = await supabase
    .from('sesiones')
    .select('*')
    .eq('usuario_id', usuario_id)

  document.getElementById('sessions-count').innerText =
    sesiones ? `${sesiones.length} sesiones` : '0 sesiones'

  const emocional =
    sesiones?.length && sesiones[sesiones.length - 1].avance
      ? sesiones[sesiones.length - 1].avance
      : 'No definido'
  document.getElementById('emotional-state').innerText = emocional

  // Mostrar próximas citas
  const upcomingList = document.getElementById('upcoming-list')
  upcomingList.innerHTML = ''
  citas.forEach(cita => {
    const li = document.createElement('li')
    li.textContent = `${new Date(cita.fecha_hora).toLocaleString()} — ${cita.estado}`
    upcomingList.appendChild(li)
  })

  // Gráfica estática por ahora
  const ctx = document.getElementById('progress-chart').getContext('2d')
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
      datasets: [{
        label: 'Nivel emocional',
        data: [-1, 0, 1, 2, 0],
        fill: false,
        borderColor: '#496b8a',
        tension: 0.2
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  })

  // Protección al hacer clic en consentimiento
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('#consentBtn')
    if (!target) return

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
  })
})