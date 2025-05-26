// js/auth.js
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', () => {
  // Formulario de login
  const loginForm = document.getElementById('login-form')
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault()
      await signInUser()
    })
  }

  // Formulario de registro
  const registerForm = document.getElementById('register-form')
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault()
      await signUpUser()
    })
  }

  // Botón de logout
  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOutUser()
    })
  }

  // Redirección si ya hay sesión activa
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && window.location.pathname.endsWith('login.html')) {
      window.location.href = 'dashboard.html'
    }
  })
})

/**
 * Registra un nuevo usuario en Supabase Auth + lo guarda en la tabla usuarios
 */
async function signUpUser() {
  const nombreCompleto = document.getElementById('nombre')?.value || ''
  const email           = document.getElementById('email').value
  const password        = document.getElementById('password').value
  const confirm         = document.getElementById('confirm').value

  if (password !== confirm) {
    alert('Las contraseñas no coinciden.')
    return
  }

  // Separar nombre y apellidos si es posible
  const partes = nombreCompleto.trim().split(' ')
  const nombre = partes.slice(0, -1).join(' ') || nombreCompleto
  const apellidos = partes.slice(-1).join(' ') || ''

  // Registro con Auth
  const { user, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  })

  if (signUpError) {
    alert('Error al registrarse: ' + signUpError.message)
    return
  }

  // Guardar en tabla usuarios
  const { error: insertError } = await supabase.from('usuarios').insert([
    {
      usuario_id: user.id,  // UID del auth
      nombre,
      apellidos,
      email
    }
  ])

  if (insertError) {
    alert('Registro en auth exitoso, pero error al guardar en base de datos: ' + insertError.message)
  } else {
    alert('Registro exitoso. Confirma tu correo antes de iniciar sesión.')
    window.location.href = 'login.html'
  }
}

/**
 * Iniciar sesión
 */
async function signInUser() {
  const email    = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { session, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    alert('Error de login: ' + error.message)
  } else {
    window.location.href = 'dashboard.html'
  }
}

/**
 * Cerrar sesión
 */
async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error al cerrar sesión:', error.message)
  } else {
    window.location.href = 'index.html'
  }
}