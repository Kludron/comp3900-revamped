
import json

from platformdirs import user_cache_path

def customise_profile(data, email, cursor, conn):
        data = json.loads(data)
        if type(data) is dict:
            cursor.execute('''
                SELECT id
                FROM users 
                WHERE email = %s;
            ''', (email,))
            user_id = cursor.fetchone()[0]
            usersAllergens = data["usersAllergens"]

            cursor.execute('''
                DELETE FROM user_allergens
                WHERE u_id = %s;
            ''', (user_id,))
            for allergen in usersAllergens:
                cursor.execute('''
                    SELECT id 
                    FROM Allergens
                    WHERE name = %s;
                ''', (allergen,))
                allergen_id = cursor.fetchone()[0]

                cursor.execute('''
                    INSERT INTO user_allergens (u_id, a_id)
                    VALUES (%s, %s);
                ''', (user_id, allergen_id))
                conn.commit()
            return {'msg': 'Success'}, 200
        return {'msg': 'Data error'}, 404