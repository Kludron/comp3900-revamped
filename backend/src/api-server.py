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

api = Flask(__name__)
api.config["JWT_SECRET_KEY"] = '%_2>7$]?OVmqd"|-=q6"dz{|0=Nk\%0N' # Randomly Generated
api.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=4)
api.config["JWT_TOKEN_LOCATION"] = 'headers'
api.config["JWT_FORM_KEY"] = 'token'

SALT = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"

# Command to access the database
# psql -h 45.77.234.200 -U comp3900_user -d comp3900db
# yckAPfc9MX42N4

try:
    conn = psycopg2.connect(host="45.77.234.200", database="comp3900db", user="comp3900_user", password="yckAPfc9MX42N4")
    cursor = conn.cursor()
except Exception as e:
    sys.stderr.write("An error occurred while connecting to the database:\n{}\n".format(e))

jwt = JWTManager(api)

@api.route('/auth/login', methods=['POST'])
@cross_origin()
def login():
    data = json.loads(request.get_data())
    response = {}
    try:
        email = data['email']
        pword = data['password']
        passhash = sha256(str(pword + SALT).encode('utf8')).hexdigest()
    except ValueError:
        response["msg"] = "Invalid Email / Password"
        return (response, 401)
    # Run check on database
    cursor.execute("SELECT email, username, points FROM users WHERE email=%s AND pass_hash=%s;",(email, passhash)) # This is equivalent to a prepared statement

    # Validate that there was a user with these credentials
    try:
        vEmail, username, points = cursor.fetchone()
        isValid = vEmail == email
    except TypeError or ValueError:
        isValid = False
    if not isValid:
        response["msg"] = "Invalid Email / Password"
        return (response, 401)
    
    token = create_access_token(identity=email)
    response["token"] = token 
    response["username"] = username
    response["points"] = points

    return response, 200

@api.route('/auth/register', methods=['POST'])
@cross_origin()
def register():
    data = json.loads(request.get_data())
    response = {}

    # [TODO: When a user registers with an already existing username, an error occurs]

    # Just a heads up, to save you some research time, this is what I did in my testing to add a user SQL style:
    # cursor.execute("INSERT INTO users(id, username, pass_hash, email) VALUES (%s, %s, %s, %s);", (id, username, sha256(str(password+SALT).encode('utf-8')).hexdigest(), email))
    # Also, when you insert into the database, be sure to add conn.commit() to commit the changes to the database, otherwise it won't save.
    # Feel free to check out psql-test.py to see what I did.
    if type(data) is dict:
        name = data['username']
        email = data['email']
        pword = data['password']
        passhash = sha256(str(pword + SALT).encode('utf8')).hexdigest()

        #Check if user already has an account
        cursor.execute("SELECT email FROM users WHERE email=%s;", (email,))
        
        try:
            doesExist = cursor.fetchone()[0] == email
        except (TypeError, IndexError):
            doesExist = False

        if doesExist:
            response["msg"] = "An account with this email already exists"
            return (response, 401)

        #Continue to create account for new user
        cursor.execute(
            "INSERT INTO users(username, pass_hash, email) VALUES (%s, %s, %s);", 
            (name, passhash, email)
        )

        #Move repeat code into function
        #Check if user already has an account
        cursor.execute("SELECT email FROM users WHERE email=%s;", (email,))
        try:
            doesExist = cursor.fetchone()[0] == email
        except (TypeError, IndexError):
            doesExist = False

        if doesExist:
            conn.commit()
            token = create_access_token(identity=email)
            response['token'] = token
        else:
            response["msg"] = "Error adding user, please try again"
            return (response, 401)
        
    response['msg'] = "Successfully registered"
    return (response, 200)

@api.route('/auth/change-password', methods=['PUT'])
@jwt_required()
@cross_origin()
def change_password():
    try:
        data = json.loads(request.get_data())
    except json.decoder.JSONDecodeError:
        return {'msg':'Invalid parameters'}, 401

    if type(data) is dict:
        newpwd = data['newpassword']
        email = get_jwt_identity()
        passhash = sha256(str(newpwd + SALT).encode('utf8')).hexdigest()

        cursor.execute(
            "UPDATE users SET pass_hash = %s WHERE email = %s;", 
            (passhash, email)
        )

        conn.commit()
        return {"msg": "Success"}, 200

@api.route('/auth/change-username', methods=['PUT'])
@jwt_required()
@cross_origin()
def change_username():
    try:
        data = json.loads(request.get_data())
    except json.decoder.JSONDecodeError:
        return {'msg':'Invalid parameters'}, 401

    if type(data) is dict:
        username = data['newusername']
        email = get_jwt_identity()

        cursor.execute(
            "UPDATE users SET username = %s WHERE email = %s;", 
            (username, email)
        )

        conn.commit()
        return {"msg": "Success"}, 200

