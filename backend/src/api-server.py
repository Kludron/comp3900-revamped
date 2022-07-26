from hashlib import sha256
import psycopg2
import sys
from datetime import datetime, timedelta, timezone
import json
from flask import (
    Flask,
    request,
    jsonify
)
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
    JWTManager
)
import smtplib, ssl
from flask_cors import CORS, cross_origin

from utils.authentication import *
from utils.searching import *

api = Flask(__name__)
api.config["JWT_SECRET_KEY"] = JWT_KEY # Randomly Generated
api.config["JWT_ACCESS_TOKEN_EXPIRES"] = JWT_EXPIRY
api.config["JWT_TOKEN_LOCATION"] = 'headers'
api.config["JWT_FORM_KEY"] = 'token'

# Command to access the database
# psql -h 45.77.234.200 -U comp3900_user -d comp3900db
# yckAPfc9MX42N4

try:
    conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
    cursor = conn.cursor()
except Exception as e:
    sys.stderr.write("An error occurred while connecting to the database:\n{}\n".format(e))

jwt = JWTManager(api)

@api.route('/auth/login', methods=['POST'])
@cross_origin()
def login():
    return auth_login(request.get_data(), cursor)

@api.route('/auth/register', methods=['POST'])
@cross_origin()
def register():
    return auth_register(request.get_data(), cursor, conn)

@api.route('/auth/change-password', methods=['PUT'])
@jwt_required()
@cross_origin()
def change_password():
    return auth_change_password(request.get_data(), get_jwt_identity(), cursor, conn)

@api.route('/auth/change-username', methods=['PUT'])
@jwt_required()
@cross_origin()
def change_username():
    return auth_change_username(request.get_data(), get_jwt_identity(), cursor, conn)

@api.route('/auth/reset', methods=['POST'])
@cross_origin()
def reset():
    auth_forgot_password(request.get_data())

@api.route('/search', methods=['POST', 'GET'])
@cross_origin()
def search():
    return search_general(request.method, request.get_data(), cursor)

# Need to test this
@api.route('/profile', methods=['GET', 'PUT']) # Route tbc later
@jwt_required() # Apparently this should check whether or not the jwt is valid? # Required in request header: {"Authorization":"Bearer <token>}"
@cross_origin()
def profile():
    response = {}
    if request.method == 'GET':
        email = get_jwt_identity()
        query = """
        SELECT u.id, u.username, u.email, u.points FROM users u WHERE lower(u.email)=%s;
        """
        cursor.execute(query, (email,))
        try:
            u_id, username, email, points = cursor.fetchone()
        except TypeError:
            return {'msg' : 'Authentication Error'}, 403

        # Grab Bookmarks
        cursor.execute("""
            SELECT r.name, r.description, c.name, m.name, r.servingSize
            FROM recipes r
                JOIN cuisines c ON c.id=r.cuisine
                JOIN mealtypes m ON m.id = r.mealType
            WHERE EXISTS (
                SELECT 1
                FROM user_bookmarks b
                    JOIN users u ON u.id = b.u_id
                    JOIN recipes r ON r.id = b.r_id
                WHERE u.id = %s
            );
        """, (u_id,))
        bookmarks = cursor.fetchall()

        # Grab Allergens
        cursor.execute("""
            SELECT a.name FROM allergens a;
        """, (u_id,))
        allergens = cursor.fetchall()

        response = {
            'Username' : username,
            'Email' : email,
            'Points' : points,
            'Bookmarks' : [],
            'Allergens' : []
        }

        for recipe in bookmarks:
            name,desc,cuisine,mealType,sS = recipe
            response["Bookmarks"].append({
                "Name":name,
                "Description":desc,
                "Cuisine":cuisine,
                "Meal Type":mealType,
                "Serving Size":sS
            })
        
        for allergen in allergens:
            try:
                response["Allergens"].append(allergen[0])
            except KeyError:
                # No allergies found? This might not even be run in that case.
                pass

        return response, 200

    elif request.method == 'PUT':
        # This verification is incorrect. [TODO: Change this verification]
        data = json.loads(request.get_data())
        if type(data) is dict:
            email = get_jwt_identity()
            
        response["isSuccess"] = False
        response["msg"] = "The data provided is not valid"
    return response

### Search function
# https://stackoverflow.com/questions/49721884/handle-incorrect-spelling-of-user-defined-names-in-python-application

# Haven't tested this yet
<<<<<<< HEAD
@api.after_request
def refresh_jwt(response: request):
    # If the user is active within 15 minutes after their token expires, refresh their expiry time.
    timeframe = 15
    try:
        expiry = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target = datetime.timestamp(now + timedelta(minutes=timeframe))
        if target > expiry:
            token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["token"] = token
                response.data = json.dumps(data) # Response is of type flask.request
        return response
    except (RuntimeError, KeyError):
        # Invalid JWT Token
        return response

