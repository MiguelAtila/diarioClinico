// js/main.js
import { supabase } from './supabase.js';

// Define qué páginas son públicas (no requieren sesión)
// y cuáles son privadas (solo accesibles tras login)
const publicPages    = ['index.html', 'login.html', 'registro.html'];
const privatePages   = ['dashboard.html', 'citas.html', 'sesiones.html', 'consentimiento.html'];

document.addEventListener('DOMContentLoaded', () => {
  const { user } = supabase.auth.session() || {};
  const page = window.location.pathname.split('/').pop();

  // 1. Si está logueado y está en una página pública, lo envía a dashboard
  if (user && publicPages.includes(page)) {
    window.location.href = 'dashboard.html';
    return;
  }

  // 2. Si NO está logueado y está en una página privada, lo envía a login
  if (!user && privatePages.includes(page)) {
    window.location.href = 'login.html';
    return;
  }

  // 3. Logout global
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = 'index.html';
    });
  }
});