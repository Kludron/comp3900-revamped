def eaten(id):
    data = json.loads(request.get_data())
    response = {}
    
    r_id = data["r_id"]
    dateString = datetime.today().strftime('%d/%m/%Y')
    u_id = getUserId()
    if(u_id == null):
        return ("msg: user does not exist", 401)

    cursor.execute("INSERT INTO mealHistory(u_id, r_id, date) VALUES (%s, %s, %s);", (r_id, TO_DATE(dateString, 'DD/MM/YYYY')))

    return (response, 200)

def IntakeOverview():
    # insert into meal_history(u_id, r_id, date) values (2, 1, '2022-07-26');

    #kj
    #energy         
#
    #g
    #protein         
    #fat             
    #fibre           
    #sugars          
    #carbohydrates   
#
    #mg
    #calcium         
    #iron            
    #magnesium - IGNORED       
    #manganese - IGNORED      
    #phosphorus - IGNORED

    data = json.loads(request.get_data())
    response = {}
    
    r_id = data["r_id"]
    u_id = getUserId()
    if(u_id == null):
        return ("msg: user does not exist", 401)

    cursor.execute("SELECT * from mealHistory(u_id, r_id, date) VALUES (%s, %s, %s);", (r_id, TO_DATE(dateString, 'DD/MM/YYYY')))
    
    #CREATE OR REPLACE VIEW intake_overview AS
    #SELECT *
    #FROM (SELECT * FROM meal_history WHERE u_id = u_id** ORDER BY date LIMIT '2022-06-26', '2022-07-26') AS history
    #JOIN recipe_ingredients on history.r_id = recipe_ingredients.r_id AS rlist
    #JOIN Ingredients on rlist.ingredient = Ingredients.id;

    cursor.execute("""
                    CREATE OR REPLACE VIEW intake_sum AS
                    SELECT ISNULL(id, 'Total') AS id,
                            energy,
                            protein, 
                            fat,
                            fibre,
                            sugars,
                            carbohydrates,
                            calcium,
                            iron,
                            magnesium
                    FROM (  SELECT
                            SUM(energy),
                            SUM(protein), 
                            SUM(fat),
                            SUM(fibre),
                            SUM(sugars),
                            SUM(carbohydrates),
                            SUM(calcium),
                            SUM(iron),
                            SUM(magnesium)
                            FROM intake_overview
                            GROUP BY id WITH ROLLUP
                        ) AS intake
                    """)
    overview = cursor.fetchone()
    
    return (response, 200)

def find_imbalance():
    check_nutrients = [('protein', 70), ('fat', 60), ('fibre', 27), ('sugars', 27), ('carbohydrates', 300), ('calcium', 2500), ('iron', 12), ('magnesium', 400)]

    nutrient_diff = 0
    recommended_nutrient = ""
    for nutrient in check_nutrients:
        cursor.execute("SELECT SUM(%s) FROM intake_overview;", (nutrient[0], ))
        actual_intake = float(cursor.fetchone()[0])
        expected_intake = nutrient[1]
        diff = expected_intake - actual_intake
        if(abs(diff) > nutrient_diff):
            nutrient_diff = diff
            recommended_nutrient = nutrient[0]

    return nutrient_diff, recommended_nutrient

def find_recipe_more(recommended_nutrient, amount):
    sort = ""
    if amount > 0:
        sort = "DESC"   #higher values will be at the start of the table
    elif amount < 0:
        sort = "ASC"    #lower values will be at the start of the table
    cursor.execute( """ CREATE VIEW rid_ingredients AS
                        SELECT *
                        FROM recipe_ingredients
                        JOIN Ingredients on recipe_ingredients.ingredient = Ingredients.id
                    """)

    cursor.execute("SELECT * FROM rid_ingredients ORDER BY %s %s", (recommended_nutrient, sort))

    recommended_recipes = []
    recipes = cursor.fetchall()

    count = 0
    for recipe in recipes:
        recommended_recipes.append(recipe[0])
        if count >= 2:
            break
        count += 1

    return recommended_recipes

def recommend():
    nutrient_diff, recommended_nutrient = find_imbalance()

    #Find the single largest nutrient imbalance and recommend 3 recipes to bring diet back into balance
    recipes = find_recipe(recommended_nutrient, nutrient_diff)
    
    #Returning a list of food categories that need improvement on
    return response

def setGoal():
    data = json.loads(request.get_data())
    response = {}
    
    try:
        caloricGoal = data["goal"]
    except KeyError():
        return {"msg: wrong key", 401}

    u_id = getUserId()
    if(u_id == null):
        return ("msg: user does not exist", 401)

    #To do: need to add goal column
    cursor.execute("UPDATE users SET goal = %s WHERE u_id = %s;", (caloricGoal, u_id))

    return (response, 200)

def getUserId():
    # This section is to verify user identity
    email = get_jwt_identity()
    query = "SELECT id FROM users WHERE email=%s"
    cursor.execute(query, (email,))
    try:
        uploader = cursor.fetchone()[0]
        return uploader
    except IndexError:
        return null