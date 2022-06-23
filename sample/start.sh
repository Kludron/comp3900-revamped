#!/bin/bash

# This is a script to start up the server for use on vlab instances.
dropdb comp3900db
createdb comp3900db
psql -f init.sql comp3900db