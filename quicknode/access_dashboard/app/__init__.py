# app/__init__.py
from flask import Flask
from flask_bootstrap import Bootstrap
import os

def create_app():
    app = Flask(__name__, template_folder=os.path.abspath('templates'))
    Bootstrap(app)

    with app.app_context():
        # Import routes
        from . import routes

        return app
