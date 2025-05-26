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

  await fetchCitas(usuario_id)

  document.getElementById('new-cita-form')
    .addEventListener('submit', async e => {
      e.preventDefault()
      await programarCita(usuario_id)
    })
})

let citas = []

async function fetchCitas(usuario_id) {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('usuario_id', usuario_id)
    .order('fecha_hora', { ascending: true })

  if (error) {
    console.error('Error al obtener citas:', error.message)
    return
  }

  citas = data
  displayCitas(citas)
}

function displayCitas(citas) {
  const list = document.getElementById('citas-list')
  list.innerHTML = ''
  if (!citas.length) {
    list.innerHTML = '<p>No tienes citas programadas.</p>'
    return
  }

  citas.forEach(c => {
    const li = document.createElement('li')
    const isCancelled = c.estado === 'cancelada'
    li.innerHTML = `
      <strong>${new Date(c.fecha_hora).toLocaleString()}</strong>
       — ${c.motivo} (${c.tipo_cita}) 
       <span class="${isCancelled ? 'cancelled' : 'active'}">[${c.estado}]</span>
      ${!isCancelled ? `<button class="cancel-btn" data-id="${c.cita_id}">Cancelar</button>` : ''}
    `
    list.appendChild(li)
  })

  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const citaId = btn.dataset.id
      const citaItem = citas.find(cita => cita.cita_id == citaId)
      const fechaCita = new Date(citaItem.fecha_hora)
      const ahora = new Date()
      const diferenciaHoras = (fechaCita - ahora) / (1000 * 60 * 60)

      if (diferenciaHoras < 24) {
        alert('No puedes cancelar una cita con menos de 24 horas de anticipación.')
        return
      }

      if (!confirm('¿Deseas cancelar esta cita?')) return

      const { error } = await supabase
        .from('citas')
        .update({ estado: 'cancelada' })
        .eq('cita_id', citaId)

      if (error) {
        alert('Error al cancelar: ' + error.message)
      } else {
        alert('Cita cancelada.')
        await fetchCitas(citaItem.usuario_id)
      }
    })
  })
}

async function programarCita(usuario_id) {
  const fechaInput = document.getElementById('fechaHora').value
  const fechaHora = new Date(fechaInput)
  const now = new Date()

  if (fechaHora <= now) {
    alert('No puedes agendar una cita en una fecha u hora pasada.')
    return
  }

  const motivo = document.getElementById('motivo').value
  const tipoCita = document.getElementById('tipoCita').value

  const { error } = await supabase
    .from('citas')
    .insert([{
      usuario_id,
      fecha_hora: fechaHora.toISOString(),
      motivo,
      tipo_cita: tipoCita,
      estado: 'agendada',
      psicologo_id: 1
    }])

  if (error) {
    alert('Error al programar cita: ' + error.message)
  } else {
    alert('Cita programada correctamente.')
    document.getElementById('new-cita-form').reset()
    await fetchCitas(usuario_id)
  }
}