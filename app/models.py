# app/models.py

from datetime import datetime
from flask_login import UserMixin
from . import db, login_manager
import hashlib


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(100), nullable=False)
    salt = db.Column(db.LargeBinary(16), nullable=False)
    birthdate = db.Column(db.Date, nullable=True)
    remember_me = db.Column(db.Boolean, default=False)
    tasks = db.relationship('Task', backref='user', lazy=True)

    def get_id(self):
        return str(self.id)  # Convertir el ID a una cadena
    
    def check_password(self, password):
        # Lógica para verificar la contraseña, utilizando tu método personalizado
        input_password_hash = hashlib.sha256((password + self.salt.hex()).encode('utf-8')).hexdigest()
        return input_password_hash == self.password_hash


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    due_date = db.Column(db.Date)
    task_type = db.Column(db.String(50))
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.Date, default=datetime.utcnow().date)

    def __repr__(self):
        return f"Task('{self.title}', '{self.description}', '{self.due_date}', '{self.task_type}', '{self.completed}')"


class Routine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(255))
    # Otros campos según tus necesidades

    def __repr__(self):
        return f"<Routine {self.title}>"
    


