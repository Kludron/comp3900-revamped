
"""
This file contains all required authentication functions for Recipe Recommendation System.
"""

import datetime
import json
import hashlib
import smtplib
import ssl
import string
import random
from flask_jwt_extended import (
    create_access_token
)
import psycopg2
from utils.gmail.gmail_auth import *
# JWT Authentication Information
JWT_KEY = os.environ.get("JWT_KEY")
JWT_EXPIRY = datetime.timedelta(hours=1)

# User hashing information
HASH_SALT = os.environ.get("HASH_SALT")

# Database server information
DB_HOST = os.environ.get("DB_HOST")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASS = os.environ.get("DB_PASS")

RVSTORAGE = 10 # Recently Viewed Storage

def auth_login(data, conn) -> tuple:
    """
    :param data:
        request data (JSON Object)
    :param conn:
        psycopg2.connect() return value.
    Description:
        This function authenticates the user based on credentials in the database, and returns a JSON object with
        the users `username`, `token` and `points`.
    """

    response = {}
    data = json.loads(data)

    with conn.cursor() as cursor:
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
            isValid = bool(vEmail == email)
        except (ValueError, psycopg2.ProgrammingError):
            isValid = False
        if not isValid:
            response["msg"] = "Invalid Email / Password"
            return response, 403
        
        token = create_access_token(identity=email, expires_delta=JWT_EXPIRY)
        response["token"] = token 
        response["username"] = username
        response["points"] = points

    return response, 200

def auth_register(data, conn) -> tuple:
    response = {}

    data = json.loads(data)

    name = data['username']
    email = data['email']
    pword = data['password']
    passhash = hashlib.sha256(str(pword + HASH_SALT).encode('utf8')).hexdigest()

    with conn.cursor() as cursor:
        #Check if user already has an account
        cursor.execute("SELECT email FROM users WHERE email=%s;", (email,))
        
        try:
            doesExist = bool(cursor.fetchone()[0] == email)
        except (ValueError, TypeError, psycopg2.ProgrammingError):
            doesExist = False

        if doesExist:
            response["msg"] = "An account with this email already exists"
            return (response, 401)

        #Continue to create account for new user
        try:
            cursor.execute(
                "INSERT INTO users(username, pass_hash, email) VALUES (%s, %s, %s);", 
                (name, passhash, email)
            )
            conn.commit()
        except psycopg2.errors.InFailedSqlTransaction:
            conn.rollback()

        #Move repeat code into function
        #Check if user already has an account
        cursor.execute("SELECT email FROM users WHERE email=%s;", (email,))
        try:
            doesExist = bool(cursor.fetchone()[0] == email)
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

def auth_change_password(data, identity, conn) -> tuple:
    with conn.cursor() as cursor:
        try:
            data = json.loads(data)
        except json.decoder.JSONDecodeError:
            return {'msg':'Invalid parameters'}, 401

        newpwd = data['newpassword']
        email = identity
        passhash = hashlib.sha256(str(newpwd + HASH_SALT).encode('utf8')).hexdigest()

        try:
            cursor.execute(
                "UPDATE users SET pass_hash = %s WHERE email = %s;",
                (passhash, email)
            )
        except psycopg2.errors.InFailedSqlTransaction:
            conn.rollback()
        else:
            conn.commit()
        return {"msg": "Success"}, 200

def auth_change_username(data, identity, conn) -> tuple:
    with conn.cursor() as cursor:
        try:
            data = json.loads(data)
        except json.decoder.JSONDecodeError:
            return {'msg':'Invalid parameters'}, 401

        if type(data) is dict:
            username = data['newusername']
            email = identity

            try:
                cursor.execute(
                    "UPDATE users SET username = %s WHERE email = %s;", 
                    (username, email)
                )
            except psycopg2.errors.InFailedSqlTransaction:
                conn.rollback()
            else:
                conn.commit()

            return {"msg": "Success"}, 200

def auth_forgot_password(data, credentials, cursor, conn) -> tuple:
    data = json.loads(data)
    response = {}

    reset_code = password_generator()

    receiver_email = data['email']
    message = "This is your temporary password " + reset_code

    passhash = hashlib.sha256(str(reset_code + HASH_SALT).encode('utf8')).hexdigest()

    try:
        cursor.execute(
            "UPDATE users SET pass_hash = %s WHERE email = %s;", 
            (passhash, receiver_email)
        )
        conn.commit()
    except psycopg2.errors.InFailedSqlTransaction:
        conn.rollback()
        
    sentEmail = sendEmail(receiver_email, message, credentials)
    return {'msg': 'Success'}, 200
 
def password_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

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

def auth_get_uid(email, conn):
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        if not isinstance(cursor.pgresult_ptr, type(None)):
            result = cursor.fetchone()
            try:
                return result[0]
            except TypeError:
                return None
    return None

def auth_update_viewed(data, email, conn):
    with conn.cursor() as cursor:
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
        except psycopg2.ProgrammingError:
            nStored = 0

        if isinstance(recipes, list):
            # Calculate number of items to delete
            nDelete = max(0, len(recipes) + nStored - RVSTORAGE)
            # Delete n recentlyViewed from the database
            if nDelete > 0:
                try:
                    cursor.execute("DELETE FROM user_recentlyviewed WHERE u_id=%s LIMIT %s;", (u_id, nDelete))
                    conn.commit()
                except Exception:
                    conn.rollback()

            # Insert recently viewed recipes into the db
            for recipe in recipes:
                try:
                    r_id = recipe['r_id']
                except KeyError: # Invalid recipe entry. Ignore it
                    continue
                try:
                    cursor.execute("INSERT INTO user_recentlyviewed(u_id, r_id) VALUES (%s, %s);", (u_id, r_id))
                    conn.commit()
                except (psycopg2.errors.UniqueViolation, psycopg2.errors.InFailedSqlTransaction):
                    conn.rollback()
            
        try:
            # Grab all of the recently viewed recipes (for display on the frontend)
            cursor.execute("SELECT r_id FROM user_recentlyviewed WHERE u_id=%s;", (u_id,))
            results = cursor.fetchall()
            recipes = list()
            for result in results:
                recipes.append(result[0])
            return {'Recipes':recipes}, 200
        except Exception as e:
            return {'Recipes':[]}, 200


def auth_recipe_uploader(email, conn, r_id) -> bool:
    with conn.cursor() as cursor:
        # Get the users id
        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        try:
            u_id = cursor.fetchone()[0]
        except (ValueError, TypeError, psycopg2.ProgrammingError):
            print("Failed pulling u_id")
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
        except (TypeError, psycopg2.ProgrammingError):
            print("Failed fetching recipe")
            return False

def auth_get_profile(email, conn):
    with conn.cursor() as cursor:
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
        try:
            usersAllergens = cursor.fetchall()
        except psycopg2.ProgrammingError:
            usersAllergens = []
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
