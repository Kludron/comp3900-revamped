
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
    conn = ps.connect("dbname="+database)
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
        cursor.prepare("SELECT r.name FROM recipes r WHERE r.name LIKE %s")
        retults = cursor.execute((search,))
        return render_template('index.html', results=results)
        # return redirect(url_for('search', search_request=request.form['search']))
    elif request.method == 'GET':
        return render_template('index.html')

@app.route('/search/<search_request>', methods=['POST'])
def search(search_request):
    if request.method == 'POST':
        return render_template('search.html', results=search_request)
        

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8080)
