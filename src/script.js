document.addEventListener('DOMContentLoaded', () => {
  const pass = document.getElementById('pass');
  const eye  = document.querySelector('.eye-btn');
  if (!pass || !eye) return;  

  eye.addEventListener('click', () => {
    const showing = pass.type === 'text';
    console.log(showing)
    // alterna tipo
    pass.type = showing ? 'password' : 'text';
    // alterna ícone e aria
    eye.classList.toggle('active', !showing);
    eye.setAttribute('aria-pressed', String(!showing));
  });
});
