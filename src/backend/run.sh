#!/bin/bash

if [ -d venv ]; then
    echo "Loading virtual environment..."
    source venv/bin/activate
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "Loading virtual environment..."
    source venv/bin/activate
fi

pip3 install -r requirements.txt
flask run
