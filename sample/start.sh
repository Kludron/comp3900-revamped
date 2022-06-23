#!/bin/bash

# This is a script to start up the server for use on vlab instances.

I=/usr/lib/postgresql/13
PGDATA=/localstorage/$USER/pgsql/data
PGHOST=$PGDATA
LD_LIBRARY_PATH=$I/lib
PATH=$I/bin:$PATH
export PGDATA PGHOST LD_LIBRARY_PATH PATH

# alias p0="$I/bin/pg_ctl stop"
# alias p1="$I/bin/pg_ctl -l $PGDATA/log start"
/usr/lib/postgresql/13/bin/pg_ctl -l log.output start

dropdb comp3900db
createdb comp3900db
psql -f init.sql comp3900db
python3 src/server.py
