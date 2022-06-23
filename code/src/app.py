from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy

import psycopg2

app = Flask(__name__)

ENV = 'prod'

#dev database
if ENV == 'dev':
  app.debug=True
  app.config['SQLALCHEMY_DATABASE_URI']='postgresql://postgres:password@localhost/recipes'

#production database
else:
  app.debug=False
  app.config['SQLALCHEMY_DATABASE_URI']='postgres://hqcjsfmtcgolnv:6ddc65d4b32a0fcfdd101d02c2ee93be3b3ac903f0eb9e8a36f135d34e8a7a7c@ec2-52-73-184-24.compute-1.amazonaws.com:5432/dfesh941aq7vmi'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False

db=SQLAlchemy(app) # Database object

class Recipe(db.Model):
  __tablename__='recipes'
  id=db.Column(db.Integer,primary_key=True)
  name=db.Column(db.String(40))
  ingredients=db.Column(db.String(40))
 
  def __init__(self,name,ingredients):
    self.name=name
    self.ingredients=ingredients


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)