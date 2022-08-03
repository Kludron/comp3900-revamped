
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
from utils.gmail_auth import * 

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
            doesExist = cursor.fetchone()[0] == email
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

def auth_change_password(data, identity, conn) -> tuple:
    try:
        data = json.loads(data)
    except json.decoder.JSONDecodeError:
        return {'msg':'Invalid parameters'}, 401

    if type(data) is dict:
        newpwd = data['newpassword']
        email = identity
        passhash = hashlib.sha256(str(newpwd + HASH_SALT).encode('utf8')).hexdigest()

        try:
            cursor.execute(
                "UPDATE users SET pass_hash = %s WHERE email = %s;", 
                (passhash, email)
            )
            conn.commit()
        except psycopg2.errors.InFailedSqlTransaction:
            conn.rollback()
        return {"msg": "Success"}, 200

def auth_change_username(data, identity, conn) -> tuple:
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
            conn.commit()
        except psycopg2.errors.InFailedSqlTransaction:
            conn.rollback()
        return {"msg": "Success"}, 200

def auth_forgot_password(u_id, cursor, conn) -> tuple:
    response = {}

    temp_pwd = 'dslfj1' #placeholder
    passhash = hashlib.sha256(str(temp_pwd + HASH_SALT).encode('utf8')).hexdigest()
    #0bda9232c7881aa1771b8fc3b585d9b1c388a4eb1ed80bf0a580a1ebc89db3ab

    cursor.execute("UPDATE users SET pass_hash = %s WHERE email = %s;", (passhash, u_id))
    conn.commit()
 
    message = """
    Subject: Hi there

    This is your password temporary password """ + temp_pwd

    sendEmail(u_id, message)
    return {'msg': 'Success'}, 200

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
        # try:
        #     return result[0]
        # except (TypeError,psycopg2.ProgrammingError):
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
                except psycopg2.errors.InFailedSqlTransaction:
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
            cursor.execute("SELECT r_id FROM user_recentlyviewed WHERE u_id=%s;", (u_id,))
            return {'Recipes':[recipe[0] for recipe in cursor.fetchall()]}
        except (TypeError, psycopg2.ProgrammingError, psycopg2.errors.InFailedSqlTransaction):
            return {'Recipes':[]}
        return {'msg' : 'Successfully updated recently viewed table'}, 200


def auth_recipe_uploader(email, conn, r_id) -> bool:
    with conn.cursor() as cursor:
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
