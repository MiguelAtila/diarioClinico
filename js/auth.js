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

  // Botón logout
  const logoutBtn = document.getElementById('logoutBtn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOutUser()
    })
  }

  // Redirección si ya está logueado
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && window.location.pathname.endsWith('login.html')) {
      window.location.href = 'dashboard.html'
    }
  })
})

/**
 * Registra un nuevo usuario en Supabase Auth y en tabla usuarios
 */
async function signUpUser() {
  const nombre    = document.getElementById('nombre')?.value.trim()
  const apellidos = document.getElementById('apellidos')?.value.trim()
  const email     = document.getElementById('email')?.value.trim()
  const password  = document.getElementById('password')?.value
  const confirm   = document.getElementById('confirm')?.value

  if (!nombre || !apellidos || !email || !password || !confirm) {
    alert('Por favor completa todos los campos.')
    return
  }

  if (password !== confirm) {
    alert('Las contraseñas no coinciden.')
    return
  }

  // Crear cuenta en Supabase Auth
  const { user, session, error } = await supabase.auth.signUp(
    { email, password }
  )

  if (error) {
    alert('Error al registrar usuario: ' + error.message)
    return
  }

  // Si se creó correctamente, insertar en tabla usuarios
  const { error: dbError } = await supabase
    .from('usuarios')
    .insert([
      {
        nombre,
        apellidos,
        email,
        fecha_registro: new Date().toISOString(),
        activo: true
      }
    ])

  if (dbError) {
    alert('Usuario registrado, pero ocurrió un error al guardar en la base de datos: ' + dbError.message)
  } else {
    alert('Registro exitoso. Confirma tu correo antes de iniciar sesión.')
    window.location.href = 'login.html'
  }
}

/**
 * Inicia sesión con Supabase Auth
 */
async function signInUser() {
  const email    = document.getElementById('email')?.value.trim()
  const password = document.getElementById('password')?.value

  const { user, session, error } = await supabase.auth.signIn({ email, password })

  if (error) {
    alert('Error al iniciar sesión: ' + error.message)
  } else {
    window.location.href = 'dashboard.html'
  }
}

/**
 * Cierra sesión
 */
async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error al cerrar sesión:', error.message)
  } else {
    window.location.href = 'index.html'
  }
}