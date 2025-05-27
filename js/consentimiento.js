import { supabase } from './supabase.js'

window.addEventListener('DOMContentLoaded', async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData?.session?.user

  if (!user) {
    alert('Debes iniciar sesión para continuar.')
    window.location.href = 'login.html'
    return
  }

  // Verificar si ya firmó el consentimiento
  const { data: yaFirmado, error: checkError } = await supabase
    .from('consentimientos')
    .select('consentimiento_id')
    .eq('id_auth', user.id)
    .maybeSingle()

  if (checkError) {
    console.error('Error al verificar consentimiento:', checkError)
  }

  if (yaFirmado) {
    alert('Ya has firmado el consentimiento informado. No es necesario volver a llenarlo.')
    window.location.href = 'dashboard.html'
    return
  }

  // Obtener perfil del usuario
  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .select('nombre, apellidos, usuario_id')
    .eq('id_auth', user.id)
    .single()

  if (perfilError || !perfil) {
    console.error('Error al cargar datos del usuario:', perfilError)
    return
  }

  // Mostrar saludo y prellenar campos
  const nombreSpan = document.querySelector('.user-name')
  if (nombreSpan) nombreSpan.textContent = `Hola, ${perfil.nombre}`

  document.getElementById('nombre_paciente').value = `${perfil.nombre} ${perfil.apellidos}`
  document.getElementById('fecha').valueAsDate = new Date()
  document.getElementById('consent-form').dataset.usuarioId = perfil.usuario_id
})

// Control de botón enviar
const btnEnviar = document.getElementById('btnEnviar')
const msg = document.getElementById('noAutorizadoMsg')
btnEnviar.disabled = true

document.querySelectorAll('input[name="autorizacion"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    const autorizado = document.querySelector('input[name="autorizacion"]:checked')?.value
    if (autorizado === 'autorizo') {
      btnEnviar.disabled = false
      msg.style.display = 'none'
    } else {
      btnEnviar.disabled = true
      msg.style.display = 'block'
    }
  })
})

// Guardar consentimiento
document.getElementById('consent-form').addEventListener('submit', async (e) => {
  e.preventDefault()

  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData?.session?.user
  if (!user) return alert('Sesión expirada. Inicia sesión nuevamente.')

  const autorizado = document.querySelector('input[name="autorizacion"]:checked')?.value === 'autorizo'
  if (!autorizado) {
    alert('Debes autorizar el consentimiento para continuar.')
    return
  }

  const usuario_id = e.target.dataset.usuarioId

  // Verificación final por seguridad
  const { data: yaFirmado } = await supabase
    .from('consentimientos')
    .select('consentimiento_id')
    .eq('id_auth', user.id)
    .maybeSingle()

  if (yaFirmado) {
    alert('Este consentimiento ya ha sido registrado.')
    window.location.href = 'dashboard.html'
    return
  }

  const { error } = await supabase.from('consentimientos').insert([
    {
      usuario_id,
      consentimiento_aceptado: true,
      id_auth: user.id
    }
  ])

  if (error) {
    console.error('Error al guardar consentimiento:', error)
    alert('No se pudo guardar el consentimiento.')
  } else {
    alert('Consentimiento registrado con éxito.')
    window.location.href = 'dashboard.html'
  }
})