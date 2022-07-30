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

from utils.customising import *
from utils.contributing import *
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

#############################################
#                                           #
#           Authentication Routes           #
#                                           # 
#############################################

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

# Haven't tested this yet
# @api.after_request()
# @jwt_required()
# def refresh_jwt(response: request):
#     return auth_jwt_refresh(get_jwt()["exp"], get_jwt_identity(), response)

@api.route('/profile', methods=['GET', 'PUT']) # Route tbc later
@jwt_required() # Required in request header: "Authorization : Bearer <token>"
@cross_origin()
def profile():
    if request.method == 'GET':
        return auth_get_profile(get_jwt_identity(), cursor)
    elif request.method == 'PUT':
        return customise_profile(request.get_data(), get_jwt_identity())

#############################################
#                                           #
#              Searching Routes             #
#                                           #
#############################################

@api.route('/search', methods=['POST', 'GET'])
@cross_origin()
def search():
    return search_general(request.method, request.get_data(), cursor)

@api.route('/recentlyviewed', methods=['GET'])
@jwt_required()
@cross_origin()
def recently_viewed():
    return auth_update_viewed(request.get_data(), get_jwt_identity(), cursor, conn)

### Search function
# https://stackoverflow.com/questions/49721884/handle-incorrect-spelling-of-user-defined-names-in-python-application



def detailed_search():
    pass

@api.route('/my-recipes', methods=['GET'])
@jwt_required()
@cross_origin()
def get_my_recipes():
    return search_users_recipes(get_jwt_identity(), cursor)

@api.route('/my-recipes/recipeid=<r_id>', methods=['PUT', 'GET'])
@jwt_required()
@cross_origin()
def edit_recipe():
    if request.method == 'PUT':
        if auth_recipe_uploader(get_jwt_identity(), cursor, r_id):
            return contrib_edit_recipe(data, cursor, conn, r_id)
        else:
            return dict(msg="User does not own this recipe.")
    elif request.method == 'GET':
        if auth_recipe_uploader(get_jwt_identity(), cursor, r_id):
            return search_detailed(cursor, r_id)
        else:
            return dict(msg="User does not own this recipe.")

@api.route('/view/recipe/<r_id>', methods=['GET'])
@cross_origin()
def find_recipe(r_id):
    return search_detailed(cursor, r_id)

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


@api.route('/eaten/recipeid=<id>', methods=['GET'])
@cross_origin()
def dietMetrics():
    pass


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
    return contrib_post_recipe(get_jwt_identity(), request.get_data(), cursor, conn)

if __name__ == '__main__':
    api.run()
