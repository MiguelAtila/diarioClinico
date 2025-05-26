// js/auth.js
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form')
  const registerForm = document.getElementById('register-form')
  const logoutBtn = document.getElementById('logoutBtn')

  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault()
      await signInUser()
    })
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault()
      await signUpUser()
    })
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOutUser()
    })
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (session && window.location.pathname.endsWith('login.html')) {
      window.location.href = 'dashboard.html'
    }
  })
})

/**
 * Registrar nuevo usuario
 */
async function signUpUser() {
  const nombre = document.getElementById('nombre').value
  const apellidos = document.getElementById('apellidos').value
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const confirm = document.getElementById('confirm').value

  if (password !== confirm) {
    alert('Las contraseñas no coinciden.')
    return
  }

  const { user, error: signupError } = await supabase.auth.signUp({
    email,
    password
  })

  if (signupError) {
    alert(`Error al registrarse: ${signupError.message}`)
    return
  }

  // Insertar en tabla usuarios
  const { error: insertError } = await supabase.from('usuarios').insert({
    id_auth: user.id,
    nombre,
    apellidos
  })

  if (insertError) {
    alert(`Usuario creado, pero error al guardar en tabla usuarios: ${insertError.message}`)
  } else {
    alert('Registro exitoso. Revisa tu correo para confirmar tu cuenta.')
    window.location.href = 'login.html'
  }
}

/**
 * Login
 */
async function signInUser() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    alert('Error de login: ' + error.message)
  } else {
    window.location.href = 'dashboard.html'
  }
}

/**
 * Logout
 */
async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error al cerrar sesión:', error.message)
  } else {
    window.location.href = 'index.html'
  }
}