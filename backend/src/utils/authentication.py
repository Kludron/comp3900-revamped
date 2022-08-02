
"""
This file contains all required authentication functions for Recipe Recommendation System.
"""

import datetime
import json
import hashlib
import smtplib
import ssl
from flask_jwt_extended import (
    create_access_token
)
import psycopg2

# JWT Authentication Information
JWT_KEY = '%_2>7$]?OVmqd"|-=q6"dz{|0=Nk\%0N'
JWT_EXPIRY = datetime.timedelta(hours=1)

# User hashing information
HASH_SALT = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'

# Database server information
DB_HOST = '45.77.234.200'
DB_NAME = 'comp3900db'
DB_USER = 'comp3900_user'
DB_PASS =  'yckAPfc9MX42N4'

RVSTORAGE = 10 # Recently Viewed Storage

def auth_login(data, cursor) -> tuple:
    """
    :param data:
        request data (JSON Object)
    :param cursor:
        psycopg2.connect() return value.
    Description:
        This function authenticates the user based on credentials in the database, and returns a JSON object with
        the users `username`, `token` and `points`.
    """

    response = {}
    data = json.loads(data)
    try:
        email = data['email']
        pword = data['password']
        passhash = hashlib.sha256(str(pword + HASH_SALT).encode('utf8')).hexdigest()
    except ValueError:
        response["msg"] = "Invalid Email / Password"
        return response, 403
    # Run check on database
    cursor.execute("SELECT email, username, points FROM users WHERE email=%s AND pass_hash=%s;",(email, passhash))

    # Validate that there was a user with these credentials
    try:
        vEmail, username, points = cursor.fetchone()
        isValid = vEmail == email
    except (ValueError, TypeError, psycopg2.ProgrammingError):
        isValid = False
    if not isValid:
        response["msg"] = "Invalid Email / Password"
        return response, 403
    
    token = create_access_token(identity=email, expires_delta=JWT_EXPIRY)
    response["token"] = token 
    response["username"] = username
    response["points"] = points

    return response, 200

def auth_register(data, cursor, conn) -> tuple:
    response = {}

    data = json.loads(data)

    name = data['username']
    email = data['email']
    pword = data['password']
    passhash = hashlib.sha256(str(pword + HASH_SALT).encode('utf8')).hexdigest()

    #Check if user already has an account
    cursor.execute("SELECT email FROM users WHERE email=%s;", (email,))
    
    try:
        doesExist = cursor.fetchone()[0] == email
    except (ValueError, TypeError, psycopg2.ProgrammingError):
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
    except (ValueError, TypeError, psycopg2.ProgrammingError):
        doesExist = False

    if doesExist:
        conn.commit()
        token = create_access_token(identity=email, expires_delta=JWT_EXPIRY)
        response['token'] = token
    else:
        response["msg"] = "Error adding user, please try again"
        return (response, 401)
        
    response['msg'] = "Successfully registered"
    return (response, 200)

def auth_logout() -> tuple:
    pass

def auth_change_password(data, identity, cursor, conn) -> tuple:
    try:
        data = json.loads(data)
    except json.decoder.JSONDecodeError:
        return {'msg':'Invalid parameters'}, 401

    if type(data) is dict:
        newpwd = data['newpassword']
        email = identity
        passhash = hashlib.sha256(str(newpwd + HASH_SALT).encode('utf8')).hexdigest()

        cursor.execute(
            "UPDATE users SET pass_hash = %s WHERE email = %s;", 
            (passhash, email)
        )

        conn.commit()
        return {"msg": "Success"}, 200

def auth_change_username(data, identity, cursor, conn) -> tuple:
    try:
        data = json.loads(data)
    except json.decoder.JSONDecodeError:
        return {'msg':'Invalid parameters'}, 401

    if type(data) is dict:
        username = data['newusername']
        email = identity

        cursor.execute(
            "UPDATE users SET username = %s WHERE email = %s;", 
            (username, email)
        )

        conn.commit()
        return {"msg": "Success"}, 200

def auth_forgot_password(data) -> tuple:
    data = json.loads(data)
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

