
import json
from utils.searching import grab_ingredients

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

def contrib_edit_recipe(data, cursor, conn, r_id):
    """
    {name:””, description:””, cuisine:””, mealtype:””, serving size:””, ingredients: [{name:””,...}], instructions}
    """
    try:
        data = json.loads(data)
    except json.decoder.JSONDecodeError:
        return ({'msg' : 'Invalid request type'}), 403

    try:
        name = data["name"]
        description = data["description"]
        servingsize = data["servingsize"]
        cuisine = data["cuisine"]
        mealtype = data["mealtype"]
        newIngredients = data["ingredients"]
        instructions = data["instructions"]
    except KeyError:
        return {'msg' : 'Invalid request parameters'}, 403

    try:
        """
        1. Check (again?) that the user owns the recipe
        2. Update the recipe name, description, serving size, instructions
        3. Update the cuisine
        4. Update the mealtype
        5. update the ingredients
        """

        # Update basic information
        cursor.execute("""
        UPDATE recipes
        SET
            name=%s,
            description=%s,
            servingsize=%s,
            instructions=%s
        WHERE
            id=%s;
        """, (name, description, servingsize, instructions, r_id))

        # Grab the cuisine id
        cursor.execute("SELECT id FROM cuisines WHERE name=%s", (cuisine, ))
        try:
            c_id = cursor.fetchone()[0]
        except ValueError:
            return {'msg' : 'Invalid cuisine'}, 400

        # Grab the mealtype id
        cursor.execute("SELECT id FROM mealtypes WHERE name=%s", (mealtype, ))
        try:
            m_id = cursor.fetchone()[0]
        except ValueError:
            return {'msg' : 'Invalid mealtype'}, 400

        # Update mealtype & cuisine
        cursor.execute("""
        UPDATE recipes
        SET
            cuisine=%s,
            mealtype=%s
        WHERE
            id=%s;
        """, (c_id, m_id, r_id))

        # Update ingredients
        #   1. Compare new ingredients to previous ingredients
        #   2. Upload new ingredients
        prevlist = grab_ingredients(cursor, r_id)
        prevIngredients=list()
        for ingredient in prevlist:
            i_name, i_quantity, i_grams, i_millilitres = ingredient
            prevIngredients.append(dict(
                name = i_name,
                quantity = i_quantity,
                grams = i_grams,
                millilitres = i_millilitres
            ))

        if not prevIngredients:
            return {'msg' : 'Could not load previous ingredients in recipe'}, 400 # [TODO: Maybe change this error code?]

        # Add new ingredients into the database
        for ingredient in prevIngredients:
            if ingredient not in newIngredients:
                toAdd.append(ingredient)
                try:
                    i_name = ingredient["name"]
                    i_quantity = ingredient["quantity"]
                    i_grams = ingredient["grams"]
                    i_millilitres = ingredient["millilitres"]
                    # Grab ingredient id
                    cursor.execute("SELECT id FROM ingredients WHERE name=%s", (i_name,))
                    i_id = cursor.fetchone()[0]
                    # Add ingredient into the database
                    cursor.execute(
                        "INSERT INTO recipe_ingredients(r_id, ingredient, quantity, grams, millilitres) VALUES (%s, %s, %s, %s, %s) "
                        , (r_id, i_id, i_quantity, i_grams, i_millilitres) 
                    )
                except (KeyError, psycopg2.ProgrammingError, ValueError()):
                    return {'msg' : 'Invalid request parameters (ingredients)'}, 403

        # Remove old ingredients from the database
        for ingredient in newIngredients:
            if ingredient not in prevIngredients:
                try:
                    # Grab ingredient details
                    i_name = ingredient["name"]
                    cursor.execute("SELECT id FROM ingredients WHERE name=%s", (i_name,))
                    i_id = cursor.fetchone()[0]

                    # Delete the ingredient
                    cursor.execute("DELETE FROM recipe_ingredients WHERE r_id=%s AND i_id=%s", (r_id,i_id))
                except (KeyError, ValueError):
                    return {'msg' : 'Invalid request parameters (ingredients)'}, 403
        conn.commit()
    except Exception:
        return {'msg' : 'An error occured while editing the recipe'}, 400
