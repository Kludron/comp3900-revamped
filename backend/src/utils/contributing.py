
import json

def contrib_post_recipe(email, data, cursor, conn):
    
    #[TODO] Include the guide on how to make the recipe...

    try:
        data = json.loads(data)
    except json.decoder.JSONDecodeError:
        return {'msg' : 'Invalid data format'}, 401
    response = {}

    # This section is to verify user identity
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