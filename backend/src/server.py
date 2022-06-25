import sys
from flask import (
        Flask,
        request
)
from flask_login import LoginManager, login_required
from user import User

app = Flask(__name__)
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)

@app.route('/auth/login', methods=['GET', 'POST'])
def login():
    data = request.get_json()
    
    email = data['email']
    password = data['password']
    
    # Authentication documentation: https://flask-login.readthedocs.io/en/latest/
    return authUser(email, password) 

@app.route('/auth/register', methods=['GET', 'POST'])
def register():
    pass

@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    pass

if __name__ == '__main__':
    app.run(debug=True, port=5000)
