// js/auth.js
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', () => {
  // — Login —
  document.getElementById('login-form')?.addEventListener('submit', async e => {
    e.preventDefault()
    const email    = e.target.email.value
    const password = e.target.password.value

    const { session, error } = await supabase.auth.signIn({ email, password })
    if (error) {
      return alert('Error de login: ' + error.message)
    }
    window.location.href = 'dashboard.html'
  })

  // — Registro —
  document.getElementById('register-form')?.addEventListener('submit', async e => {
    e.preventDefault()
    const nombre   = e.target.nombre.value.trim()
    const email    = e.target.email.value.trim()
    const password = e.target.password.value
    const confirm  = e.target.confirm.value

    if (password !== confirm) {
      return alert('❌ Las contraseñas no coinciden.')
    }

    const { user, error } = await supabase.auth.signUp(
      { email, password },
      { data: { nombre } }
    )

    if (error) {
      return alert('Error al registrarse: ' + error.message)
    }
    alert('✅ Registro exitoso. Por favor confirma tu correo antes de iniciar sesión.')
    window.location.href = 'login.html'
  })

  // — Logout —
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.href = 'index.html'
  })

  // — Redirección automática tras login —
  supabase.auth.onAuthStateChange((_, session) => {
    if (session && window.location.pathname.endsWith('login.html')) {
      window.location.href = 'dashboard.html'
    }
  })
})