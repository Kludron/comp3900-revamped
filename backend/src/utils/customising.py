
import json

def customise_profile(data, email):
    # This verification is incorrect. [TODO: Change this verification]
        data = json.loads(data)
        if type(data) is dict:
            pass
        return {'msg': 'This is not yet implemented'}, 404