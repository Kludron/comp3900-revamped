
import json

from platformdirs import user_cache_path

def customise_profile(data, email, cursor, conn):
    # This verification is incorrect. [TODO: Change this verification]
        data = json.loads(data)
        if type(data) is dict:
            cursor.execute('''
                SELECT u.id
                FROM users 
                WHERE email = %s;
            ''', (email,))
            id = cursor.fetchone()
            usersAllergens = data["usersAllergens"]
            pass
        return {'msg': 'This is not yet implemented'}, 404