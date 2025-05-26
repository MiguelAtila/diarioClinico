import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return window.location.href = 'login.html'

  const authUserId = session.user.id

  // Obtener el usuario_id de la tabla usuarios
  const { data: usuarios, error: userError } = await supabase
    .from('usuarios')
    .select('usuario_id')
    .eq('id_auth', authUserId)
    .single()

  if (userError || !usuarios) {
    alert('No se pudo obtener tu ID de usuario. Intenta de nuevo.')
    return
  }

  const usuarioId = usuarios.usuario_id

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
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      const { data } = await supabase
        .from('usuarios')
        .select('usuario_id')
        .eq('id_auth', userId)
        .single()
      await fetchCitas(data.usuario_id)
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
      psicologo_id: 1, // fijo por ahora
      fecha_hora: fechaHora,
      motivo,
      estado: 'agendada',
      tipo_cita: tipoCita
    }])
  if (error) return alert('Error al programar cita: ' + error.message)
  alert('Cita programada correctamente.')
  document.getElementById('new-cita-form').reset()
  await fetchCitas(usuarioId)
}