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

// Registro
async function signUpUser() {
  const nombre = document.getElementById('nombre').value.trim()
  const apellidos = document.getElementById('apellidos').value.trim()
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  const confirm = document.getElementById('confirm').value

  if (password !== confirm) {
    alert('Las contraseñas no coinciden.')
    return
  }

  const { user, error } = await supabase.auth.signUp(
    { email, password },
    { data: { nombre, apellidos } }
  )

  if (error) {
    alert('Error al registrarse: ' + error.message)
    return
  }

  // Guardar datos en tabla "usuarios"
  const { error: insertError } = await supabase
    .from('usuarios')
    .insert([
      {
        usuario_id: user.id,
        nombre,
        apellidos,
        email,
        fecha_registro: new Date().toISOString(),
        activo: true
      }
    ])

  if (insertError) {
    console.error('Error al insertar en usuarios:', insertError.message)
    alert('Registro incompleto en base de datos.')
  } else {
    alert('Registro exitoso. Confirma tu correo antes de iniciar sesión.')
    window.location.href = 'login.html'
  }
}

// Login
async function signInUser() {
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value

  const { session, error } = await supabase.auth.signIn({ email, password })

  if (error) {
    alert('Error de login: ' + error.message)
  } else {
    window.location.href = 'dashboard.html'
  }
}

// Logout
async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error al cerrar sesión:', error.message)
  } else {
    window.location.href = 'index.html'
  }
}