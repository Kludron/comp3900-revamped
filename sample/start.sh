#!/bin/bash

# This is a script to start up the server for use on vlab instances.

I=/usr/lib/postgresql/13
#PGDATA=/localstorage/$USER/pgsql/data
PGDATA=$HOME/.local/pgsql/data
PGHOST=$PGDATA
LD_LIBRARY_PATH=$I/lib
PATH=$I/bin:$PATH
export PGDATA PGHOST LD_LIBRARY_PATH PATH

if [ ! -d $PGDATA ]; then
	mkdir -p $HOME/.local/pgsql/data
	/usr/lib/postgresql/13/bin/pg_ctl -D $PGDATA initdb
fi

sudo chown -R $(whoami) /var/run/postgresql

/usr/lib/postgresql/13/bin/pg_ctl -D $PGDATA -l log.output start

# The below needs to be run manually
dropdb comp3900db
createdb comp3900db
psql -f init.sql comp3900db
venv/bin/python3 src/server.py

