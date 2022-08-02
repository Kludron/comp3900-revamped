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
cors = CORS(api)
api.config['CORS_HEADERS'] = 'Content-Type'

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
cors = CORS(api)
# api.config['CORS_HEADERS'] = 'Content-Type'

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
        return customise_profile(request.get_data(), get_jwt_identity(), cursor, conn)

#############################################
#                                           #
#              Searching Routes             #
#                                           #
#############################################

@api.route('/search', methods=['POST', 'GET'])
@cross_origin()
def search():
    return search_general(request.method, request.get_data(), cursor)

@api.route('/recentlyviewed', methods=['POST'])
@jwt_required()
@cross_origin()
def recently_viewed():
    return auth_update_viewed(request.get_data(), get_jwt_identity(), cursor, conn)

################Created by Bill################
@api.route('/favourite', methods=['GET', 'PUT'])
@jwt_required()
@cross_origin()
def favourite():
    response = {}
    if request.method == 'GET':
        email = get_jwt_identity()
        query = """
        SELECT u.id FROM users u WHERE lower(u.email)=%s;
        """
        cursor.execute(query, (email,))
        try:
            u_id = cursor.fetchone()
        except TypeError:
            return {'msg' : 'Authentication Error'}, 403

        # Grab Bookmarks
        cursor.execute("""
            SELECT r.id, r.name, r.description, c.name, m.name, r.servingSize
            FROM recipes r
                JOIN cuisines c ON c.id=r.cuisine
                JOIN mealtypes m ON m.id = r.mealType
            WHERE r.id IN (
                SELECT r_id
                FROM user_bookmarks
                WHERE u_id = %s
            );
        """, (u_id,))
        bookmarks = cursor.fetchall()
        response = {
            'Bookmarks' : []
        }

        for recipe in bookmarks:
            id,name,desc,cuisine,mealType,sS = recipe
            response["Bookmarks"].append({
                "id" : id,
                "name":name,
                "description":desc,
                "cuisine":cuisine,
                "mealType":mealType,
                "servingSize":sS
            })

        return response, 200

    elif request.method == 'PUT':
        # This verification is incorrect. [TODO: Change this verification]
        data = json.loads(request.get_data())
        if type(data) is dict:
            email = get_jwt_identity()
            
        response["isSuccess"] = False
        response["msg"] = "The data provided is not valid"
    return response
###############################################
### Search function
# https://stackoverflow.com/questions/49721884/handle-incorrect-spelling-of-user-defined-names-in-python-application



# def detailed_search():
#     pass

@api.route('/my-recipes', methods=['GET'])
@jwt_required()
@cross_origin()
def get_my_recipes():
    return search_users_recipes(get_jwt_identity(), cursor)

@api.route('/view/recipe/<r_id>', methods=['GET'])
@cross_origin()
def find_recipe(r_id):
    return search_detailed(cursor, r_id)

