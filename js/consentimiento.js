import { supabase } from './supabase.js';

window.addEventListener('DOMContentLoaded', async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) {
    alert('Debes iniciar sesión para continuar.');
    window.location.href = 'login.html';
    return;
  }

  // Obtener usuario_id desde la tabla usuarios
  const { data: usuario, error: usuarioError } = await supabase
    .from('usuarios')
    .select('usuario_id, nombre, apellidos')
    .eq('id_auth', user.id)
    .single();

  if (usuarioError || !usuario) {
    console.error('No se pudo obtener el usuario:', usuarioError);
    alert('Error al validar usuario.');
    window.location.href = 'dashboard.html';
    return;
  }

  const usuario_id = usuario.usuario_id;

  // Verificar si ya hay consentimiento firmado
  const { data: consentimiento } = await supabase
    .from('consentimientos')
    .select('consentimiento_id')
    .eq('usuario_id', usuario_id)
    .maybeSingle();

  if (consentimiento) {
    alert('Ya has firmado el consentimiento. Serás redirigido al dashboard.');
    window.location.href = 'dashboard.html';
    return;
  }

  // Si no hay consentimiento, rellenar campos
  document.getElementById('nombre_paciente').value = `${usuario.nombre} ${usuario.apellidos}`;
  document.getElementById('fecha').valueAsDate = new Date();

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

    const autorizado = document.querySelector('input[name="autorizacion"]:checked')?.value === 'autorizo';
    if (!autorizado) {
      alert('Debes autorizar el consentimiento para continuar.');
      return;
    }

    const { error: insertError } = await supabase.from('consentimientos').insert([
      {
        usuario_id: usuario_id,
        consentimiento_aceptado: true,
        id_auth: user.id
      }
    ]);

    if (insertError) {
      console.error('Error al guardar consentimiento:', insertError);
      alert('No se pudo guardar el consentimiento.');
    } else {
      alert('Consentimiento registrado con éxito.');
      window.location.href = 'dashboard.html';
    }
  });
});