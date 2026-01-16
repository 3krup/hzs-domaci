from flask import Flask, request, jsonify, make_response, render_template, send_from_directory
import mysql.connector
from mysql.connector import Error as MySQLError
import jwt
import bcrypt
import datetime
from functools import wraps
import os
import sys
from werkzeug.utils import secure_filename
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import config

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.config['SECRET_KEY'] = config.SECRET_KEY
app.config['UPLOAD_FOLDER'] = config.UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = config.MAX_CONTENT_LENGTH

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/index.html')
def home_redirect():
    return render_template('index.html')

@app.route('/recepti.html')
def recipes_page():
    return render_template('recepti.html')

@app.route('/kreiranje.html')
def create_page():
    return render_template('kreiranje.html')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in config.ALLOWED_EXTENSIONS

def get_db_connection():
    try:
        conn = mysql.connector.connect(**config.DB_CONFIG)
        return conn
    except MySQLError as e:
        print(f"Error connecting to DB: {e}")
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')
        if not token:
            return jsonify({'message': 'Token nedostaje! Ulogujte se.'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token je istekao! Ulogujte se ponovo.'}), 401
        except Exception as e:
            return jsonify({'message': 'Token je neispravan!'}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email i lozinka su obavezni'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    conn = get_db_connection()
    if not conn: return jsonify({'message': 'Greška sa bazom'}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (email, password_hash) VALUES (%s, %s)", (email, hashed_password.decode('utf-8')))
        conn.commit()
        return jsonify({'message': 'Uspešna registracija!'}), 201
    except mysql.connector.IntegrityError:
        return jsonify({'message': 'Email već postoji!'}), 409
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, password_hash FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    conn.close()

    if user:
        user_id = user[0]
        stored_hash = user[1]
        if isinstance(stored_hash, bytearray): stored_hash = stored_hash.decode('utf-8')

        if bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
            token = jwt.encode({'user_id': user_id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, app.config['SECRET_KEY'], algorithm="HS256")
            resp = make_response(jsonify({'message': 'Uspešan login!'}))

            resp.set_cookie(
                'token',
                token,
                httponly=True,
                secure=False,
                samesite='Lax'
            )
            return resp
    return jsonify({'message': 'Pogrešan email ili lozinka'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    resp = make_response(jsonify({'message': 'Uspešan logout'}))
    resp.set_cookie('token', '', expires=0)
    return resp

@app.route('/my-recipes', methods=['GET'])
@token_required
def get_my_recipes(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    sql = """
          SELECT r.id, r.title, r.description, r.kcal, r.protein, r.fat, r.image_url, r.meal_type
          FROM recipes r
                   JOIN saved_recipes sr ON r.id = sr.recipe_id
          WHERE sr.user_id = %s
          """
    cursor.execute(sql, (current_user_id,))
    recipes = cursor.fetchall()
    conn.close()
    for recipe in recipes:
        if recipe['image_url']:
            recipe['image_url'] = request.url_root + 'static/uploads/' + recipe['image_url']
    return jsonify(recipes)

@app.route('/add-recipe', methods=['POST'])
@token_required
def add_recipe(current_user_id):
    if 'image' not in request.files:
        return jsonify({'message': 'Slika je obavezna!'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'message': 'Niste izabrali fajl'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        import time
        unique_filename = f"{int(time.time())}_{filename}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))

        title = request.form.get('title')
        description = request.form.get('description', '')
        steps = request.form.get('preparation_steps')
        difficulty = request.form.get('difficulty', 'Srednje')

        meal_type = request.form.get('meal_type')

        kcal = request.form.get('kcal', 0)
        protein = request.form.get('protein', 0)
        fat = request.form.get('fat', 0)
        ingredients_raw = request.form.get('ingredients', '')

        is_posno = 1 if request.form.get('is_posno') == '1' else 0
        is_halal = 1 if request.form.get('is_halal') == '1' else 0
        is_vegetarian = 1 if request.form.get('is_vegetarian') == '1' else 0
        is_vegan = 1 if request.form.get('is_vegan') == '1' else 0

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            sql = """
                  INSERT INTO recipes
                  (user_id, title, description, preparation_steps, difficulty, kcal, protein, fat, image_url, is_posno, is_halal, is_vegetarian, is_vegan, meal_type)
                  VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                  """
            cursor.execute(sql, (
                current_user_id, title, description, steps, difficulty, kcal, protein, fat, unique_filename, is_posno, is_halal, is_vegetarian, is_vegan, meal_type
            ))
            new_recipe_id = cursor.lastrowid

            if ingredients_raw:
                ingredient_list = [i.strip() for i in ingredients_raw.split('\n') if i.strip()]
                for ing_name in ingredient_list:
                    cursor.execute("SELECT id FROM ingredients WHERE name = %s", (ing_name,))
                    result = cursor.fetchone()
                    if result:
                        ing_id = result[0]
                    else:
                        cursor.execute("INSERT INTO ingredients (name) VALUES (%s)", (ing_name,))
                        ing_id = cursor.lastrowid
                    try:
                        cursor.execute("INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES (%s, %s)", (new_recipe_id, ing_id))
                    except mysql.connector.IntegrityError: pass

            conn.commit()
            return jsonify({'message': 'Recept uspešno dodat!'}), 201
        except MySQLError as e:
            return jsonify({'message': f'Greška u bazi: {e}'}), 500
        finally:
            conn.close()
    return jsonify({'message': 'Nedozvoljen format slike'}), 400

@app.route('/recipes', methods=['GET'])
def get_all_recipes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT *, is_vegetarian, is_vegan, is_posno, is_halal FROM recipes ORDER BY created_at DESC")
    recipes = cursor.fetchall()
    conn.close()
    for recipe in recipes:
        if recipe['image_url']:
            recipe['image_url'] = request.url_root + 'static/uploads/' + recipe['image_url']
    return jsonify(recipes)

@app.route('/recipes/<int:recipe_id>', methods=['DELETE'])
@token_required
def delete_recipe(current_user_id, recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, image_url FROM recipes WHERE id = %s", (recipe_id,))
    recipe = cursor.fetchone()
    if not recipe:
        conn.close()
        return jsonify({'message': 'Recept ne postoji'}), 404
    owner_id, image_filename = recipe
    if owner_id != current_user_id:
        conn.close()
        return jsonify({'message': 'Nemate dozvolu'}), 403
    try:
        if image_filename:
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
            if os.path.exists(image_path): os.remove(image_path)
        cursor.execute("DELETE FROM recipes WHERE id = %s", (recipe_id,))
        conn.commit()
        return jsonify({'message': 'Recept obrisan'}), 200
    except MySQLError as e:
        return jsonify({'message': f'Greška: {e}'}), 500
    finally:
        conn.close()

@app.route('/recipes/<int:recipe_id>/save', methods=['POST'])
@token_required
def save_recipe(current_user_id, recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO saved_recipes (user_id, recipe_id) VALUES (%s, %s)", (current_user_id, recipe_id))
        conn.commit()
        return jsonify({'message': 'Recept sačuvan!'}), 201
    except mysql.connector.IntegrityError:
        return jsonify({'message': 'Već sačuvan'}), 409
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/recipes/<int:recipe_id>/save', methods=['DELETE'])
@token_required
def unsave_recipe(current_user_id, recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM saved_recipes WHERE user_id = %s AND recipe_id = %s", (current_user_id, recipe_id))
        conn.commit()
        return jsonify({'message': 'Uklonjen iz sačuvanih'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/search', methods=['GET'])
def search_recipes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    ingredients_input = request.args.get('ingredients')
    difficulty = request.args.get('difficulty')
    is_posno = request.args.get('posno')
    is_halal = request.args.get('halal')
    is_vegetarian = request.args.get('vegetarian')
    is_vegan = request.args.get('vegan')
    max_time = request.args.get('max_time')

    meal_type = request.args.get('meal_type')
    max_calories = request.args.get('max_calories')

    sql = "SELECT DISTINCT r.*, r.is_vegetarian, r.is_vegan, r.is_posno, r.is_halal FROM recipes r"
    params = []
    conditions = []

    if ingredients_input:
        sql += " JOIN recipe_ingredients ri ON r.id = ri.recipe_id"
        sql += " JOIN ingredients i ON ri.ingredient_id = i.id"
        import re
        ingredient_list = [x.strip() for x in re.split(r'[,\s]+', ingredients_input) if x.strip()]
        if ingredient_list:
            placeholders = ','.join(['%s'] * len(ingredient_list))
            conditions.append(f"i.name IN ({placeholders})")
            params.extend(ingredient_list)

    if difficulty and difficulty != '':
        diff_map = {'lako': 'Lako', 'srednje': 'Srednje', 'tesko': 'Teško'}
        val = diff_map.get(difficulty.lower(), difficulty)
        conditions.append("r.difficulty = %s")
        params.append(val)

    if is_posno == '1' or is_posno == 'true':
        conditions.append("r.is_posno = 1")

    if is_halal == '1' or is_halal == 'true':
        conditions.append("r.is_halal = 1")

    if is_vegetarian == '1' or is_vegetarian == 'true':
        conditions.append("r.is_vegetarian = 1")

    if is_vegan == '1' or is_vegan == 'true':
        conditions.append("r.is_vegan = 1")

    if max_time:
        conditions.append("r.prep_time_minutes <= %s")
        params.append(max_time)

    if meal_type and meal_type != '':
        conditions.append("r.meal_type = %s")
        params.append(meal_type)

    if max_calories:
        conditions.append("r.kcal <= %s")
        params.append(max_calories)

    if conditions:
        sql += " WHERE " + " AND ".join(conditions)

    sql += " ORDER BY r.created_at DESC"

    try:
        cursor.execute(sql, tuple(params))
        recipes = cursor.fetchall()
        for recipe in recipes:
            if recipe['image_url']:
                recipe['image_url'] = request.url_root + 'static/uploads/' + recipe['image_url']
        return jsonify(recipes)
    except MySQLError as e:
        return jsonify({'message': f'Database error: {e}'}), 500
    finally:
        conn.close()

@app.route('/ingredients', methods=['GET'])
def get_all_ingredients():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT name FROM ingredients ORDER BY name ASC")
        ingredients = cursor.fetchall()
        ingredient_list = [item['name'] for item in ingredients]
        return jsonify(ingredient_list)
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        conn.close()

@app.route('/saved-recipes', methods=['GET'])
@token_required
def get_saved_recipes(current_user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cursor = conn.cursor(dictionary=True)

    sql = """
          SELECT r.id, r.title, r.description, r.preparation_steps, r.difficulty, r.kcal, r.protein, r.fat,
                 r.image_url, r.meal_type, r.is_vegetarian, r.is_vegan, r.is_posno, r.is_halal
          FROM recipes r
                   JOIN saved_recipes sr ON r.id = sr.recipe_id
          WHERE sr.user_id = %s
          ORDER BY sr.saved_at DESC
          """

    try:
        cursor.execute(sql, (current_user_id,))
        recipes = cursor.fetchall()

        for recipe in recipes:
            if recipe['image_url']:
                recipe['image_url'] = request.url_root + 'static/uploads/' + recipe['image_url']

        return jsonify(recipes)
    except MySQLError as e:
        return jsonify({'message': f'Database error: {e}'}), 500
    finally:
        conn.close()

@app.route('/my-created-recipes', methods=['GET'])
@token_required
def get_created_recipes(current_user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'message': 'Database connection failed'}), 500
    cursor = conn.cursor(dictionary=True)

    sql = """
          SELECT r.*, r.is_vegetarian, r.is_vegan, r.is_posno, r.is_halal
          FROM recipes r
          WHERE r.user_id = %s
          ORDER BY r.created_at DESC
          """

    try:
        cursor.execute(sql, (current_user_id,))
        recipes = cursor.fetchall()

        for recipe in recipes:
            if recipe['image_url']:
                recipe['image_url'] = request.url_root + 'static/uploads/' + recipe['image_url']

        return jsonify(recipes)
    except MySQLError as e:
        return jsonify({'message': f'Database error: {e}'}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=config.DEBUG)