@api.route('/auth/reset', methods=['POST'])
@cross_origin()
def reset():
    data = json.loads(request.get_data())
    response = {}

    reset_code = "23489" #placeholder

    if type(data) is dict:
        #Email details
        sender_email = "allofrandomness@gmail.com"
        receiver_email = data['email']
        message = """
        Subject: Hi there

        This is your password reset code """ + reset_code

        #Setting up email connection
        port = 465  # For SSL
        password = "iamrandom123#"
        context = ssl.create_default_context() # Create a secure SSL context

        with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
            server.login("allofrandomness@gmail.com", password)
            server.sendmail(sender_email, receiver_email, message)
    pass

@api.route('/search', methods=['POST', 'GET'])
@cross_origin()
def search():
    """
        At the moment, this search function returns a list of recipes that meet any of the criteria provided, in no order with no restrictions.
        This is something that will need to be fixed at a later date. The goal at the moment is to get the search returning valid recipes.
    """

    def __add_to_results(data):
        for recipe in data:
            id, name, desc, cuisine, mealT, ss = recipe
            responseval["recipes"].append({
                "ID" : id,
                "Name": name.title(),
                "Description": desc,
                "Cuisine": cuisine.title(),
                "MealType": mealT,
                "ServingSize": ss,
            })

    if request.method == 'GET':
        # Grab all ingredients
        # Grab all meal types
        # Grab all cuisines
        response = {}

        cursor.execute("SELECT name FROM ingredients")
        response['Ingredients'] = [x[0] for x in cursor.fetchall()]
        cursor.execute("SELECT name FROM mealTypes")
        response['MealTypes'] = [x[0] for x in cursor.fetchall()]
        cursor.execute("SELECT name FROM cuisines")
        response['Cuisine'] = [x[0] for x in cursor.fetchall()]

        return response, 200
    elif request.method == 'POST':
        """
        1. Load the data passed through
        2. Do a big SQL query for each of these
        """

        try:
            data = json.loads(request.get_data())
        except json.decoder.JSONDecodeError as e:
            return ({'msg': "Invalid request type"}, 400)
        if isinstance(data, dict):
            try:
                # Pull data
                search_query = data['search']
                ingredients = data['ingredients']
                mealTypes = data['mealTypes']
                cuisines = data['cuisines']
            except KeyError as e:
                print(e)
                return {'msg' : 'Invalid search parameters'}, 400    
            
            try:
                responseval = {
                    "recipes" : []
                }

                """
                Grab all the recipes that satisfy any of these

                If no search_query, exclude the name in the search
                If no ingredients, exclude ingredients
                If no meal_types, exclude them
                If no cuisines, exclude them
                """

                query = """
                SELECT r.id, r.name, r.description, c.name, m.name, r.servingSize
                FROM recipes r
                    JOIN cuisines c ON c.id=r.cuisine
                    JOIN mealtypes m ON m.id = r.mealType
                """

                constraints = []
                arguments = []

                if search_query:
                    constraints.append("lower(r.name) LIKE CONCAT('%%',%s,'%%')")
                    arguments.append(search_query)
                if ingredients:
                    constraints.append(f"""EXISTS(
                                    SELECT 1
                                    FROM recipes r, ingredients i
                                    JOIN recipe_ingredients ri ON ri.ingredient=i.id
                                    WHERE i.name in ({','.join(['%s' for _ in range(len(ingredients))])})
                                )""")
                    for ingredient in ingredients:
                        arguments.append(ingredient)
                if mealTypes:
                    constraints.append(f"m.name in ({','.join(['%s' for _ in range(len(mealTypes))])})")
                    for mealType in mealTypes:
                        arguments.append(mealType)
                if cuisines:
                    constraints.append(f"c.name in ({','.join(['%s' for _ in range(len(cuisines))])})")
                    for cuisine in cuisines:
                        arguments.append(cuisine)

                if constraints:
                    query += " WHERE "
                    query += " AND ".join(constraints)
                
                cursor.execute(query, tuple(arguments))

                __add_to_results(cursor.fetchall())

                return (responseval, 200)
            except (IndexError, ValueError, KeyError) as e:
                print(e)
                return ({'msg': "Invalid request"}, 400)

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
        SELECT r.name, r.description, c.name, m.name, r.servingSize
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
            
        r_name, r_description, c_name, m_name, r_sS = recipe
       
        cursor.execute("SELECT ingredient,quantity,grams,millilitres FROM recipe_ingredients WHERE r_id=%s", (r_id))
        ingredients = cursor.fetchall()

        response = {
            "Name" : r_name,
            "Description" : r_description,
            "Cuisine" : c_name,
            "Meal Type" : m_name,
            "Serving Size" : r_sS,
            "Ingredients" : list()
        }

        for ingredient in ingredients:
            i_id, quantity, grams, mL = ingredient

            cursor.execute("SELECT name,calories,fat,sodium,carbohydrates,fiber,sugars,protein FROM ingredients WHERE id=%s", (i_id,))
            try:
                name,calories,fat,sodium,carbohydrates,fiber,sugars,protein = cursor.cursor.fetchone()[0]
            except ValueError:
                # This ingredient doesn't exist
                pass
            
            ingredient_info = {
                "Name" : name,
                "Calories" : calories,
                "Fat" : fat,
                "Sodium" : sodium,
                "Carbohydrates" : carbohydrates,
                "Fiber" : fiber,
                "Sugars" : sugars,
                "Protein" : protein,
                "Quantity" : quantity,
                "Grams" : grams,
                "Millilitres (mL)" : mL,
            }
            response["Ingredients"].append(ingredient_info)
        return response, 200

