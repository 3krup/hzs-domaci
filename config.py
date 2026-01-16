import os

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('FLASK_DEBUG', 'False') == 'True'

DB_CONFIG = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'database': os.getenv('DB_NAME', 'fitplate')
}

# Upload Settings
UPLOAD_FOLDER = 'static/uploads'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}