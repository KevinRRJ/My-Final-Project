const body = document.querySelector("body"),
      sidebar = body.querySelector(".sidebar"),
      toggle = body.querySelector(".toggle"),
      searchBtn = body.querySelector(".search-box"),
      modeSwitch = body.querySelector(".toggle-switch"),
      modeText = body.querySelector(".mode-text");

// Obtener el estado del modo oscuro desde localStorage
const isDarkMode = localStorage.getItem("darkMode");

// Aplicar el modo oscuro si está activado
if (isDarkMode === "true") {
  body.classList.add("dark");
  modeText.innerText = "Light Mode";
}

toggle.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});

modeSwitch.addEventListener("click", () => {
  // Alternar el modo oscuro en el body
  body.classList.toggle("dark");

  // Obtener el estado actual del modo oscuro
  const currentMode = body.classList.contains("dark");

  // Guardar el estado del modo oscuro en localStorage
  localStorage.setItem("darkMode", currentMode.toString());

  // Cambiar el texto del modo según el estado actual
  modeText.innerText = currentMode ? "Light Mode" : "Dark Mode";
});


//Eventos para la sidebar
function scrollToElement(elementSelector, instance = 0) {
  const elements = document.querySelectorAll(elementSelector);

  if (elements.length > instance) {
    elements[instance].scrollIntoView({ behavior: 'smooth' });
  }
}

const inicio = document.getElementById("inicio");
const tareas = document.getElementById("tareas");
const habitos = document.getElementById("habitos");
const estadisticas = document.getElementById("estadisticas");
const configuraciones = document.getElementById("configuraciones");



inicio.addEventListener('click', (event) => {
  event.preventDefault();
  scrollToElement('.main-content');
});

tareas.addEventListener('click', (event) => {
  event.preventDefault();
  scrollToElement('.agregar-tareas');
});

habitos.addEventListener('click', (event) => {
  event.preventDefault();
  scrollToElement('.agregar-habitos');
});

estadisticas.addEventListener('click', (event) => {
  event.preventDefault();
  scrollToElement('.ver-estadisticas');
});

configuraciones.addEventListener('click', (event) => {
  event.preventDefault();
  scrollToElement('.configuraciones');
});



