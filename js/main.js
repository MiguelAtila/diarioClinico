// js/main.js
import { supabase } from './supabase.js'

const publicPages  = ['index.html', 'login.html', 'registro.html']
const privatePages = ['dashboard.html','citas.html','sesiones.html','consentimiento.html']

document.addEventListener('DOMContentLoaded', () => {
  const user = supabase.auth.session()?.user
  const page = window.location.pathname.split('/').pop()

  // Si está logueado y entra a página pública → dashboard
  if (user && publicPages.includes(page)) {
    return window.location.href = 'dashboard.html'
  }
  // Si NO está logueado y entra a página privada → login
  if (!user && privatePages.includes(page)) {
    return window.location.href = 'login.html'
  }
  // Logout global
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.href = 'index.html'
  })
})