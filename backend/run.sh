#!/bin/bash

if [ -d venv]; then
    source venv/bin/activate;
fi

pip3 install -r requirements.txt

python3 src/api-server.py