@api.route('/reviews/recipeid=<id>', methods=['GET', 'POST'])
@cross_origin()
def reviews(id):

    # [TODO]: Replace the default '3' with a grab from the rating table
    # Consider restructuring this section
    if request.method == 'GET':
        if not str(id).isdigit():
            return {"msg" : "Recipe not found"}, 404

        cursor.execute("""
            SELECT u.username, c.description, rr.rating
            FROM users u, comments c, recipe_rating rr
            WHERE c.r_id = %s
            AND rr.r_id = c.r_id
            AND u.id = rr.u_id;
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


        comments = cursor.fetchall()
        for comment in comments:
            username, description, rating = comment
            response["Comments"].append({
                "Username":username,
                "Content":description,
                "Rating":rating
            })
        return response, 200

#############################################
#                                           #
#           Contributing Routes             #
#                                           #
#############################################


@api.route('/post_recipe', methods=['POST'])
@jwt_required() # To ensure that the user is logged in
@cross_origin()
def post_recipe():
    return contrib_post_recipe(get_jwt_identity(), request.get_data(), cursor, conn)

@api.route('/my-recipes/recipeid=<r_id>', methods=['PUT', 'GET'])
@jwt_required()
@cross_origin()
def edit_recipe(r_id):
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


@api.route('/contrib/review/recipe=<r_id>', methods=['POST', 'PUT'])
@jwt_required()
@cross_origin()
def review(r_id):
    data = request.get_data()
    return contrib_review_recipe(get_jwt_identity(), r_id, data, cursor, conn)

@api.route('/eaten/recipeid=<id>', methods=['POST'])
@cross_origin()
def eaten(id):
    data = json.loads(request.get_data())
    response = {}
    
    r_id = data["r_id"]
    dateString = datetime.today().strftime('%d/%m/%Y')


    email = get_jwt_identity()
    query = """
    SELECT u.id FROM users u WHERE lower(u.email)=%s;
    """
    cursor.execute(query, (email,))
    try:
        u_id = cursor.fetchone()
    except TypeError:
        return {'msg' : 'Authentication Error'}, 403

    if not u_id:
        return ("msg: user does not exist", 401)

    #Note: need to add caloric values to ingredients
    cursor.execute("INSERT INTO mealHistory(u_id, r_id, date) VALUES (%s, %s, %s);", (r_id, TO_DATE(dateString, 'DD/MM/YYYY')))

    return (response, 200)

@api.route('/intake_overview', methods=['GET'])
@jwt_required()
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def overview():
    u_id = 1 #auth_get_uid(get_jwt_identity(), cursor)
    if not u_id:
        return {'msg' : 'Authentication error'}, 403

    cursor.execute("""
               
                    SELECT
                    SUM(energy),
                    SUM(protein), 
                    SUM(fat),
                    SUM(fibre),
                    SUM(sugars),
                    SUM(carbohydrates),
                    SUM(calcium),
                    SUM(iron),
                    SUM(magnesium)
                    FROM (
                            SELECT history.r_id, ingredient, energy, protein, fat, fibre, sugars, carbohydrates, calcium, iron, magnesium, manganese, phosphorus
                            FROM (SELECT r_id FROM meal_history WHERE u_id = %s ORDER BY date BETWEEN %s AND %s) AS history
                            JOIN recipe_ingredients on history.r_id = recipe_ingredients.r_id
                            JOIN Ingredients on recipe_ingredients.ingredient = Ingredients.id
                    ) ingredientHistory
                     
                    """, (u_id, '2022-06-26', '2022-07-26'))

    overview = cursor.fetchone()
    
    response = {
        'overview' : overview
    }
    return response, 200

def find_imbalance(u_id):
    check_nutrients = [('protein', 70), ('fat', 60), ('fibre', 27), ('sugars', 27), ('carbohydrates', 300), ('calcium', 2500), ('iron', 12), ('magnesium', 400)]

    nutrient_diff = 0
    recommended_nutrient = ""

    for nutrient in check_nutrients:
        cursor.execute("""SELECT SUM(protein) 
                        FROM (      SELECT history.r_id, ingredient, energy, protein, fat, fibre, sugars, carbohydrates, calcium, iron, magnesium, manganese, phosphorus
                                    FROM (SELECT r_id FROM meal_history WHERE u_id = %s ORDER BY date BETWEEN %s AND %s) AS history
                                    JOIN recipe_ingredients on history.r_id = recipe_ingredients.r_id
                                    JOIN Ingredients on recipe_ingredients.ingredient = Ingredients.id
                        ) ingredientHistory;
                        
                        
                        """, ( u_id, '2022-06-26', '2022-07-26'))
        actual_intake = 0
        record = cursor.fetchone()[0]
        print(record)
        if(record is not None):
            actual_intake = float(record)
   
        expected_intake = nutrient[1]
        diff = expected_intake - actual_intake
        if(abs(diff) > nutrient_diff):
            nutrient_diff = diff
            recommended_nutrient = nutrient[0]
    
    return nutrient_diff, recommended_nutrient

def find_recipe_more(recommended_nutrient, amount):
    sort = ""
    if amount > 0:
        sort = 'DESC'   #higher values will be at the start of the table
    elif amount < 0:
        sort = 'ASC'    #lower values will be at the start of the table
    cursor.execute( """ SELECT r_id, protein, fat, fibre, sugars, carbohydrates, calcium, iron, magnesium, manganese, phosphorus
                        FROM (                        
                            SELECT recipe_ingredients.r_id, protein, fat, fibre, sugars, carbohydrates, calcium, iron, magnesium, manganese, phosphorus
                            FROM recipe_ingredients
                            JOIN Ingredients on recipe_ingredients.ingredient = Ingredients.id
                        ) r_id_with_nutrients
                        ORDER BY calcium DESC;
                    """, (recommended_nutrient, ))

    recommended_recipes = []
    record = cursor.fetchone()[0]
    #recipes = cursor.fetchall()
    #count = 0
    #for recipe in recipes:
    #    recommended_recipes.append(recipe[0])
    #    if count >= 2:
    #        break
    #    count += 1

    return recommended_recipes

@api.route('/recommend', methods=['GET'])
@jwt_required()
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def recommend():
   
    #u_id = auth_get_uid(get_jwt_identity(), cursor)
    u_id = 1
    if not u_id:
        return {'msg' : 'Authentication error'}, 403

    nutrient_diff, recommended_nutrient = find_imbalance(u_id)

    #Find the single largest nutrient imbalance and recommend 3 recipes to bring diet back into balance
    recipes = find_recipe_more(recommended_nutrient, nutrient_diff)
    
    #Returning a list of food categories that need improvement on
    response = {
        'recipes' : recipes
    }
    return response, 200

@api.route('/setGoal', methods=['POST'])
@jwt_required()
@cross_origin()
def setGoal():
    data = json.loads(request.get_data())
    
    try:
        caloricGoal = data['goal']
    except KeyError:
        return ("msg: wrong key", 401)

    u_id = 1 #auth_get_uid(get_jwt_identity(), cursor)
    if not u_id:
        return {'msg' : 'Authentication error'}, 403

    #To do: need to add goal column
    cursor.execute("UPDATE users SET goal = %s WHERE u_id = %s;", (caloricGoal, u_id))


    return ({'msg' : 'Success'}, 200)


if __name__ == '__main__':
    api.run()
