// js/registro.js
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form')

  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault()
      await signUpUser()
    })
  }
})

async function signUpUser() {
  const nombre = document.getElementById('nombre').value.trim()
  const apellidos = document.getElementById('apellidos').value.trim()
  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value
  const confirm = document.getElementById('confirm').value

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&/#()=+._-])[A-Za-z\d@$!%*?&/#()=+._-]{8,}$/

  if (!emailRegex.test(email)) {
    alert('Ingresa un correo electrónico válido.')
    return
  }

  if (!passwordRegex.test(password)) {
    alert('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.')
    return
  }

  if (password !== confirm) {
    alert('Las contraseñas no coinciden.')
    return
  }

  const { data, error: signupError } = await supabase.auth.signUp({ email, password })
  const userId = data?.user?.id

  if (signupError || !userId) {
    alert(`Error al registrarse: ${signupError?.message || 'No se obtuvo ID de usuario'}`)
    return
  }

  const { error: insertError } = await supabase
    .from('usuarios')
    .insert({ id_auth: userId, nombre, apellidos })

  if (insertError) {
    alert(`Usuario creado, pero error al guardar en tabla usuarios: ${insertError.message}`)
  } else {
    alert('Registro exitoso. Revisa tu correo para confirmar tu cuenta.')
    window.location.href = 'login.html'
  }
}