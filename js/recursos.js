import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData?.session?.user

  if (!user) {
    window.location.href = 'login.html'
    return
  }

  // Mostrar nombre del paciente
  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre, usuario_id')
    .eq('id_auth', user.id)
    .single()

  if (perfil?.nombre) {
    const nombreSpan = document.querySelector('.user-name')
    if (nombreSpan) nombreSpan.textContent = `Hola, ${perfil.nombre}`
  }

  // Verificar si ya firmó consentimiento
  const { data: firmado } = await supabase
    .from('consentimientos')
    .select('consentimiento_id')
    .eq('id_auth', user.id)
    .maybeSingle()

  // Interceptar clic en "Consentimiento" desde sidebar
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('#consentBtn')
    if (target) {
      e.preventDefault()
      if (firmado) {
        alert('Ya has firmado el consentimiento. No es necesario volver a llenarlo.')
        window.location.href = 'dashboard.html'
      } else {
        window.location.href = 'consentimiento.html'
      }
    }
  })

  // Lista simulada de recursos
  const recursos = [
    {
      titulo: 'Ejercicios de respiración consciente',
      enlace: 'assets/recursos/respiracion_consciente.pdf'
    },
    {
      titulo: 'Guía para mejorar la autoestima',
      enlace: 'assets/recursos/autoestima.pdf'
    },
    {
      titulo: 'Video: Cómo manejar la ansiedad',
      enlace: 'https://www.youtube.com/watch?v=EjVzLcs2LRI'
    }
  ]

  const list = document.getElementById('recursos-list')
  recursos.forEach(r => {
    const li = document.createElement('li')
    li.innerHTML = `<a href="${r.enlace}" target="_blank">${r.titulo}</a>`
    list.appendChild(li)
  })

  document.getElementById('logoutBtn')
    .addEventListener('click', () => location.href = 'index.html')
})