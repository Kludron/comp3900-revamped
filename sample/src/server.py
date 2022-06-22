
import sys
from flask import (
        Flask, 
        render_template,
        request,
        url_for
)

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        return render_template('index.html', results=request.search)
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8080)