@api.route('/get_recipe', methods=['GET'])
@cross_origin()
def get_recipes():
    response = []
    cursor.execute("SELECT * FROM recipes;")
    results = cursor.fetchall() # cursor.fetchal() returns a list of tuples

    for row in results:
        tempDict = {}
        tempDict['id'] = row[0]
        tempDict['name'] = row[1]
        tempDict['description'] = row[2]
        tempDict['cuisine'] = row[3]
        tempDict['mealtype'] = row[4]
        tempDict['servingsize'] = row[5]
        tempDict['uploader'] = row[6]

        response.append(tempDict)
    # Trying multiple recipes
    return jsonify(response)

    # return jsonify([
    # {
    #    "id" : "0",
    #    "name": "test",
    #    "description": "test_entry",
    #    "cuisine" : "0",
    #    "mealtype" : "0",
    #    "servingsize" : "0",
    #    "uploader" : "1"
    # },

    # {
    #    "id" : "0",
    #    "name": "test",
    #    "description": "test_entry",
    #    "cuisine" : "0",
    #    "mealtype" : "0",
    #    "servingsize" : "0",
    #    "uploader" : "1"
    # }])

@api.route('/view/recipe/<id>', methods=['GET'])
@cross_origin()
def find_recipe(id):
    response = []
    cursor.execute("SELECT * FROM recipes where id = %s;", (id,))
    row = cursor.fetchone()

    tempDict = {}
    tempDict['id'] = row[0]
    tempDict['name'] = row[1]
    tempDict['description'] = row[2]
    tempDict['cuisine'] = row[3]
    tempDict['mealtype'] = row[4]
    tempDict['servingsize'] = row[5]
    tempDict['uploader'] = row[6]

    response.append(tempDict)

    return jsonify(response)
=======
# @api.after_request()
# @jwt_required()
# def refresh_jwt(response: request):
#     return auth_jwt_refresh(get_jwt()["exp"], get_jwt_identity(), response)

def detailed_search():
    pass

@api.route('/my-recipes/recipeid=<r_id>', methods=['POST', 'GET'])
@jwt_required()
@cross_origin()
def edit_recipe(r_id):
    if request.method == 'POST':
        pass
    elif request.method == 'GET':
        # Get the users id
        email = get_jwt_identity()
        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        try:
            u_id = cursor.fetchone()[0]
        except IndexError or ValueError:
            return {'msg' : 'Authentication Failed'}, 403
        # Get all recipes from that user
        query = """
        SELECT 1
        FROM recipes r
            JOIN cuisines c ON c.id=r.cuisine
            JOIN mealtypes m ON m.id = r.mealType
        WHERE r.uploader = %s AND r.id = %s;
        """
        cursor.execute(query, (u_id,r_id))
        
        try:
            recipe = cursor.fetchone()[0]
        except ValueError or IndexError:
            return {'msg' : 'This user does not own this recipe'}, 403
            
        return search_detailed(cursor, r_id)

@api.route('/view/recipe/<r_id>', methods=['GET'])
@cross_origin()
def find_recipe(r_id):
    return search_detailed(cursor, r_id)
>>>>>>> cleanup

@api.route('/reviews/recipeid=<id>', methods=['GET'])
@cross_origin()
def reviews(id):

    # [TODO]: Replace the default '3' with a grab from the rating table
    # Consider restructuring this section

    if not str(id).isdigit():
        return {"msg" : "Recipe not found"}, 404

    cursor.execute("""
        SELECT u.username, c.description, 3
        FROM users u, comments c
        WHERE c.r_id = %s;
    """, (id,))
    response = {
        "Comments":list()
    }

    comments = cursor.fetchall()
    for comment in comments:
        username, description, rating = comment
        response["Comments"].append({
            "Username":username,
            "Content":description,
            "Rating":rating
        })

    return response, 200

@api.route('/eaten/recipeid=<id>', methods=['POST'])
@cross_origin()
def eaten(id):
    data = json.loads(request.get_data())
    response = {}
    
    r_id = data["r_id"]
    dateString = datetime.today().strftime('%d/%m/%Y')
    u_id = getUserId()
    if not u_id:
        return ("msg: user does not exist", 401)

    #Note: need to add caloric values to ingredients
    cursor.execute("INSERT INTO mealHistory(u_id, r_id, date) VALUES (%s, %s, %s);", (r_id, TO_DATE(dateString, 'DD/MM/YYYY')))

    return (response, 200)

@api.route('/intake_overview', methods=['GET'])
@cross_origin()
def IntakeOverview():
    #Grain 
    #Vegetables
    #Fruit
    #Dairy 
    #Meat
    #Fatty

    data = json.loads(request.get_data())
    response = {}
    
    r_id = data["r_id"]
    u_id = getUserId()
    if not u_id:
        return ("msg: user does not exist", 401)

    #Note: Combine with ingredients table. Limit to last 50 meals
    cursor.execute("SELECT * from mealHistory(u_id, r_id, date) VALUES (%s, %s, %s);", (r_id, TO_DATE(dateString, 'DD/MM/YYYY')))

    return (response, 200)

