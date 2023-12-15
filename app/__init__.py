# __init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_socketio import SocketIO  # Importa el objeto SocketIO
from datetime import timedelta

db = SQLAlchemy()
login_manager = LoginManager()
socketio = SocketIO()  # Crea el objeto SocketIO

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tareas.db'
    app.config['SECRET_KEY'] = 'cfa2e9b33f51264821b11077258fd49f' 

    db.init_app(app)

    # Configuración del LoginManager
    login_manager.init_app(app)
    app.config['REMEMBER_COOKIE_DURATION'] = timedelta(days=7)  # Ejemplo: recuerda al usuario durante 7 días
    app.config['REMEMBER_COOKIE_SECURE'] = True  # Configura como True si estás usando HTTPS

    # Configuración de Flask-SocketIO
    socketio.init_app(app)

    with app.app_context():
        from app import models
        db.create_all()

    from app.routes import main, register_bp, login_bp, estadisticas_bp
    app.register_blueprint(main)
    app.register_blueprint(register_bp)
    app.register_blueprint(login_bp)
    app.register_blueprint(estadisticas_bp)

    return app