import psycopg2
import sys
from datetime import datetime, timedelta, timezone
import json
from urllib import response
from flask import (
    Flask,
    request,
    jsonify
)
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    unset_jwt_cookies,
    jwt_required,
    JWTManager
)

api = Flask(__name__)
api.config["JWT_SECRET_KEY"] = '%_2>7$]?OVmqd"|-=q6"dz{|0=Nk\%0N' # Randomly Generated
api.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=4)

try:
    conn = psycopg2.connect(host="45.77.234.200", database="comp3900db", user="comp3900_user", password="yckAPfc9MX42N4")
    cursor = conn.cursor()
except Exception as e:
    sys.stderr.write("An error occurred while connecting to the database:\n{}\n".format(e))

jwt = JWTManager(api)

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if type(data) is dict:
        # Extract relevant information from the request [TODO: Is this all the data we need to check for security?]
        email = data['email']
        pword = data['password']

        # Run check on database
        cursor.execute("SELECT email FROM users WHERE email=%s AND pass_hash=%s;", (email, pword)) # This is equivalent to a prepared statement

        # Validate that there was a user with these credentials
        try:
            isValid = cursor.fetchone()[0] == email
        except (TypeError, IndexError):
            isValid = False
        finally:
            if not isValid:
                return {"msg" : "Invalid Email / Password"}, 401
        
        token = create_access_token(identity=email)
        response = {"token":token} # [TODO: Do we need to send more data back on a successful login?]
        return response # Automatically responds with 200 code

@api.route('/register', methods=['POST'])
def register():
    # Just a heads up, to save you some research time, this is what I did in my testing to add a user SQL style:
    # cursor.execute("INSERT INTO users(id, username, pass_hash, email) VALUES (%s, %s, %s, %s);", (id, username, str(sha256(password.encode('utf-8')).hexdigest()), email))
    # Also, when you insert into the database, be sure to add conn.commit() to commit the changes to the database, otherwise it won't save.
    pass

@api.route('/profile', methods=['POST']) # Route tbc later
@jwt_required
def profile():
    data = request.get_json()
    response = {}
    if type(data) is dict:
        token = data['token']
        # Verify token
        isAuthenticated = False
        if not isAuthenticated:
            response["msg"] = "User not authenticated"
            response["isSuccess"] = False
            return response, 403
        # Extract what settings were changed and update the SQL database to reflect those changes
        response["isSuccess"] = False # This is a placeholder. False because no changes were made
        return response
    response["isSuccess"] = False
    response["msg"] = "The data provided is not valid"
    return response

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