import os 
from hashlib import sha256
import psycopg2
import sys
from datetime import datetime, timedelta, timezone, date
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
from utils.gmail.gmail_auth import *

api = Flask(__name__)

cors = CORS(api)
api.config['CORS_HEADERS'] = 'Content-Type'

api.config["JWT_SECRET_KEY"] = JWT_KEY
api.config["JWT_ACCESS_TOKEN_EXPIRES"] = JWT_EXPIRY
api.config["JWT_TOKEN_LOCATION"] = 'headers'
api.config["JWT_FORM_KEY"] = 'token'

api.secret_key = 'REPLACE ME - this value is here as a placeholder.' # This is the actual secret required for sending emails using gmail
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

jwt = JWTManager(api)

try:
    conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS)
    cursor = conn.cursor()
except Exception as e:
    sys.stderr.write("An error occurred while connecting to the database:\n{}\n".format(e))

#################################################
#                                               #
#   Backend Routes to setup email for server    #
#                                               # 
#################################################

@api.route('/')
def index():
  return print_index_table()

@api.route('/test')
def test_api_request():
    return do_test_api_request()

@api.route('/authorize')
def authorize():
  return do_authorize()

@api.route('/oauth2callback')
def oauth2callback():
  return do_oauth2callback()

@api.route('/revoke')
def revoke():
  return do_revoke()

@api.route('/clear')
def clear_credentials():
  return do_clear_credentials()

#############################################
#                                           #
#           Authentication Routes           #
#                                           # 
#############################################

@api.route('/auth/login', methods=['POST'])
@cross_origin()
def login():
    return auth_login(request.get_data(), conn)

@api.route('/auth/register', methods=['POST'])
@cross_origin()
def register():
    return auth_register(request.get_data(), conn)


@api.route('/auth/change-password', methods=['PUT'])
@jwt_required()
@cross_origin()
def change_password():
    return auth_change_password(request.get_data(), get_jwt_identity(), conn)

@api.route('/auth/change-username', methods=['PUT'])
@jwt_required()
@cross_origin()
def change_username():
    return auth_change_username(request.get_data(), get_jwt_identity(), conn)

@api.route('/auth/reset', methods=['POST'])
@cross_origin()
def reset():
    with open('utils/gmail/session_credential.json', 'r') as fp:
        flask_session_credential = json.load(fp)

    print(flask_session_credential)

    if not flask_session_credential:
        return {'msg' : 'Developer email needs to be authorised for website'}, 500
    # Load credentials from the session.
    credentials = google.oauth2.credentials.Credentials(
        **flask_session_credential)

    return auth_forgot_password(request.get_data(), credentials, cursor, conn)
    
@api.route('/profile', methods=['GET', 'PUT']) # Route tbc later
@jwt_required() # Required in request header: "Authorization : Bearer <token>"
@cross_origin()
def profile():
    if request.method == 'GET':
        return auth_get_profile(get_jwt_identity(), conn)
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
    return search_general(request.method, request.get_data(), conn)

@api.route('/recentlyviewed', methods=['POST'])
@jwt_required()
@cross_origin()
def recently_viewed():
    return auth_update_viewed(request.get_data(), get_jwt_identity(), conn)

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
        bookmarkRecipes = cursor.fetchall()
        response = {
            'Bookmarks' : [],
            'b_id': []
        }

        for recipe in bookmarkRecipes:
            id,name,desc,cuisine,mealType,sS = recipe
            response["Bookmarks"].append({
                "id" : id,
                "name":name,
                "description":desc,
                "cuisine":cuisine,
                "mealType":mealType,
                "servingSize":sS
            })
            response['b_id'].append(id)
        return response, 200

    elif request.method == 'PUT':
        data = json.loads(request.get_data())
        if type(data) is dict:
            u_id = getUserId()
            r_id = data['id']
            bookmarks_id = data['bookmarkIds']
            if r_id in bookmarks_id: 
                cursor.execute("""
                    DELETE FROM user_bookmarks
                    WHERE u_id = %s
                    AND r_id = %s
                """, (u_id, r_id))
                bookmarks_id.remove(r_id)
            elif r_id not in bookmarks_id: 
                cursor.execute("""
                    INSERT INTO user_bookmarks (u_id, r_id)
                    VALUES (%s, %s);
                """, (u_id, r_id))
                bookmarks_id.append(r_id)
            else: 
                response["msg"] = "Error with recipe id and bookmarks"
                return response, 400

            response['Bookmarks'] = bookmarks_id
            return response, 200
        response["isSuccess"] = False
        response["msg"] = "The data provided is not valid"
    return response, 400


