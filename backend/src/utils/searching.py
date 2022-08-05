#################################
#
#   Search functions used for 
#   COMP3900 F1v3guy5 recipe
#   recommendation system.
#
#################################

import json
from utils.authentication import *
import psycopg2

def search_general(method, data, conn) -> tuple:
    with conn.cursor() as cursor:
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

        if method == 'GET':
            # Grab all ingredients
            # Grab all meal types
            # Grab all cuisines
            response = {}

            cursor.execute("SELECT name FROM ingredients")
            response['Ingredients'] = [dict(Name=x[0]) for x in cursor.fetchall()]
            cursor.execute("SELECT name FROM mealTypes")
            response['MealTypes'] = [x[0] for x in cursor.fetchall()]
            cursor.execute("SELECT name FROM cuisines")
            response['Cuisine'] = [x[0] for x in cursor.fetchall()]

            return response, 200
        elif method == 'POST':
            """
            1. Load the data passed through
            2. Do a big SQL query for each of these
            """

            try:
                data = json.loads(data)
            except json.decoder.JSONDecodeError as e:
                return ({'msg': "Invalid request type"}, 400)
            if isinstance(data, dict):
                try:
                    # Pull data
                    search_query : str = data['search']
                    ingredients : list = data['ingredients']
                    mealTypes : list = data['mealTypes']
                    cuisines : list = data['cuisines']
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
                        # Add text search to query
                        constraints.append("lower(r.name) LIKE CONCAT('%%',%s,'%%')")
                        arguments.append(search_query.lower())
                    if ingredients:
                        # Add ingredients search to query
                        constraints.append(f"""r.id IN (
                                        SELECT r_id
                                        FROM recipe_ingredients
                                        JOIN ingredients i ON ingredient=i.id
                                        WHERE i.name in ({','.join(['%s' for _ in range(len(ingredients))])})
                                    )""")
                        for ingredient in ingredients:
                            arguments.append(ingredient["Name"])
                    if mealTypes:
                        # Add mealtype search to query
                        constraints.append(f"m.name in ({','.join(['%s' for _ in range(len(mealTypes))])})")
                        for mealType in mealTypes:
                            arguments.append(mealType)
                    if cuisines:
                        # Add cuisine search to query
                        constraints.append(f"c.name in ({','.join(['%s' for _ in range(len(cuisines))])})")
                        for cuisine in cuisines:
                            arguments.append(cuisine)

                    if constraints:
                        query += " WHERE "
                        query += " AND ".join(constraints)
                    print(query, tuple(arguments))
                    cursor.execute(query, tuple(arguments))
                    results = cursor.fetchall()
                    __add_to_results(results)

                    return (responseval, 200)
                except (IndexError, ValueError, KeyError) as e:
                    print(e)
                    return ({'msg': "Invalid request"}, 400)

