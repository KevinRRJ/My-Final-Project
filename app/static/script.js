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
const link2 = document.getElementById("link2");
const link3 = document.getElementById("link3");


link1.addEventListener('click', () => {
    scrollToElement('.header');
});

link2.addEventListener('click', () => {
    // Scroll to the second element with "header" class
    scrollToElement('.header', 1);
});

link3.addEventListener('click', () => {
    scrollToElement('.column');
});



document.addEventListener('DOMContentLoaded',function(){
    document.getElementById('botonRegistro').addEventListener('click',function(){
        window.location.href='/registro';
    })
})

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
  
document.addEventListener('DOMContentLoaded',function(){
    document.getElementById('botonInicioSesión').addEventListener('click',function(){
        window.location.href='/InicioSesión';
    })
})