@api.route('/dashboard', methods=['GET', 'PUT'])
@jwt_required()
@cross_origin()
def dashboard():
    response = {}
    if request.method == 'GET':
        u_id = auth_get_uid(get_jwt_identity(), conn)

        # Grab Bookmarks
        cursor.execute("""
            SELECT r_id
            FROM user_bookmarks
            WHERE u_id = %s;
        """, (u_id,))
        bookmarks = cursor.fetchall()
        response = {
            'Bookmarks' : []
        }

        for id in bookmarks:
            response["Bookmarks"].append(id[0])

        return response, 200

    elif request.method == 'PUT':
        data = json.loads(request.get_data())
        if type(data) is dict:
            u_id = auth_get_uid(get_jwt_identity(), conn)
            r_id = data['id']
            bookmarks_id = data['bookmarkedRecipe']
            if r_id in bookmarks_id: 
                try:
                    cursor.execute("""
                        DELETE FROM user_bookmarks
                        WHERE u_id = %s
                        AND r_id = %s
                    """, (u_id, r_id))
                    bookmarks_id.remove(r_id)
                except Exception:
                    conn.rollback()
                else:
                    conn.commit()
            elif r_id not in bookmarks_id: 
                try:
                    cursor.execute("""
                        INSERT INTO user_bookmarks (u_id, r_id)
                        VALUES (%s, %s);
                    """, (u_id, r_id))
                    bookmarks_id.append(r_id)
                except Exception:
                    conn.rollback()
                else:
                    conn.commit()
            else: 
                response["msg"] = "Error with recipe id and bookmarks"
                return response, 400

            response['Bookmarks'] = bookmarks_id
            return response, 200
        response["isSuccess"] = False
        response["msg"] = "The data provided is not valid"
    return response, 400


@api.route('/my-recipes', methods=['GET'])
@jwt_required()
@cross_origin()
def get_my_recipes():
    return search_users_recipes(get_jwt_identity(), conn)

@api.route('/view/recipe/<r_id>', methods=['GET'])
@cross_origin()
def find_recipe(r_id):
    return search_detailed(conn, r_id)

