from flask import Blueprint, request, jsonify, render_template, url_for, flash, redirect, json
from flask_login import login_user, logout_user, login_required, current_user
import sqlite3
import hashlib
import os
from werkzeug.security import generate_password_hash, check_password_hash
from .models import db, User,Task, Routine
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from . import socketio, db
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler





# Crear blueprints
register_bp = Blueprint('register', __name__)
login_bp = Blueprint('login', __name__)
main = Blueprint('main', __name__)
estadisticas_bp = Blueprint('estadisticas', __name__)

# Configuración secreta para la generación de tokens
SECRET_KEY = "cfa2e9b33f51264821b11077258fd49f"

@register_bp.route('/register', methods=['POST'])
def register():
    print("Entré a la función de registro")

    try:
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        email = request.form.get('email')
        birthdate_str = request.form.get('birthdate')

        print(f"Datos del formulario - Usuario: {username}, Contraseña: {password}, Email: {email}, Fecha de nacimiento: {birthdate_str}")

        # Validación de contraseñas coincidentes
        if password != confirm_password:
            return jsonify({'message': 'Passwords do not match'}), 400

        # Validación de la fecha de nacimiento
        try:
            birthdate = datetime.strptime(birthdate_str, '%d-%m-%Y').date()
        except ValueError:
            return jsonify({'message': 'Invalid birthdate format'}), 400

        if not username or not password or not email:
            return jsonify({'message': 'Must provide username, password, and email'}), 400

        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(username=username).first()

        if existing_user:
            error_message = 'El usuario que intentas registrar ya existe'
            return render_template('registro.html', error_message=error_message)

        # Generar salt
        salt = os.urandom(16)
        salted_password = hashlib.sha256((password + salt.hex()).encode('utf-8')).hexdigest()

        # Crear un nuevo usuario
        new_user = User(username=username, password_hash=salted_password, salt=salt, email=email, birthdate=birthdate)

        # Añadir el nuevo usuario a la sesión y hacer commit
        db.session.add(new_user)
        db.session.commit()

        print("Usuario registrado exitosamente")

        return render_template('registro.html', success_message='Registro exitoso.', login_url=url_for('main.log_in'))

        return jsonify({'message': 'User registered successfully'}), 201
    except IntegrityError as e:
        db.session.rollback()  # Deshacer la transacción
        print(f'Error durante el registro: {str(e)}')
        error_message = 'El email que intentas registrar ya tiene una cuenta'  # Mensaje específico para el error de clave única
        return render_template('registro.html', error_message=error_message)
    except Exception as e:
        db.session.rollback()  # Deshacer la transacción en caso de otro error
        print(f'Error durante el registro: {str(e)}')
        return jsonify({'message': f'Error during registration: {str(e)}'}), 500


    
@login_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        remember_me = 'remember_me' in request.form

        user = User.query.filter_by(username=username).first()

        if user:
            # Imprime el valor de remember_me para depuración
            print(f"Valor de remember_me: {remember_me}")

            # Aplica el mismo proceso de hasheo al intentar iniciar sesión
            input_password_hash = hashlib.sha256((password + user.salt.hex()).encode('utf-8')).hexdigest()

            if input_password_hash == user.password_hash:
                login_user(user, remember=remember_me)
                return redirect(url_for('main.principal'))

        flash('Inicio de sesión fallido. Verifica tu usuario y contraseña.', 'danger')
        return redirect(url_for('login.login'))

    return render_template('InicioSesión.html')


@login_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))

@main.route('/principal')
@login_required
def principal():
    # Verifica si el usuario está autenticado
    if current_user.is_authenticated:
        # Accede a los atributos del usuario actual
        username = current_user.username
        email = current_user.email

        # Aquí puedes realizar acciones adicionales según las necesidades de tu aplicación

        # Renderiza la plantilla y pasa la información del usuario
        return render_template('principal.html', username=username, email=email)
    else:
        # En caso de que no haya un usuario autenticado (esto debería manejarse según tus requerimientos)
        return redirect(url_for('login.login'))  # Puedes redirigir al usuario a la página de inicio de sesión


# Ruta para la página principal
@main.route('/')
def index():
    return render_template('index.html')

@main.route('/registro')
def formulario():
    return render_template('registro.html')


@main.route('/InicioSesión')
def log_in():
    return render_template('InicioSesión.html')

@main.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index'))







@main.route('/create_task', methods=['POST'])
@login_required
def create_task():
    try:
        data = request.get_json()

        title = data.get('titulo')
        description = data.get('descripcion')
        due_date_str = data.get('fecha')
        due_date = datetime.strptime(due_date_str, '%Y-%m-%d') if due_date_str else None
        task_type = data.get('tipo')

        if not title or not description or not task_type:
            return jsonify({'message': 'Debe proporcionar título, descripción y tipo para la tarea'}), 400

        # Crear una nueva tarea asociada al usuario actual
        new_task = Task(
            user_id=current_user.id,
            title=title,
            description=description,
            due_date=due_date,
            task_type=task_type
        )

        db.session.add(new_task)
        db.session.commit()

        return jsonify({'message': 'Tarea creada exitosamente'}), 201

    except Exception as e:
        db.session.rollback()
        print(f'Error al crear la tarea: {str(e)}')
        return jsonify({'message': f'Error al crear la tarea: {str(e)}'}), 500
    

