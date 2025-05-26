// js/citas.js
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

  // Buscar usuario_id en la tabla usuarios
  const { data: usuarioData, error: userFetchError } = await supabase
    .from('usuarios')
    .select('usuario_id')
    .eq('id_auth', id_auth)
    .single()

  if (userFetchError || !usuarioData) {
    alert('Error al obtener información del usuario.')
    return
  }

  const usuario_id = usuarioData.usuario_id

  // Cargar citas existentes
  await fetchCitas(usuario_id)

  document.getElementById('new-cita-form')
    .addEventListener('submit', async e => {
      e.preventDefault()
      await programarCita(usuario_id)
    })
})

/**
 * Consultar citas del usuario
 */
async function fetchCitas(usuario_id) {
  const { data: citas, error } = await supabase
    .from('citas')
    .select('*')
    .eq('usuario_id', usuario_id)
    .order('fecha_hora', { ascending: true })

  if (error) {
    console.error('Error al obtener citas:', error.message)
    return
  }

  console.log('Citas recuperadas:', citas)  // DEBUG
  displayCitas(citas)
}

/**
 * Renderizar citas
 */
function displayCitas(citas) {
  const list = document.getElementById('citas-list')
  list.innerHTML = ''

  if (!citas.length) {
    list.innerHTML = '<p>No tienes citas programadas.</p>'
    return
  }

  citas.forEach(c => {
    const li = document.createElement('li')
    li.className = c.estado === 'cancelada' ? 'cita cancelada' : 'cita'
    li.innerHTML = `
      <strong>${new Date(c.fecha_hora).toLocaleString()}</strong>
       — ${c.motivo} (${c.tipo_cita}) - <em>${c.estado}</em>
      ${c.estado !== 'cancelada' ? `<button class="cancel-btn" data-id="${c.cita_id}">Cancelar</button>` : ''}
    `
    list.appendChild(li)
  })

  // Evento cancelar
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Deseas cancelar esta cita?')) return

      const { error } = await supabase
        .from('citas')
        .update({ estado: 'cancelada' })
        .eq('cita_id', btn.dataset.id)

      if (error) {
        alert('Error al cancelar: ' + error.message)
      } else {
        alert('Cita cancelada.')
        location.reload()
      }
    })
  })
}

/**
 * Crear nueva cita
 */
async function programarCita(usuario_id) {
  const fechaHora = document.getElementById('fechaHora').value
  const motivo    = document.getElementById('motivo').value
  const tipoCita  = document.getElementById('tipoCita').value

  const { error } = await supabase
    .from('citas')
    .insert([
      {
        usuario_id,
        fecha_hora: fechaHora,
        motivo,
        tipo_cita: tipoCita,
        estado: 'agendada',
        psicologo_id: 1 // por ahora fijo
      }
    ])

  if (error) {
    alert('Error al programar cita: ' + error.message)
  } else {
    alert('Cita programada correctamente.')
    document.getElementById('new-cita-form').reset()
    await fetchCitas(usuario_id)
  }
}