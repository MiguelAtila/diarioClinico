import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (error || !session) {
    return window.location.href = 'login.html'
  }

  const id_auth = session.user.id

  // Obtener usuario_id desde tabla usuarios
  const { data: usuarioData, error: userErr } = await supabase
    .from('usuarios')
    .select('usuario_id')
    .eq('id_auth', id_auth)
    .single()

  if (userErr || !usuarioData) {
    alert('Error al obtener el usuario.')
    return
  }

  const usuario_id = usuarioData.usuario_id

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

  // Obtener cantidad de sesiones
  const { data: sesiones } = await supabase
    .from('sesiones')
    .select('*')
    .eq('usuario_id', usuario_id)

  document.getElementById('sessions-count').innerText =
    sesiones ? `${sesiones.length} sesiones` : '0 sesiones'

  // Estado emocional (puede basarse en última sesión si se tiene)
  const emocional =
    sesiones?.length && sesiones[sesiones.length - 1].avance
      ? sesiones[sesiones.length - 1].avance
      : 'No definido'
  document.getElementById('emotional-state').innerText = emocional

  // Lista de citas próximas
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
        data: [-1, 0, 1, 2, 0], // Placeholder
        fill: false,
        borderColor: '#496b8a',
        tension: 0.2
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  })
})