def auth_jwt_refresh(expiry, identity, response) -> tuple:
     # If the user is active within 5 minutes after their token expires, refresh their expiry time.
    timeframe_minutes = 5
    try:
        now = datetime.now(datetime.timezone.utc)
        target = datetime.timestamp(now + datetime.timedelta(minutes=timeframe_minutes))
        if target > expiry:
            token = create_access_token(identity=identity, expires_delta=JWT_EXPIRY)
            data = response.get_json()
            if type(data) is dict:
                data["token"] = token
                response.data = json.dumps(data) # Response is of type flask.request
        return response
    except (RuntimeError, KeyError):
        return response

def auth_get_uid(email, cursor):
    print('++++'+email+'++++')
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    if not isinstance(cursor.pgresult_ptr, type(None)):
        result = cursor.fetchone()
        print(result)
        try:
            return result[0]
        except TypeError:
            return None
    # try:
    #     return result[0]
    # except (TypeError,psycopg2.ProgrammingError):
    return None


def auth_update_viewed(data, email, cursor, conn):

    # Grab the users u_id
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    try:
        u_id = cursor.fetchone()[0]
    except (TypeError, psycopg2.ProgrammingError):
        return {'msg' : 'Authentication failed'}, 403

    try:
        data = json.loads(data)
        recipes = data["recentlyViewed"]
    except (KeyError, json.decoder.JSONDecodeError):
        if isinstance(data, bytes):
            return {'mgs' : 'No recently viewed recipes passed through'}, 200
        return {'msg' : 'Invalid parameters'}, 400

    # Get a count of the number of recently viewed recipes are stored for that user
    cursor.execute("SELECT COUNT(u_id) FROM user_recentlyviewed WHERE u_id=%s;", (u_id,))
    try:
        nStored = cursor.fetchone()[0]
    except TypeError:
        return {'msg' : 'An error occured when grabbing users recently viewed recipes'}, 500

    # Calculate number of items to delete
    nDelete = max(0, len(recipes) + nStored - RVSTORAGE)
    # Delete n recentlyViewed from the database
    cursor.execute("DELETE FROM user_recentlyviewed WHERE u_id=%s LIMIT %s;", (u_id, nDelete))

    # Insert recently viewed recipes into the db
    for recipe in recipes:
        try:
            r_id = recipe['r_id']
        except KeyError: # Invalid recipe entry. Ignore it
            pass
        cursor.execute("INSERT INTO user_recentlyviewed(u_id, r_id) VALUES (%s, %s)", (u_id, r_id))

    conn.commit()
    return {'msg' : 'Successfully updated recently viewed table'}, 200


def auth_recipe_uploader(email, cursor, r_id) -> bool:
    # Get the users id
    cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
    try:
        u_id = cursor.fetchone()[0]
    except (ValueError, TypeError, psycopg2.ProgrammingError):
        return False
    # Check that the user id matches the recipe's uploader id
    query = """
    SELECT 1
    FROM recipes r
        JOIN cuisines c ON c.id=r.cuisine
        JOIN mealtypes m ON m.id = r.mealType
    WHERE r.uploader = %s AND r.id = %s;
    """
    cursor.execute(query, (u_id,r_id))
    
    try:
        if cursor.fetchone()[0]:
            return True
    except (ValueError, TypeError, psycopg2.ProgrammingError):
        return False
    finally:
        # Fail close (fail false)
        return False

def auth_get_profile(email, cursor):
    response={}
    query = """
    SELECT u.id, u.username, u.email, u.points FROM users u WHERE lower(u.email)=%s;
    """
    cursor.execute(query, (email,))
    try:
        u_id, username, email, points = cursor.fetchone()
    except (ValueError, psycopg2.ProgrammingError, TypeError):
        return {'msg' : 'Authentication Error'}, 403

    # Grab Allergens
    cursor.execute("""
        SELECT a.name FROM allergens a;
    """, (u_id,))
    allAllergens = cursor.fetchall()

    cursor.execute("""
        SELECT a.name
        FROM user_allergens ua, allergens a
        WHERE ua.a_id = a.id
        AND ua.u_id = %s;
    """, (u_id,))
    usersAllergens = cursor.fetchall()
    response = {
        'Username' : username,
        'Email' : email,
        'Points' : points,
        'allAllergens' : [], 
        'usersAllergens': [], 
    }
    
    for allergen in allAllergens:
        try:
            response["allAllergens"].append(allergen[0])
        except KeyError:
            # No allergies found? This might not even be run in that case.
            pass
    
    for allergen in usersAllergens:
        try:
            response["usersAllergens"].append(allergen[0])
        except KeyError:
            pass

    return response, 200
