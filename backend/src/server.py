import sys
from flask import (
        Flask,
        request
)
from flask_login import LoginManager

app = Flask(__name__)
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User

@app.route('/auth/login', methods=['GET', 'POST'])
def login():
    data = request.get_json()
    
    email = data['email']
    password = data['password']
    
    # Authentication documentation: https://flask-login.readthedocs.io/en/latest/
    return authUser(email, password) 

if __name__ == '__main__':
    app.run(debug=True, port=5000, 
