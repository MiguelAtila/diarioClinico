import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return window.location.href = 'login.html'

  // Obtenemos el usuario_id interno a partir de id_auth
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('usuario_id')
    .eq('id_auth', user.id)
    .single()

  if (userError || !userData) {
    alert('No se encontró el usuario registrado en la base de datos.')
    return
  }

  const usuarioId = userData.usuario_id

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

  if (error) return console.error(error.message)
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
      location.reload()
    })
  })
}

async function programarCita(usuarioId) {
  const fechaHora = document.getElementById('fechaHora').value
  const motivo    = document.getElementById('motivo').value
  const tipoCita  = document.getElementById('tipoCita').value

  const { error } = await supabase
    .from('citas')
    .insert([
      {
        usuario_id: usuarioId,
        fecha_hora: fechaHora,
        motivo,
        estado: 'agendada',
        tipo_cita: tipoCita,
        psicologo_id: 1 // Fijo por ahora
      }
    ])

  if (error) return alert('Error al programar cita: ' + error.message)

  alert('Cita programada correctamente.')
  document.getElementById('new-cita-form').reset()
  fetchCitas(usuarioId)
}