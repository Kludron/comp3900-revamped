from hashlib import sha256
import psycopg2
import sys
from datetime import datetime, timedelta, timezone
import json
from urllib import response
from flask import (
    Flask,
    request,
    jsonify,
    Response
)
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    unset_jwt_cookies,
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
    if type(data) is dict:
        # Extract relevant information from the request [TODO: Is this all the data we need to check for security?]
        try:
            email = data['email']
            pword = data['password']
            passhash = sha256(str(pword + SALT).encode('utf8')).hexdigest()
        except (IndexError, ValueError):
            response["msg"] = "Invalid Email / Password"
            return (response, 401)
        # Run check on database
        cursor.execute("SELECT email FROM users WHERE email=%s AND pass_hash=%s;", (email, passhash)) # This is equivalent to a prepared statement

        # Validate that there was a user with these credentials
        try:
            isValid = cursor.fetchone()[0] == email
        except (TypeError, IndexError):
            isValid = False
        if not isValid:
            response["msg"] = "Invalid Email / Password"
            return (response, 401)
        
        token = create_access_token(identity=email)
        response["token"] = token # [TODO: Do we need to send more data back on a successful login?]
        return (response, 200) # Automatically responds with 200 code
    response["msg"] = "Invalid Email / Password"
    return (response, 401)

@api.route('/auth/register', methods=['POST'])
@cross_origin()
def register():
    data = json.loads(request.get_data())
    response = {}

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
        else:
            response["msg"] = "Error adding user, please try again"
            return (response, 401)
        
    response['msg'] = "Successfully registered"
    return (response, 200)

@api.route('/auth/change-password', methods=['PUT'])
@jwt_required()
@cross_origin()
def change():
    data = json.loads(request.get_data())
    response = {}
    if type(data) is dict:
        newpwd = data['newpassword']
        email = get_jwt_identity()
        # token = data['Authorisation']
        # cursor.execute(
        #                 "UPDATE users SET password = %s WHERE email = %s;", 
        #                 (newpwd, email)
        #                )
    return {"msg": "Success"}
    
    response['msg'] = "Password successfully changed"
    return (response, 200)

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

@api.route('/search', methods=['POST'])
@cross_origin()
def search():
    """
        At the moment, this search function returns a list of recipes that meet any of the criteria provided, in no order with no restrictions.
        This is something that will need to be fixed at a later date. The goal at the moment is to get the search returning valid recipes.
    """

    def _add_to_results(data):
        for recipe in data:
            name, desc, cuisine, mealT, ss = recipe
            responseval["recipes"].append({
                "Name": name.title(),
                "Description": desc,
                "Cuisine": cuisine.title(),
                "Meal Type": mealT,
                "Serving Size": ss,
            })
    
    try:
        data = json.loads(request.get_data())
    except json.decoder.JSONDecodeError:
        return ({'msg': "Invalid request"}, 400)
    if isinstance(data, dict):
        try:
            recS = data['search']
            ingS = data['ingredients']
            mltS = data['mealTypes']
            responseval = {
                "recipes" : []
            }
            # Search based on recipe name
            if recS:
                cursor.execute("""
                    SELECT r.name, r.description, c.name, m.name, r.servingSize
                    FROM recipes r
                        JOIN cuisines c ON c.id=r.cuisine
                        JOIN mealtypes m ON m.id = r.mealType
                    WHERE lower(r.name) LIKE CONCAT('%%',%s,'%%');
                """, (recS.lower(),))
                _add_to_results(cursor.fetchall())
            
            # Search based on ingredients [TODO: This searches for all recipes with any one of the ingredients. Fix this]
            for ingredient in ingS:
                if ingredient:
                    query = """
                    SELECT r.name, r.description, c.name, m.name, r.servingSize
                    FROM recipes r
                        JOIN cuisines c ON c.id=r.cuisine
                        JOIN mealtypes m ON m.id=r.mealType
                    WHERE EXISTS(
                        SELECT 1
                        FROM recipes r, ingredients i
                        JOIN recipe_ingredients ri ON ri.ingredient=i.id
                        WHERE lower(i.name) LIKE CONCAT('%%', %s, '%%')
                    );
                    """
                    cursor.execute(query, (ingredient.lower(), ))
                    _add_to_results(cursor.fetchall())

            for mealType in mltS:
                if mealType:
                    query = """
                    SELECT r.name, r.description, c.name, m.name, r.servingSize
                    FROM recipes r
                        JOIN cuisines c ON c.id=r.cuisine
                        JOIN mealtypes m ON m.id=r.mealType
                    WHERE lower(m.name) LIKE CONCAT('%%',%s,'%%');
                    """
                    cursor.execute(query, (mealType.lower(), ))
                    _add_to_results(cursor.fetchall())
            return (responseval, 200)
        except (IndexError, ValueError, KeyError) as e:
            print(e)
            return ({'msg': "Invalid request"}, 400)

# Need to test this
@api.route('/profile', methods=['GET', 'POST']) # Route tbc later
@jwt_required() # Apparently this should check whether or not the jwt is valid?
@cross_origin
def profile():
    data = request.get_json()
    response = {}
    if request.method == 'GET':
        email = auth.get_jwt_identity()
        query = """
        SELECT u.username, u.email, u.points FROM users u WHERE lower(u.email)=%s;
        """
        cursor.execute(query, (email,))
    elif request.method == 'POST':
        if type(data) is dict:
            token = data['token']
            # Verify token
            isAuthenticated = True # [TODO: Placeholder]
            if not isAuthenticated:
                response["msg"] = "User not authenticated"
                response["isSuccess"] = False
                return response, 403
            # Extract what settings were changed and update the SQL database to reflect those changes
            response["isSuccess"] = False # [TODO: Placeholder]. False because no changes were made
            return response
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

if __name__ == '__main__':
    api.run()
