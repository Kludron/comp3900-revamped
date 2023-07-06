
import json
from utils.searching import grab_ingredients
import psycopg2

def contrib_post_recipe(email, data, conn):
    
    #[TODO] Include the guide on how to make the recipe...
    with conn.cursor() as cursor:
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
            instructions = data['instructions']
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

        try:
            cursor.execute(
                # Need cuisine id &  mealtype id
                "INSERT INTO recipes(name, description, cuisine, mealType, servingSize, uploader, instructions) VALUES (%s, %s,%s, %s, %s, %s, %s);", 
                (name, description, c_id, m_id, servingsize, uploader, instructions)
            )
            conn.commit()
        except psycopg2.errors.InFailedSqlTransaction:
            conn.rollback()

        cursor.execute("SELECT id FROM recipes ORDER BY id DESC LIMIT 1")
        try:
            r_id = cursor.fetchone()[0]
        except IndexError:
            return {'msg': 'An error has occurred while uploading your recipe'}, 400 # [TODO] This error code will need to be changed
        
        for ingredient in ingredients:
            try:
                name = ingredient['Name']
                try:
                    quantity = ingredient['quantity']
                    grams = ingredient['grams']
                    millilitres = ingredient['millilitres']
                except KeyError:
                    quantity = 0
                    grams = 0
                    millilitres = 0
            except KeyError:
                return {'msg' : 'Incorrect Parameters'}, 401

            # Grabbing ingredient id and validating that the ingredient exists. ingredient names are all unique
            cursor.execute("SELECT id FROM ingredients WHERE name = %s", (name, ))
            try:
                i_id = cursor.fetchone()[0]
            except IndexError:
                return {'msg' : 'Invalid ingredient supplied'}, 401

            try:
                cursor.execute(
                    "INSERT INTO recipe_ingredients(r_id, ingredient, quantity, grams, millilitres) VALUES (%s, %s, %s, %s, %s) ", (r_id, i_id, quantity, grams, millilitres) 
                )
                conn.commit()
            except psycopg2.errors.InFailedSqlTransaction:
                conn.rollback()
            # Checking that the recipe and ingredient were added.
            cursor.execute(
                "SELECT * FROM recipe_ingredients WHERE r_id=%s AND ingredient=%s", (r_id, i_id)
            )

            try:
                if not cursor.fetchone():
                    return {'msg' : 'Error adding ingredient'}, 400
            except psycopg2.ProgrammingError:
                return {'msg' : 'Error adding ingredient'}, 400

    conn.commit()
    response['msg'] = "Recipe successfully added"
    return (response, 200)

