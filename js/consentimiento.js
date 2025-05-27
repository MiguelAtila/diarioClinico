import { supabase } from './supabase.js';

// Verificación al cargar la página
window.addEventListener('DOMContentLoaded', async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) {
    alert('Debes iniciar sesión para continuar.');
    window.location.href = 'login.html';
    return;
  }

  // Verificar si ya firmó el consentimiento
  const { data: yaFirmado, error: checkError } = await supabase
    .from('consentimientos')
    .select('consentimiento_id')
    .eq('id_auth', user.id)
    .maybeSingle();

  if (checkError) {
    console.error('Error al verificar consentimiento:', checkError);
  }

  if (yaFirmado) {
    alert('Ya has firmado el consentimiento informado. No es necesario volver a llenarlo.');
    window.location.href = 'dashboard.html';
    return;
  }

  // Obtener nombre y apellidos del usuario para prellenar y saludo
  const { data: perfil, error } = await supabase
    .from('usuarios')
    .select('nombre, apellidos')
    .eq('id_auth', user.id)
    .single();

  if (error || !perfil) {
    console.error('Error al cargar datos del usuario:', error);
    return;
  }

  // Mostrar saludo personalizado
  const nombreSpan = document.querySelector('.user-name');
  if (nombreSpan) {
    nombreSpan.textContent = `Hola, ${perfil.nombre}`;
  }

  // Prellenar campos
  document.getElementById('nombre_paciente').value = `${perfil.nombre} ${perfil.apellidos}`;
  document.getElementById('fecha').valueAsDate = new Date();
});

// Habilitar botón solo si se autoriza
const btnEnviar = document.getElementById('btnEnviar');
const msg = document.getElementById('noAutorizadoMsg');
btnEnviar.disabled = true;

document.querySelectorAll('input[name="autorizacion"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    const autorizado = document.querySelector('input[name="autorizacion"]:checked')?.value;
    if (autorizado === 'autorizo') {
      btnEnviar.disabled = false;
      msg.style.display = 'none';
    } else {
      btnEnviar.disabled = true;
      msg.style.display = 'block';
    }
  });
});

// Enviar consentimiento
document.getElementById('consent-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) return alert('Sesión expirada. Inicia sesión nuevamente.');

  const autorizado = document.querySelector('input[name="autorizacion"]:checked')?.value === 'autorizo';
  if (!autorizado) {
    alert('Debes autorizar el consentimiento para continuar.');
    return;
  }

  // Validar si ya firmó (extra por seguridad)
  const { data: yaFirmado } = await supabase
    .from('consentimientos')
    .select('consentimiento_id')
    .eq('usuario_id', user.id)
    .maybeSingle();

  if (yaFirmado) {
    alert('Este consentimiento ya ha sido registrado.');
    window.location.href = 'dashboard.html';
    return;
  }

  const { error } = await supabase.from('consentimientos').insert([
    {
      usuario_id: user.id,
      consentimiento_aceptado: true,
      id_auth: user.id
    }
  ]);

  if (error) {
    console.error('Error al guardar consentimiento:', error);
    alert('No se pudo guardar el consentimiento.');
  } else {
    alert('Consentimiento registrado con éxito.');
    window.location.href = 'dashboard.html';
  }
});