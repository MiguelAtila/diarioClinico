// js/auth.js
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form')

  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault()
      await signInUser()
    })
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (session && window.location.pathname.endsWith('login.html')) {
      window.location.href = 'dashboard.html'
    }
  })
})

async function signInUser() {
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value.trim()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    alert('Error al iniciar sesión: ' + error.message)
    return
  }

  if (data?.session) {
    window.location.href = 'dashboard.html'
  } else {
    alert('No se pudo establecer sesión. Revisa tus credenciales.')
  }
}