def contrib_edit_recipe(data, conn, r_id):
    """
    {name:””, description:””, cuisine:””, mealtype:””, serving size:””, ingredients: [{name:””,...}], instructions}
    """
    with conn.cursor() as cursor:
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

            query = ""
            args = []
            if any([name,description,servingsize,instructions]):
                query += "UPDATE recipes SET "
            
            if description:
                args.append(description)
            if servingsize:
                query += " servingsize=%s "
                args.append(servingsize)
            if instructions:
                query += " instructions=%s "
                args.append(instructions)

            if any([name,description,servingsize,instructions]):
                query += " WHERE id=%s"
                args.append(r_id)
                try:
                    cursor.execute(query, tuple(args))
                except Exception as e:
                    conn.rollback()
                else:
                    conn.commit()


            # Grab the cuisine id
            if cuisine:
                cursor.execute("SELECT id FROM cuisines WHERE name=%s", (cuisine, ))
                try:
                    c_id = cursor.fetchone()[0]
                    try:
                        cursor.execute("UPDATE recipes SET cuisine=%s WHERE id=%s", (c_id, r_id))
                    except Exception:
                        conn.rollback()
                    else:
                        conn.commit()
                except ValueError:
                    return {'msg' : 'Invalid cuisine'}, 400

            # Grab the mealtype id
            if mealtype:
                cursor.execute("SELECT id FROM mealtypes WHERE name=%s", (mealtype, ))
                try:
                    m_id = cursor.fetchone()[0]
                    try:
                        cursor.execute("UPDATE recipes SET mealtype=%s WHERE id=%s", (m_id, r_id))
                    except Exception:
                        conn.rollback()
                    else:
                        conn.commit()
                except ValueError:
                    return {'msg' : 'Invalid mealtype'}, 400

            # Update ingredients
            #   1. Compare new ingredients to previous ingredients
            #   2. Upload new ingredients
            if newIngredients:
                prevlist = grab_ingredients(conn, r_id)
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

                # Delete old ingredients
                # Add new ingredients

                for ingredient in newIngredients:
                    if ingredient not in prevIngredients:
                        try:
                            i_name = ingredient["Name"]
                            # Grab ingredient id
                            cursor.execute("SELECT id FROM ingredients WHERE name=%s", (i_name,))
                            i_id = cursor.fetchone()[0]
                            # Add ingredient into the database
                            try:
                                cursor.execute(
                                    "INSERT INTO recipe_ingredients(r_id, ingredient, quantity, grams, millilitres) VALUES (%s, %s, %s, %s, %s) "
                                    , (r_id, i_id, 0, 0, 0) 
                                )
                            except Exception:
                                conn.rollback()
                            else:
                                conn.commit()
                        except (KeyError, psycopg2.ProgrammingError, ValueError) as e:
                            return {'msg' : 'Invalid request parameters (ingredients)'}, 400

                # Remove old ingredients from the database
                for ingredient in prevIngredients:
                    if ingredient not in newIngredients:
                        try:
                            # Grab ingredient details
                            
                            i_name = ingredient["name"]
                            cursor.execute("SELECT id FROM ingredients WHERE name=%s", (i_name,))
                            i_id = cursor.fetchone()[0]

                            # Delete the ingredient
                            try:
                                cursor.execute("DELETE FROM recipe_ingredients r WHERE r.r_id=%s AND r.ingredient=%s", (r_id,i_id))
                                conn.commit()
                            except psycopg2.errors.InFailedSqlTransaction:
                                conn.rollback()
                        except (ValueError, KeyError) as e:
                            return {'msg' : 'Invalid request parameters (ingredients)'}, 400
            return {'msg' : 'Successfully updated'}, 200
        except Exception as e:
            return {'msg' : 'An error occured while editing the recipe'}, 400

def contrib_review_recipe(email, r_id, data, conn) -> tuple:
    with conn.cursor() as cursor:
        # Get the users u_id
        cursor.execute("SELECT id FROM users WHERE email=%s", (email,))
        try:
            u_id = cursor.fetchone()[0]
        except TypeError:
            return {'msg', 'Error retrieving user from the database'}, 403
        
        print(data)

        try:
            data = json.loads(data)
            comment = data["comment"]
            rating = data["rating"]
            # toDelete = data["toDelete"]
        except (KeyError, json.decoder.JSONDecodeError):
            return {'msg', 'Invalid parameters'}, 400

        # Ensure rating is valid
        try:
            rating = int(rating)
            if rating < 0 or rating > 5:
                raise ValueError
        except ValueError:
            return {'msg' : 'Rating is not a valid number'}, 400

        # Check if they've already rated the recipe
        cursor.execute("SELECT 1 FROM recipe_rating WHERE u_id=%s AND r_id=%s", (u_id, r_id))
        try:
            if cursor.fetchone():
                # User has rated the recipe. Update their rating
                cursor.execute("UPDATE recipe_rating SET rating=%s WHERE u_id=%s AND r_id=%s", (rating, u_id, r_id))
            else:
                # User has not rated the recipe
                cursor.execute("INSERT INTO recipe_rating(u_id, r_id, rating) VALUES (%s, %s, %s)", (u_id, r_id, rating))
            conn.commit()
        except (psycopg2.ProgrammingError, psycopg2.errors.InFailedSqlTransaction):
            conn.rollback()

        # Add the comment
        if comment:
            try:
                cursor.execute("INSERT INTO comments(r_id, u_id, description) VALUES (%s,%s,%s)", (r_id, u_id, comment))
                conn.commit()
            except (psycopg2.ProgrammingError, psycopg2.errors.InFailedSqlTransaction):
                conn.rollback()
                return {'msg' : 'An error occured while posting the comment'}, 500

        conn.commit()
        return {'msg' : 'Successfully reviewed the recipe'}, 200