@api.route('/reviews/recipeid=<id>', methods=['GET'])
@cross_origin()
def reviews(id):

    if request.method == 'GET':
        if not str(id).isdigit():
            return {"msg" : "Recipe not found"}, 404

        cursor.execute("""
            SELECT u.username, c.description
            FROM users u, comments c
            WHERE c.r_id = %s
            AND u.id = c.u_id;
        """, (id,))

        response = {
            "Comments":list()
        }

        try:
            comments = cursor.fetchall()
        except Exception:
            comments = []

        for comment in comments:
            username, description = comment
            response["Comments"].append({
                "Username":username,
                "Content":description,
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
    return contrib_post_recipe(get_jwt_identity(), request.get_data(), conn)

@api.route('/my-recipes/recipeid=<r_id>', methods=['POST', 'GET'])
@jwt_required()
@cross_origin()
def edit_recipe(r_id):
    if request.method == 'POST':
        if auth_recipe_uploader(get_jwt_identity(), conn, r_id):
            return contrib_edit_recipe(request.get_data(), conn, r_id)
        else:
            return dict(msg="User does not own this recipe."), 403
    elif request.method == 'GET':
        if auth_recipe_uploader(get_jwt_identity(), conn, r_id):
            return search_detailed(conn, r_id)
        else:
            return dict(msg="User does not own this recipe."), 403


@api.route('/contrib/review/recipe=<r_id>', methods=['POST', 'PUT'])
@jwt_required()
@cross_origin()
def review(r_id):
    data = request.get_data()
    print(data)
    return contrib_review_recipe(get_jwt_identity(), r_id, data, conn)

@api.route('/eaten/recipeid=<id>', methods=['POST', 'PUT'])
@jwt_required()
@cross_origin()
def eaten(id):
    data = json.loads(request.get_data())
    response = {}
    
    r_id = data["r_id"]
    dateString = date.today().strftime('%d/%m/%Y')

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


    try:
        cursor.execute("INSERT INTO meal_history(u_id, r_id, date) VALUES (%s, %s, %s);", (u_id, r_id, dateString))
    except Exception:
        conn.rollback()
    else:
        conn.commit()

    return (response, 200)

@api.route('/intake_overview', methods=['GET'])
@jwt_required()
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def overview():
    u_id = auth_get_uid(get_jwt_identity(), conn)
    if not u_id:
        return {'msg' : 'Authentication error'}, 403

    cursor.execute("""
        SELECT
        SUM(energy) AS energy,
        SUM(protein) AS protein, 
        SUM(fat) AS fat,
        SUM(fibre) AS fibre,
        SUM(sugars) AS sugars,
        SUM(carbohydrates) AS carbohydrates,
        SUM(calcium) AS calcium,
        SUM(iron) AS iron,
        SUM(magnesium) AS magnesium
        FROM (
                SELECT history.r_id, ingredient, energy, protein, fat, fibre, sugars, carbohydrates, calcium, iron, magnesium, manganese, phosphorus
                FROM (SELECT r_id FROM meal_history WHERE u_id = 1 ORDER BY date BETWEEN '2022-06-26' AND '2022-08-26') AS history
                JOIN recipe_ingredients on history.r_id = recipe_ingredients.r_id
                JOIN Ingredients on recipe_ingredients.ingredient = Ingredients.id
        ) ingredientHistory
         
    """, (u_id, '2022-06-26', '2022-09-26'))

    try:
        overview = cursor.fetchone()
    except Exception:
        return {'msg' : 'Overview error'}, 500
    
    response = {
        'keys' : ['energy', 'protein', 'fat', 'fibre', 'sugars', 'carbohydrates', 'calcium', 'iron', 'magnesium'],
        'overview' : overview
    }
    return response, 200

def find_imbalance(u_id):
    # These are all the average daily required nutrients
    check_nutrients = [('protein', 70), ('fat', 60), ('fibre', 27), 
                        ('sugars', 27), ('carbohydrates', 300), ('calcium', 2500), 
                        ('iron', 12), ('magnesium', 400)]

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
        try:
            record = cursor.fetchone()[0]
        except (TypeError, psycopg2.ProgrammingError):
            record = None
        # print(record)
        if(record is not None):
            actual_intake = float(record)
   
        expected_intake = nutrient[1]
        diff = expected_intake - actual_intake
        if(abs(diff) > nutrient_diff):
            nutrient_diff = diff
            recommended_nutrient = nutrient[0]
    
    return nutrient_diff, recommended_nutrient

def find_recipe_more(recommended_nutrient, amount):
    sort = ''
    if amount > 0:
        sort = 'DESC'   #higher values will be at the start of the table
    elif amount < 0:
        sort = 'ASC'    #lower values will be at the start of the table
    


    #Actual implementation, but doesn't work
    query = """ SELECT r_id, protein, fat, fibre, sugars, carbohydrates, calcium, iron, magnesium, manganese, phosphorus
                    FROM (                        
                        SELECT recipe_ingredients.r_id, protein, fat, fibre, sugars, carbohydrates, calcium, iron, magnesium, manganese, phosphorus
                        FROM recipe_ingredients
                        JOIN Ingredients on recipe_ingredients.ingredient = Ingredients.id
                    ) r_id_with_nutrients
                    ORDER BY {} {};
                """.format(recommended_nutrient, sort)
    cursor.execute(query)

    recommended_recipes = []
 
    recipes = cursor.fetchall()
    count = 0
    for recipe in recipes:
        recommended_recipes.append(recipe[0])
        if count >= 2:
            break
        count += 1

    return recommended_recipes

@api.route('/recommend', methods=['GET'])
@jwt_required()
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def recommend():
   
    u_id = auth_get_uid(get_jwt_identity(), cursor)
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

@api.route('/setGoal', methods=['POST', 'GET'])
@jwt_required()
@cross_origin()
def setGoal():
    u_id = auth_get_uid(get_jwt_identity(), conn)
    if not u_id:
        return {'msg' : 'Authentication error'}, 403

    if request.method == 'POST':
        data = json.loads(request.get_data())
        
        try:
            caloricGoal = data['goal']
            timeframe = data['timeframe']
        except KeyError:
            return ("msg: wrong key", 401)



        #To do: need to add goal column
        if timeframe.lower() == 'weekly':
            cursor.execute("UPDATE users SET goal_weekly = %s WHERE id = %s;", (caloricGoal, u_id))
        elif timeframe.lower() == 'daily':
            cursor.execute("UPDATE users SET goal_daily = %s WHERE id = %s;", (caloricGoal, u_id))


        return ({'msg' : 'Success'}, 200)

    elif request.method == 'GET':
        cursor.execute("SELECT goal_daily, goal_weekly FROM users WHERE id = %s;", (u_id, ))
        row = cursor.fetchone()

        return ({'goals' : row}, 200)

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
        
if __name__ == '__main__':
    # When running locally, disable OAuthlib's HTTPs verification.
    # ACTION ITEM for developers:
    #     When running in production *do not* leave this option enabled.
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

    api.run(debug=True)
