@api.route('/eaten/recipeid=<id>', methods=['POST'])
@cross_origin()
def eaten(id):
    data = json.loads(request.get_data())
    response = {}
    
    r_id = data["r_id"]
    dateString = datetime.today().strftime('%d/%m/%Y')
    u_id = getUserId()
    if(u_id == null):
        return ("msg: user does not exist", 401)

    #Note: need to add caloric values to ingredients
    cursor.execute("INSERT INTO mealHistory(u_id, r_id, date) VALUES (%s, %s, %s);", (r_id, TO_DATE(dateString, 'DD/MM/YYYY')))

    return (response, 200)

@api.route('/intake_overview', methods=['GET'])
@cross_origin()
def IntakeOverview():
    #Grain 
    #Vegetables
    #Fruit
    #Dairy 
    #Meat
    #Fatty

    data = json.loads(request.get_data())
    response = {}
    
    r_id = data["r_id"]
    u_id = getUserId()
    if(u_id == null):
        return ("msg: user does not exist", 401)

    #to do: Combine with ingredients table. Limit to last 50 meals
    cursor.execute("SELECT * from mealHistory(u_id, r_id, date) VALUES (%s, %s, %s);", (r_id, TO_DATE(dateString, 'DD/MM/YYYY')))

    return (response, 200)

@api.route('/recommend', methods=['GET'])
@cross_origin()
def recommend():
    grainGoal =  33
    vegetablesGoal = 16
    fruitGoal = 16
    dairyGoal = 15 
    meatGoal = 12
    fattyGoal = 7

    response = []

    #to do: Combine with ingredients table. Limit to last 50 meals
    cursor.execute("SELECT * from mealHistory(u_id, r_id, date) VALUES (%s, %s, %s);", (r_id, TO_DATE(dateString, 'DD/MM/YYYY')))
    grain, vegetables, fruit, dairy, meat, fatty = getIntakeOverview()

    goalDiff = {
        "grain" : abs(grainGoal - grain),
        "vegetables" : abs(vegetablesGoal - vegetables),
        "fruit" : abs(fruitGoal - fruit),
        "dairy" : abs(dairyGoal - dairy),
        "meat" : abs(meatGoal - meat),
        "fatty" : abs(fattyGoal - fatty)
    }

    #Imbalance if difference is > 15%
    for key, value in goalDiff.items():
        if value > 15:
            response.append(key)
    
    #Returning a list of food categories that need improvement on
    return response

@api.route('/setGoal', methods=['POST'])
@cross_origin()
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