// js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
  // Datos de ejemplo
  const nextAppt     = '25 Mayo 2025, 10:00 AM'
  const therapist    = 'Dr. María Pérez'
  const sessionsDone = 8
  const emotional    = 'Neutral 😊'
  const upcoming     = [
    { date: '2025-05-25 10:00', status: 'Agendada' },
    { date: '2025-06-01 08:00', status: 'Agendada' }
  ]
  const resources = [
    { title: 'Manejo del estrés', desc: 'Artículo sobre técnicas de respiración.' },
    { title: 'Meditación guiada', desc: 'Video para principiantes.' }
  ]

  document.getElementById('next-appointment').innerText = nextAppt
  document.getElementById('therapist-name')  .innerText = therapist
  document.getElementById('sessions-count')   .innerText = `${sessionsDone} sesiones`
  document.getElementById('emotional-state')  .innerText = emotional

  upcoming.forEach(item => {
    const li = document.createElement('li')
    li.innerText = `${item.date} — ${item.status}`
    document.getElementById('upcoming-list').appendChild(li)
  })

  const ctx = document.getElementById('progress-chart').getContext('2d')
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Ene','Feb','Mar','Abr','May'],
      datasets: [{ label:'Nivel emocional', data:[-1,0,1,2,0], fill:false, borderColor:'#496b8a', tension:0.2 }]
    },
    options: { scales:{ y:{ beginAtZero:true } } }
  })

  resources.forEach(r => {
    const d = document.createElement('div')
    d.className = 'resource-card'
    d.innerHTML = `<h4>${r.title}</h4><p>${r.desc}</p>`
    document.getElementById('resources-list').appendChild(d)
  })

  document.getElementById('logoutBtn')
    .addEventListener('click', () => location.href = 'index.html')
})