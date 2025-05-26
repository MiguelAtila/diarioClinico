// js/citas.js
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  if (!session) return (window.location.href = 'login.html')

  const userId = session.user.id

  await fetchCitas(userId)

  document.getElementById('new-cita-form')
    .addEventListener('submit', async e => {
      e.preventDefault()
      await programarCita(userId)
    })
})

async function fetchCitas(userId) {
  const { data: citas, error } = await supabase
    .from('citas')
    .select('*')
    .eq('usuario_id', userId)
    .order('fecha_hora', { ascending: true })
  if (error) return console.error('Error al cargar citas:', error.message)
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
      const {
        data: { session }
      } = await supabase.auth.getSession()
      fetchCitas(session.user.id)
    })
  })
}

async function programarCita(userId) {
  const fechaHora = document.getElementById('fechaHora').value
  const motivo    = document.getElementById('motivo').value
  const tipoCita  = document.getElementById('tipoCita').value

  const { error } = await supabase
    .from('citas')
    .insert([{
      usuario_id: userId,
      fecha_hora: fechaHora,
      motivo,
      estado: 'agendada',
      tipo_cita: tipoCita,
      psicologo_id: 1 // ID fijo como acordamos
    }])

  if (error) return alert('Error al programar cita: ' + error.message)
  alert('Cita programada correctamente.')
  document.getElementById('new-cita-form').reset()
  fetchCitas(userId)
}