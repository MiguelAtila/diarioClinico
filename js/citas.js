// js/citas.js
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const session = supabase.auth.session()
  if (!session) return window.location.href = 'login.html'
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
  if (error) {
    console.error('Error al obtener citas:', error.message)
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
      fetchCitas(supabase.auth.session().user.id)
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
      psicologo_id: 1,  // Asignado fijo por ahora
      fecha_hora: fechaHora,
      motivo,
      estado: 'agendada',
      tipo_cita: tipoCita
    }])

  if (error) return alert('Error al programar cita: ' + error.message)

  alert('Cita programada correctamente.')
  document.getElementById('new-cita-form').reset()
  fetchCitas(userId)
}