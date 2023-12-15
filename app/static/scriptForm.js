

function validateForm() {
    var password = document.getElementById('password').value;
    var confirm_password = document.getElementById('confirm_password').value;

    if (password !== confirm_password) {
        document.getElementById('passwordError').innerText = 'Las contraseñas no coinciden.';
        return false;
    } else {
        document.getElementById('passwordError').innerText = '';
        return true;
    }
}

function scrollToElement(elementSelector, instance = 0) {
    // Select all elements that match the given selector
    const elements = document.querySelectorAll(elementSelector);
    // Check if there are elements matching the selector and if the requested instance exists
    if (elements.length > instance) {
        // Scroll to the specified instance of the element
        elements[instance].scrollIntoView({ behavior: 'smooth' });
    }
}

const link1 = document.getElementById("link1");


link1.addEventListener('click', () => {
    scrollToElement('.header');
});

//Evento que avisa cuando estan activadas las mayusculas
document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const capsLockMessage = document.getElementById('capsLockMessage');

    function isCapsLockOn(event) {
        return event.getModifierState('CapsLock');
    }

    function checkCapsLockWarning(inputElement, messageElement, event) {
        const isCapsLockActive = isCapsLockOn(event);

        if (isCapsLockActive) {
            messageElement.style.display = 'block';
            inputElement.classList.add('caps-lock-on');
        } else {
            messageElement.style.display = 'none';
            inputElement.classList.remove('caps-lock-on');
        }
    }

    passwordInput.addEventListener('keydown', function (event) {
        checkCapsLockWarning(passwordInput, capsLockMessage, event);
    });

    confirmPasswordInput.addEventListener('keydown', function (event) {
        checkCapsLockWarning(confirmPasswordInput, capsLockMessage, event);
    });
});


//icono de revelar contraseña
document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const togglePasswordButton = document.getElementById('togglePassword');
    const toggleConfirmPasswordButton = document.getElementById('toggleConfirmPassword');

    togglePasswordButton.addEventListener('click', function () {
        togglePasswordVisibility(passwordInput, togglePasswordButton);
    });

    toggleConfirmPasswordButton.addEventListener('click', function () {
        togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordButton);
    });
});

function togglePasswordVisibility(inputField, toggleButton) {
    const type = inputField.type === 'password' ? 'text' : 'password';
    inputField.type = type;
    
    // Cambiar el icono basado en el tipo de contraseña
    toggleButton.className = type === 'password' ? 'bx bx-hide' : 'bx bx-show';
}

//validacion de fecha de nacimiento
$(document).ready(function () {
    // Inicializar el datepicker con jQuery UI
    $("#birthdate").datepicker({
        dateFormat: 'dd-mm-yy',
        maxDate: 'today',
        yearRange: 'c-100:c',
        changeYear: true,
    });

    // Activar el datepicker al hacer clic en el ícono
     $("#birthdate-icon").click(function () {
        $("#birthdate").datepicker("show");
    });

    // Validar la fecha antes de enviar el formulario
    $("form").submit(function (event) {
        const selectedDate = new Date($("#birthdate").val());
        const today = new Date();
        if (selectedDate > today) {
            alert("La fecha de nacimiento no puede ser en el futuro. Por favor, selecciona una fecha válida.");
            event.preventDefault(); // Evitar el envío del formulario
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('botonInicioSesión').addEventListener('click', function() {
        window.location.href = '/InicioSesión';
    });
});


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