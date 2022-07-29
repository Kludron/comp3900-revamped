
import json

def search_general(method, data, cursor) -> tuple:
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
                    constraints.append("lower(r.name) LIKE CONCAT('%%',%s,'%%')")
                    arguments.append(search_query.lower())
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

def search_detailed(cursor, r_id) -> tuple:
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
        i_id, Quantity, Grams, Millilitres = ingredient

        cursor.execute("SELECT name,energy,protein,fat,fibre,sugars,carbohydrates,calcium,iron,magnesium,manganese,phosphorus FROM ingredients WHERE id=%s", (i_id,))
        try:
            Name,Energy,Protein,Fat,Fibre,Sugars,Carbohydrates,Calcium,Iron,Magnesium,Manganese,Phosphorus = cursor.fetchone()
        except ValueError:
            # This ingredient doesn't exist
            pass
        
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

    if not response["Ingredients"]: # Default value
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

def grab_ingredients(cursor, r_id) -> list or None:
    cursor.execute("""
        SELECT i.name,r.quantity,r.grams,r.millilitres 
        FROM recipe_ingredients r
        JOIN
            ingredients i on i.id = r.ingredient
        WHERE r_id=%s";
    """, (r_id, ))
    return cursor.fetchall()