@main.route('/get_pending_tasks', methods=['GET'])
@login_required
def get_pending_tasks():
    user_id = current_user.id
    pending_tasks = Task.query.filter_by(user_id=user_id, completed=False).all()

    tasks_data = []
    for task in pending_tasks:
        tasks_data.append({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'due_date': task.due_date.strftime('%Y-%m-%d') if task.due_date else None,
            'task_type': task.task_type
        })

    return jsonify({'tasks': tasks_data})

@main.route('/tareas_pendientes', methods=['GET'])
@login_required
def mostrar_tareas_pendientes():
    user_id = current_user.id
    pending_tasks = Task.query.filter_by(user_id=user_id, completed=False).all()
    return render_template('principal.html', tareas=pending_tasks)

@main.route('/complete_task/<int:task_id>', methods=['PUT'])
@login_required
def complete_task(task_id):
    try:
        task = Task.query.get(task_id)
        task.completed = True
        db.session.commit()
        return jsonify({'message': 'Task completed successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

def delete_user_data(user_id):
    # Elimina todas las tareas del usuario
    Task.query.filter_by(user_id=user_id).delete()

    # Elimina todos los hábitos del usuario
    Routine.query.filter_by(user_id=user_id).delete()

    # Realiza la confirmación para aplicar los cambios
    db.session.commit()

@main.route('/eliminar_cuenta', methods=['GET', 'POST'])
@login_required
def eliminar_cuenta():
    if request.method == 'POST':
        # Verifica que la contraseña proporcionada sea válida
        if current_user.check_password(request.form['password']):
            # Elimina los datos asociados al usuario (implementa esta función)
            delete_user_data(current_user.id)

            # Elimina el usuario de la base de datos
            db.session.delete(current_user)
            db.session.commit()

            flash('Tu cuenta ha sido eliminada correctamente.', 'success')
            
            # Redirige al usuario a la página principal después de eliminar la cuenta
            return redirect(url_for('main.index'))
        else:
            flash('La contraseña es incorrecta. Inténtalo de nuevo.', 'danger')

    return render_template('principal.html')

def delete_user_data(user_id):
    # Elimina todas las tareas del usuario
    Task.query.filter_by(user_id=user_id).delete()

    # Elimina todos los hábitos del usuario
    Routine.query.filter_by(user_id=user_id).delete()

    # Realiza la confirmación para aplicar los cambios
    db.session.commit()




# Definir la función para calcular la edad
def calcular_edad(fecha_nacimiento):
    hoy = datetime.now()
    edad = hoy.year - fecha_nacimiento.year - ((hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day))
    return edad

# Ruta para mostrar tareas agrupadas
@main.route('/tareas_agrupadas', methods=['GET'])
@login_required
def mostrar_tareas_agrupadas():
    user_id = current_user.id
    user = User.query.get(user_id)

    # Obtener todas las tareas del usuario
    all_tasks = Task.query.filter_by(user_id=user_id).all()

    task_data = {'id': [], 'title': [], 'description': [], 'due_date': [], 'task_type': [], 'birthdate': []}

    for task in all_tasks:
        task_data['id'].append(task.id)
        task_data['title'].append(task.title)
        task_data['description'].append(task.description)
        task_data['due_date'].append(task.due_date.strftime('%Y-%m-%d') if task.due_date else None)
        task_data['task_type'].append(task.task_type)

        # Convertir el atributo birthdate a formato de fecha
        task_data['birthdate'].append(pd.to_datetime(task.user.birthdate).date() if task.user.birthdate else None)

    df_tasks = pd.DataFrame(task_data)

    # Calcular la edad dinámicamente para todas las tareas
    df_tasks['edad'] = df_tasks['birthdate'].apply(calcular_edad)

    # Crear nuevas columnas y asignar valores
    df_tasks['task_work'] = df_tasks['task_type'].apply(lambda x: 1 if x == 'work' else 0)
    df_tasks['task_school'] = df_tasks['task_type'].apply(lambda x: 1 if x == 'school' else 0)
    df_tasks['task_personal'] = df_tasks['task_type'].apply(lambda x: 1 if x == 'personal' else 0)

    # Seleccionar las columnas relevantes para el clustering
    X = df_tasks[['edad', 'task_work', 'task_school', 'task_personal']]

    # Escalar los datos para el algoritmo KMeans
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Aplicar KMeans con 3 clusters (ajusta según tus necesidades)
    kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
    df_tasks['Cluster'] = kmeans.fit_predict(X_scaled)

    # Obtener información sobre los clusters
    cluster_summary = df_tasks['Cluster'].value_counts().to_dict() if 'Cluster' in df_tasks.columns else {}
    print("Cluster Summary:", cluster_summary)
    # Obtener datos específicos para el gráfico
    labels = list(cluster_summary.keys())
    data = list(cluster_summary.values())

   # Convertir a cadenas JSON
    labels_json = json.dumps(labels)
    data_json = json.dumps(data)

    # Antes de renderizar la plantilla
    print("Labels JSON:", labels_json)
    print("Data JSON:", data_json)

    # Renderizar la plantilla y pasar solo las cadenas JSON necesarias
    return render_template('principal.html', labels_json=labels_json, data_json=data_json)