document.addEventListener('DOMContentLoaded', function () {
  var formularioTarea = document.getElementById("formulario-tarea");
  var tareasContainer = document.getElementById("tareas-container");

  ocultarFormulario(); // Ocultar el formulario inicialmente

  function mostrarFormulario() {
    formularioTarea.style.display = "block";
  }

  function ocultarFormulario() {
    formularioTarea.style.display = "none";
  }

  // Función para completar una tarea
  function completarTarea(id) {
    // Enviar una solicitud al servidor para marcar la tarea como completada
    fetch(`/complete_task/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al completar la tarea');
      }
      return response.json();
    })
    .then(data => {
      // Aquí puedes manejar la respuesta del servidor, por ejemplo, eliminar la tarjeta del DOM
      console.log('Tarea completada:', data);

      // Eliminar la tarjeta del DOM
      var tareaCompletada = document.getElementById(id);
      tareaCompletada.remove();
    })
    .catch((error) => {
      console.error(error);
    });
  }

  // Agregar evento clic al botón para mostrar el formulario
  var mostrarFormularioBtn = document.getElementById('mostrar-formulario-btn');
  mostrarFormularioBtn.addEventListener('click', function (event) {
    event.stopPropagation(); // Evitar la propagación del evento al cuerpo del documento
    mostrarFormulario();
  });

  // Agregar evento clic al botón de envío del formulario
  var agregarTareaBtn = document.getElementById('agregar-tarea-btn');
  agregarTareaBtn.addEventListener('click', function (event) {
    event.preventDefault(); // Evitar el envío del formulario por defecto

    // Obtener datos del formulario
    var titulo = document.getElementById("titulo").value;
    var descripcion = document.getElementById("descripcion").value;
    var fecha = document.getElementById("fecha").value;
    var tipo = document.getElementById("tipo").value;

    // Enviar datos al servidor usando Fetch
    fetch('/create_task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titulo: titulo,
        descripcion: descripcion,
        fecha: fecha,
        tipo: tipo,
      }),
    })
    .then(response => response.json())
    .then(data => {
      // Aquí puedes manejar la respuesta del servidor, por ejemplo, agregar la tarea al DOM
      console.log('Tarea creada:', data);

      // Crear una nueva tarjeta con los datos del formulario
      var nuevaTarjeta = document.createElement("div");
      nuevaTarjeta.classList.add("tarea-card");
      nuevaTarjeta.id = data.id; // Asignar un ID único a la tarjeta
      nuevaTarjeta.innerHTML = `
        <h3>${titulo}</h3>
        <p>${descripcion}</p>
        <p>Fecha de vencimiento: ${fecha}</p>
        <p>Tipo: ${tipo}</p>
        <button type="button" class="btn btn-success btn-completar"><i class="bx bx-check"></i> Completar</button>
      `;

      // Agregar evento clic al botón de completar
      var btnCompletar = nuevaTarjeta.querySelector('.btn-completar');
      btnCompletar.addEventListener('click', function () {
        completarTarea(data.id);
      });

      // Agregar la nueva tarjeta al contenedor de tarjetas
      tareasContainer.appendChild(nuevaTarjeta);

      // Ocultar el formulario después de agregar la tarjeta
      ocultarFormulario();
    })
    .catch((error) => {
      console.error('Error al agregar tarea:', error);
    });
  });

  // Función para cargar las tareas pendientes al cargar la página
  function cargarTareasPendientes() {
    fetch('/get_pending_tasks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      // Aquí puedes manejar la respuesta del servidor y agregar las tarjetas al DOM
      console.log('Tareas pendientes:', data);

      // Recorrer las tareas y agregar tarjetas al contenedor
      data.tasks.forEach(task => {
        var nuevaTarjeta = document.createElement("div");
        nuevaTarjeta.classList.add("tarea-card");
        nuevaTarjeta.id = task.id; // Asignar un ID único a la tarjeta
        nuevaTarjeta.innerHTML = `
          <h3>${task.title}</h3>
          <p>${task.description}</p>
          <p>Fecha de vencimiento: ${task.due_date}</p>
          <p>Tipo: ${task.task_type}</p>
          <button type="button" class="btn btn-success btn-completar"><i class="bx bx-check"></i> Completar</button>
        `;

        // Agregar evento clic al botón de completar
        var btnCompletar = nuevaTarjeta.querySelector('.btn-completar');
        btnCompletar.addEventListener('click', function () {
          completarTarea(task.id);
        });

        // Agregar la nueva tarjeta al contenedor de tarjetas
        tareasContainer.appendChild(nuevaTarjeta);
      });
    })
    .catch((error) => {
      console.error('Error al cargar tareas pendientes:', error);
    });
  }

  // Llamar a la función para cargar tareas pendientes al cargar la página
  cargarTareasPendientes();
});

document.addEventListener('DOMContentLoaded', function listener() {
  // Hacer una petición a la ruta /tareas_agrupadas
  fetch('/tareas_agrupadas')
    .then(response => response.json())
    .then(data => {
      console.log(data); // Verificar los datos en la consola
      // Aquí puedes agregar lógica adicional para manejar los datos recibidos
    })
    .catch(error => console.error('Error al obtener datos:', error))
    .finally(() => {
      // Desactivar la escucha después de la primera ejecución
      document.removeEventListener('DOMContentLoaded', listener);
    });
});



// Obtener el contexto del canvas
var ctx = document.getElementById('clusterChart').getContext('2d');

// Configuraciones del gráfico
var chartConfig = {
  type: 'bar',  // Puedes ajustar el tipo de gráfico según tus necesidades
  data: {
    labels: labels,
    datasets: [{
      label: 'Tareas por Cluster',
      data: data,
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        // ... Puedes agregar más colores según la cantidad de clusters
      ],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        // ... Puedes agregar más colores según la cantidad de clusters
      ],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,  // Esto permite especificar el ancho y alto
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
};

// Crear el gráfico utilizando Chart.js
var myChart = new Chart(ctx, chartConfig);
