# F1v3guy5 Recipe Recommendation System

### Google Drive
https://drive.google.com/drive/folders/1gRJpRURyTGFYxh-9HWNVDomvBb3JXgL1?usp=sharing

### Jira Link
https://3900-h14a-f1v3guy5.atlassian.net

### InVision
https://ed862910.invisionapp.com/freehand/Sign-up-Login-Page-PFD1Gx8M4?dsid_h=eb2cf9e3164177962302ac5d23ba70f451a5bd47181073d92851038d9a64c91f&uid_h=956d5421432726ef71959336cdf7ccc70a68c343e21f4d2237d1f1ab1fcf7245


## Quickstart

This project requires npm, flask and python3-pip.

### Ubuntu / Debian-based distros (aptitude package manager)

```
apt update

apt install -y npm \
python3-pip \
python3-venv \
python3-flask
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

In a seperate shell, navigate to the backend folder

```
cd backend
```
From here, on Unix based systems, we can either start the program (using a virtual environment) by running the `start.sh` executable. Or, to install the required packages, run the following:

```
python3 -m pip install -r requirements.txt
```

The above only needs to be run once. Once this installs successfully, simply type:

```
flask run
```

To start the backend

### Open the program

Once `npm start` is run, the site should be launched in your default browser, but in the instance that it's not, navigate to `http://localhost:3000`