@api.route('/get_recipe', methods=['GET'])
@cross_origin()
def get_recipes():
    response = []
    cursor.execute("SELECT * FROM recipes;")
    recipes = cursor.fetchall() # cursor.fetchal() returns a list of tuples

    result = {
        "Recipes":[]
    }

    for recipe in recipes:
        id,name,description,cuisine,mealtype,servingsize,uploader = recipe
        result["Recipes"].append({
            "id":id,
            "name":name,
            "description":description,
            "cuisine":cuisine,
            "mealtype":mealtype,
            "servingSize":servingsize,
            "uploader":uploader
        })

    return result

@api.route('/view/recipe/<r_id>', methods=['GET'])
@cross_origin()
def find_recipe(r_id):
    # response = []
    # cursor.execute("SELECT * FROM recipes where id = %s;", (id,))
    # row = cursor.fetchone()

    # tempDict = {}
    # tempDict['id'] = row[0]
    # tempDict['name'] = row[1]
    # tempDict['description'] = row[2]
    # tempDict['cuisine'] = row[3]
    # tempDict['mealtype'] = row[4]
    # tempDict['servingsize'] = row[5]
    # tempDict['uploader'] = row[6]

    # response.append(tempDict)

    query = """
        SELECT r.name, r.description, c.name, m.name, r.servingSize
        FROM recipes r
            JOIN cuisines c ON c.id=r.cuisine
            JOIN mealtypes m ON m.id = r.mealType
        WHERE r.id = %s;
    """
    cursor.execute(query, (r_id,))

    recipe = cursor.fetchone()
    if not recipe:
        return {'msg' : 'Recipe does not exist'}, 401
        
    r_name, r_description, c_name, m_name, r_sS = recipe
    
    cursor.execute("SELECT ingredient,quantity,grams,millilitres FROM recipe_ingredients WHERE r_id=%s", (r_id))
    ingredients = cursor.fetchall()

    response = {
        "Name" : r_name,
        "Description" : r_description,
        "Cuisine" : c_name,
        "MealType" : m_name,
        "ServingSize" : r_sS,
        "Ingredients" : list()
    }

    for ingredient in ingredients:
        i_id, quantity, grams, mL = ingredient

        cursor.execute("SELECT name,calories,fat,sodium,carbohydrates,fiber,sugars,protein FROM ingredients WHERE id=%s", (i_id,))
        try:
            name,calories,fat,sodium,carbohydrates,fiber,sugars,protein = cursor.fetchone()
        except ValueError:
            # This ingredient doesn't exist
            pass
        
        ingredient_info = {
            "Name" : name,
            "Calories" : calories,
            "Fat" : fat,
            "Sodium" : sodium,
            "Carbohydrates" : carbohydrates,
            "Fiber" : fiber,
            "Sugars" : sugars,
            "Protein" : protein,
            "Quantity" : quantity,
            "Grams" : grams,
            "Millilitres (mL)" : mL,
        }
        response["Ingredients"].append(ingredient_info)

    if not response["Ingredients"]: # Default value
        response["Ingredients"].append({
            "Name" : "N/A",
            "Calories" : 0,
            "Fat" : 0,
            "Sodium" : 0,
            "Carbohydrates" : 0,
            "Fiber" : 0,
            "Sugars" : 0,
            "Protein" : 0,
            "Quantity" : 0,
            "Grams" : 0,
            "Millilitres (mL)" : 0,
        })

    return response, 200

@api.route('/reviews/recipeid=<id>', methods=['GET'])
@cross_origin()
def reviews(id):

    # [TODO]: Replace the default '3' with a grab from the rating table
    # Consider restructuring this section

    if not str(id).isdigit:
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

    # response = []
    # cursor.execute("SELECT * FROM comments where r_id = %s;", (id,))
    # results = cursor.fetchall()

    # for row in results:
    #     tempDict = {}
    #     #tempDict['c_id'] = row[0]
    #     tempDict['r_id'] = row[1]
    #     tempDict['u_id'] = row[2]
    #     tempDict['description'] = row[3]
    #     tempDict['parent'] = row[4] #Parent comments will have null in this field

    #     response.append(tempDict)

    # return jsonify(response)

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

    #to do: Combine with ingredients table. Limit to last 50 meals
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
    if(u_id == null):
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
        return null

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