@api.route('/recommend', methods=['GET'])
@cross_origin()
def recommend():
    grainGoal =  33
    vegetablesGoal = 16
    fruitGoal = 16
    dairyGoal = 15 
    meatGoal = 12
    fattyGoal = 7

    response = []

    #to do: Combine with ingredients table. Limit to last 50 meals
    cursor.execute("SELECT * from mealHistory(u_id, r_id, date) VALUES (%s, %s, %s);", (r_id, TO_DATE(dateString, 'DD/MM/YYYY')))
    grain, vegetables, fruit, dairy, meat, fatty = getIntakeOverview()

    goalDiff = {
        "grain" : abs(grainGoal - grain),
        "vegetables" : abs(vegetablesGoal - vegetables),
        "fruit" : abs(fruitGoal - fruit),
        "dairy" : abs(dairyGoal - dairy),
        "meat" : abs(meatGoal - meat),
        "fatty" : abs(fattyGoal - fatty)
    }

    #Imbalance if difference is > 15%
    for key, value in goalDiff.items():
        if value > 15:
            response.append(key)
    
    #Returning a list of food categories that need improvement on
    return response

@api.route('/setGoal', methods=['POST'])
@cross_origin()
def setGoal():
    data = json.loads(request.get_data())
    response = {}
    
    try:
        caloricGoal = data["goal"]
    except KeyError():
        return {"msg: wrong key", 401}

    u_id = getUserId()
    if(u_id == None):
        return ("msg: user does not exist", 401)

    #To do: need to add goal column
    cursor.execute("UPDATE users SET goal = %s WHERE u_id = %s;", (caloricGoal, u_id))

    return (response, 200)

def getUserId():
    # This section is to verify user identity
    email = get_jwt_identity()
    query = "SELECT id FROM users WHERE email=%s"
    cursor.execute(query, (email,))
    try:
        uploader = cursor.fetchone()[0]
        return uploader
    except IndexError:
        return None

@api.route('/post_recipe', methods=['POST'])
@jwt_required() # To ensure that the user is logged in
@cross_origin()
def post_recipe():

    #[TODO] Include the guide on how to make the recipe...

    try:
        data = json.loads(request.get_data())
    except json.decoder.JSONDecodeError:
        return {'msg' : 'Invalid data format'}, 401
    response = {}

    # This section is to verify user identity
    email = get_jwt_identity()
    query = "SELECT id FROM users WHERE email=%s"
    cursor.execute(query, (email,))
    try:
        uploader = cursor.fetchone()[0]
    except IndexError:
        return {'msg' : 'Invalid Credentials'}, 403

    try:
        name = data['name']
        description = data['description']
        cuisine = data['cuisine']
        mealtype = data['mealtype']
        servingsize = data['servingsize']
        ingredients = data['ingredients']
    except KeyError:
        return {'msg' : 'Incorrect Parameters'}, 401

    cursor.execute("SELECT id FROM cuisines WHERE name=%s", (cuisine,))
    try:
        c_id = cursor.fetchone()[0]
    except TypeError:
        return {"msg" : "Cuisine not found"}, 401

    cursor.execute("SELECT id FROM mealtypes WHERE name=%s", (mealtype,))
    try:
        m_id = cursor.fetchone()[0]
    except TypeError:
        return {"msg" : "MealType not found"}, 401

    cursor.execute(
        # Need cuisine id &  mealtype id
        "INSERT INTO recipes(name, description, cuisine, mealType, servingSize, uploader) VALUES (%s, %s,%s, %s, %s, %s);", 
        (name, description, c_id, m_id, servingsize, uploader)
    )

    cursor.execute("SELECT id FROM recipes ORDER BY id DESC LIMIT 1")
    try:
        r_id = cursor.fetchone()[0]
    except IndexError:
        return {'msg': 'An error has occurred while uploading your recipe'}, 400 # [TODO] This error code will need to be changed
    
    for ingredient in ingredients:
        try:
            name = ingredient['name']
            quantity = ingredient['quantity']
            grams = ingredient['grams']
            millilitres = ingredient['millilitres']
        except KeyError:
            return {'msg' : 'Incorrect Parameters'}, 401

        # Grabbing ingredient id and validating that the ingredient exists. ingredient names are all unique
        cursor.execute("SELECT id FROM ingredients WHERE name = %s", (name, ))
        try:
            i_id = cursor.fetchone()[0]
        except IndexError:
            return {'msg' : 'Invalid ingredient supplied'}, 401

        cursor.execute(
            "INSERT INTO recipe_ingredients(r_id, ingredient, quantity, grams, millilitres) VALUES (%s, %s, %s, %s, %s) ", (r_id, i_id, quantity, grams, millilitres) 
        )
        # Checking that the recipe and ingredient were added.
        cursor.execute(
            "SELECT * FROM recipe_ingredients WHERE r_id=%s AND ingredient=%s", (r_id, i_id)
        )

        if not cursor.fetchone():
            return {'msg' : 'Error adding ingredient'}, 400

    conn.commit()
    response['msg'] = "Recipe successfully added"
    return (response, 200)

if __name__ == '__main__':
    api.run()