def search_detailed(conn, r_id) -> tuple:
    """
    parameters:
        :cursor: psycopg2 sql cursor
        :r_id: recipe id -> int
    details:
        This function returns detailed information about the specified
        recipe. This information includes:
            {
                Name,
                Description,
                Cuisine,
                MealType,
                ServingSize,
                Ingredients : [
                    {
                        Name,
                        Energy,
                        Protein,
                        Fat,
                        Fibre,
                        Sugars,
                        Carbohydrates,
                        Calcium,
                        Iron,
                        Magnesium,
                        Manganese,
                        Phosphorus,
                        Quantity,
                        Grams,
                        Millilitres
                    },
                ],
                Instructions
            }
    """
    with conn.cursor() as cursor:

        try:
            r_id = int(r_id)
        except ValueError:
            return {'msg' : 'Invalid recipe ID'}, 404

        query = """
            SELECT r.name, r.description, c.name, m.name, r.servingSize, r.instructions
            FROM recipes r
                JOIN cuisines c ON c.id=r.cuisine
                JOIN mealtypes m ON m.id = r.mealType
            WHERE r.id = %s;
        """
        try:
            cursor.execute(query, (r_id,))
        except Exception:
            conn.rollback()
        else:
            conn.commit()

        try:
            recipe = cursor.fetchone()
        except psycopg2.ProgrammingError:
            return {'msg' : 'Recipe does not exist'}, 401
            
        r_name, r_description, c_name, m_name, r_sS, r_instructions = recipe
        
        # Adjust this to use the grab_ingredients function.
        try:
            cursor.execute("SELECT ingredient,quantity,grams,millilitres FROM recipe_ingredients WHERE r_id=%s", (r_id,))
        except Exception:
            conn.rollback()
        else:
            conn.commit()
        try:
            ingredients = cursor.fetchall()
        except psycopg2.ProgrammingError:
            return {'msg' : 'Unable to grab ingredients'}, 400

        rating = 0
        cursor.execute('''
            SELECT AVG(rating) 
            FROM recipe_rating
            WHERE r_id = %s;
        ''', (r_id, ))
        try:
            rating = cursor.fetchone()[0]
        except:
            pass
        response = {
            "Name" : r_name,
            "Description" : r_description,
            "Cuisine" : c_name,
            "MealType" : m_name,
            "ServingSize" : r_sS,
            "Instructions" : r_instructions,
            "Ingredients" : list(),
            "Rating": rating,
        }

        for ingredient in ingredients:
            i_id, Quantity, Grams, Millilitres = ingredient

            try:
                cursor.execute("SELECT name,energy,protein,fat,fibre,sugars,carbohydrates,calcium,iron,magnesium,manganese,phosphorus FROM ingredients WHERE id=%s", (i_id,))
            except Exception:
                conn.rollback()
            else:
                conn.commit()


            try:
                Name,Energy,Protein,Fat,Fibre,Sugars,Carbohydrates,Calcium,Iron,Magnesium,Manganese,Phosphorus = cursor.fetchone()
            except (ValueError, psycopg2.ProgrammingError):
                # This ingredient doesn't exist
                continue
            
            ingredient_info = dict(
                Name=Name,
                Energy=Energy,
                Protein=Protein,
                Fat=Fat,
                Fibre=Fibre,
                Sugars=Sugars,
                Carbohydrates=Carbohydrates,
                Calcium=Calcium,
                Iron=Iron,
                Magnesium=Magnesium,
                Manganese=Manganese,
                Phosphorus=Phosphorus,
                Quantity=Quantity,
                Grams=Grams,
                Millilitres=Millilitres
            )
            response["Ingredients"].append(ingredient_info)

        # Set Default Values
        if not response["Ingredients"]:
            response["Ingredients"].append(dict(
                Name="N/A",
                Energy=0,
                Protein=0.0,
                Fat=0.0,
                Fibre=0.0,
                Sugars=0.0,
                Carbohydrates=0.0,
                Calcium=0.0,
                Iron=0.0,
                Magnesium=0.0,
                Manganese=0.0,
                Phosphorus=0.0,
                Quantity=0,
                Grams=0,
                Millilitres=0.0
            ))

        return response, 200

def grab_ingredients(conn, r_id) -> list or None:
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT i.name,r.quantity,r.grams,r.millilitres 
            FROM recipe_ingredients r
            JOIN
                ingredients i on i.id = r.ingredient
            WHERE r_id=%s
        """, (r_id, ))
        return cursor.fetchall()

def search_users_recipes(email, conn) -> tuple:
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        try:
            u_id=cursor.fetchone()[0]
        except (psycopg2.ProgrammingError, TypeError):
            return {'msg' : 'Authentication error'}, 403

        cursor.execute("SELECT id FROM recipes WHERE uploader=%s", (u_id,))
        try:
            recipes = [row[0] for row in cursor.fetchall()]
        except (TypeError, psycopg2.ProgrammingError):
            # Does this occur when user hasn't uploaded?
            return {'msg' : 'Something went wrong retrieving recipes'}, 500

        if not recipes:
            return {'msg' : 'No recipes found'}, 200

        response={'Recipes' : list()}
        for r_id in recipes:
            result, status_code = search_detailed(conn, r_id)
            if not status_code == 200: continue
            result["r_id"] = r_id
            response['Recipes'].append(result)

        return response, 200
