
import sys
from flask import (
        Flask, 
        render_template,
        request,
        redirect,
        url_for
)
import psycopg2 as ps

try:
    database = "comp3900db"
    conn = ps.connect(host='localhost', database=database)
    cursor = conn.cursor()
except Exception as e:
    sys.stderr.write('Error connecting to database: {}\n'.format(e))
    sys.exit()

# Flask - Reach guide: https://dev.to/nagatodev/how-to-connect-flask-to-reactjs-1k8i

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        search = request.form['sr']
        cursor.execute("SELECT * FROM recipes r WHERE r.name=%s", (search,))
        results = cursor.fetchall()
        # if not results:
        #     cursor.execute("SELECT * FROM recipes;")
        #     results = cursor.fetchall()
        return render_template('index.html', results=results)
    elif request.method == 'GET':
        return render_template('index.html')

@app.route('/search/<search_request>', methods=['POST'])
def search(search_request):
    if request.method == 'POST':
        return render_template('search.html', results=search_request)
        

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8080)
