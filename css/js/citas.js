// js/citas.js
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verificar sesión
  const session = supabase.auth.session();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }
  const userId = session.user.id;

  // 2. Cargar citas al iniciar
  await fetchCitas(userId);

  // 3. Formulario para programar nueva cita
  const form = document.getElementById('new-cita-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await programarCita(userId);
  });

  // 4. Logout
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  });
});

/**
 * Lee las citas desde Supabase y las muestra
 */
async function fetchCitas(userId) {
  const { data: citas, error } = await supabase
    .from('citas')
    .select('*')
    .eq('usuario_id', userId)
    .order('fecha_hora', { ascending: true });

  if (error) {
    console.error('Error al leer citas:', error.message);
    return;
  }
  displayCitas(citas);
}

/**
 * Renderiza la lista de citas en el elemento #citas-list
 */
function displayCitas(citas) {
  const list = document.getElementById('citas-list');
  list.innerHTML = '';

  if (!citas.length) {
    list.innerHTML = '<p>No tienes citas programadas.</p>';
    return;
  }

  citas.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${new Date(c.fecha_hora).toLocaleString()}</strong>
       — ${c.motivo} (${c.tipo_cita})
      <button class="cancel-btn" data-id="${c.cita_id}">Cancelar</button>
    `;
    list.appendChild(li);
  });

  // Asignar evento de cancelar
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const citaId = btn.dataset.id;
      if (!confirm('¿Deseas cancelar esta cita?')) return;
      const { error } = await supabase
        .from('citas')
        .update({ estado: 'cancelada' })
        .eq('cita_id', citaId);

      if (error) {
        alert('Error al cancelar: ' + error.message);
      } else {
        alert('Cita cancelada.');
        // Refrescar listado
        const session = supabase.auth.session();
        await fetchCitas(session.user.id);
      }
    });
  });
}

/**
 * Toma los datos del formulario y los inserta en la tabla citas
 */
async function programarCita(userId) {
  const fechaHora = document.getElementById('fechaHora').value;
  const motivo    = document.getElementById('motivo').value;
  const tipoCita  = document.getElementById('tipoCita').value;

  const { data, error } = await supabase
    .from('citas')
    .insert([
      {
        usuario_id: userId,
        fecha_hora: fechaHora,
        motivo: motivo,
        estado: 'agendada',
        tipo_cita: tipoCita
      }
    ]);

  if (error) {
    alert('Error al programar cita: ' + error.message);
  } else {
    alert('Cita programada correctamente.');
    document.getElementById('new-cita-form').reset();
    await fetchCitas(userId);
  }
}