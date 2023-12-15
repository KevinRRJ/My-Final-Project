document.addEventListener('DOMContentLoaded',function(){
    document.getElementById('botonRegistro').addEventListener('click',function(){
        window.location.href='/registro';
    })
})


//icono de revelar contraseña
document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('password');
    const togglePasswordButton = document.getElementById('togglePassword');

    togglePasswordButton.addEventListener('click', function () {
        togglePasswordVisibility(passwordInput, togglePasswordButton);
    });
});

function togglePasswordVisibility(inputField, toggleButton) {
    const type = inputField.type === 'password' ? 'text' : 'password';
    inputField.type = type;
    
    // Cambiar el icono basado en el tipo de contraseña
    toggleButton.className = type === 'password' ? 'bx bx-hide' : 'bx bx-show';
}

document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('mousemove', function(e) {
        setTimeout(function() {
            const trail = document.createElement('div');
            trail.className = 'trail';
            trail.style.left = (e.pageX - 5) + 'px';
            trail.style.top = (e.pageY - 5) + 'px';
            
            // Establecer z-index inferior al de los botones
            trail.style.zIndex = '-1'; 

            document.body.appendChild(trail);

            setTimeout(function() {
                trail.remove();
            }, 150);

            // Hacer el rastro transparente para eventos del mouse
            trail.style.pointerEvents = 'none';
        }, 250); // Retrasa la creación 
    });
});