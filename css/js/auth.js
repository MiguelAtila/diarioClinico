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

  // Si ya hay sesión activa, redirige al dashboard
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && window.location.pathname.endsWith('login.html')) {
      window.location.href = 'dashboard.html'
    }
  })
})

/**
 * Registra un nuevo usuario en Supabase Auth
 */
async function signUpUser() {
  const nombre   = document.getElementById('nombre')?.value || ''
  const email    = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { user, error } = await supabase.auth.signUp(
    { email, password },
    { data: { nombre } }
  )

  if (error) {
    alert('Error al registrarse: ' + error.message)
  } else {
    alert('Registro exitoso. Confirma tu correo antes de iniciar sesión.')
    window.location.href = 'login.html'
  }
}

/**
 * Loguea un usuario existente
 */
async function signInUser() {
  const email    = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { session, error } = await supabase.auth.signIn({ email, password })

  if (error) {
    alert('Error de login: ' + error.message)
  } else {
    window.location.href = 'dashboard.html'
  }
}

/**
 * Cierra la sesión actual
 */
async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error al cerrar sesión:', error.message)
  } else {
    window.location.href = 'index.html'
  }
}