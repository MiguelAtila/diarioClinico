// js/citas.js
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    console.error('Sesión no encontrada', sessionError)
    return window.location.href = 'login.html'
  }

  const idAuth = session.user.id

  // Buscar usuario_id en tabla usuarios
  const { data: usuario, error: usuarioError } = await supabase
    .from('usuarios')
    .select('usuario_id')
    .eq('id_auth', idAuth)
    .single()

  if (usuarioError || !usuario) {
    alert('Error al obtener información del usuario.')
    return
  }

  const usuarioId = usuario.usuario_id

  await fetchCitas(usuarioId)

  document.getElementById('new-cita-form')
    .addEventListener('submit', async e => {
      e.preventDefault()
      await programarCita(usuarioId)
    })
})

async function fetchCitas(usuarioId) {
  const { data: citas, error } = await supabase
    .from('citas')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('fecha_hora', { ascending: true })

  if (error) {
    console.error('Error al cargar citas:', error.message)
    return
  }

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
    li.innerHTML = `
      <strong>${new Date(c.fecha_hora).toLocaleString()}</strong>
       — ${c.motivo} (${c.tipo_cita})
      <button class="cancel-btn" data-id="${c.cita_id}">Cancelar</button>
    `
    list.appendChild(li)
  })

  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Deseas cancelar esta cita?')) return
      const { error } = await supabase
        .from('citas')
        .update({ estado: 'cancelada' })
        .eq('cita_id', btn.dataset.id)
      if (error) return alert('Error al cancelar: ' + error.message)
      alert('Cita cancelada.')
      fetchCitas(usuarioId)
    })
  })
}

async function programarCita(usuarioId) {
  const fechaHora = document.getElementById('fechaHora').value
  const motivo    = document.getElementById('motivo').value
  const tipoCita  = document.getElementById('tipoCita').value

  const { error } = await supabase
    .from('citas')
    .insert([{
      usuario_id: usuarioId,
      psicologo_id: 1, // Asumimos que siempre es el psicólogo 1
      fecha_hora: fechaHora,
      motivo,
      estado: 'agendada',
      tipo_cita: tipoCita
    }])

  if (error) {
    alert('Error al programar cita: ' + error.message)
  } else {
    alert('Cita programada correctamente.')
    document.getElementById('new-cita-form').reset()
    fetchCitas(usuarioId)
  }
}