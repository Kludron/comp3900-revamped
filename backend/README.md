# F1v3guy5 Recipe Recommendation System

## Quickstart

This project requires npm, flask and python3-pip.

### Ubuntu / Debian-based distros (aptitude package manager)

```
apt update

apt install -y npm \
python3-pip \
python3-venv
```

Once these packages are installed, the frontend and backend will need to be run seperately.

### Frontend

Navigate to the frontend folder
```
cd frontend
```
and run the following to install required packages (this only needs to be run once)
```
npm install
```

After the required npm packages have been installed, to start the frontend server:
```
npm start
```

### Backend

Navigate to the backend folder
```
cd backend
```
From here, on Unix based systems, we can either start the program (using a virtual environment) by running the `start.sh` executable. Or, to install the required filed, run the following:
```
python -m pip install -r requirements.txt
```
The above only needs to be run once. Once this installs successfully, simply type:
```
flask run
```
To start the backend

### Open the program

Once `npm start` is run, the site should be launched in your default browser, but in the instance that it's not, navigate to `http://localhost:3000`