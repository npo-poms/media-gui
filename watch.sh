#!/usr/bin/env bash

# Default values
# You can override by environment variables
# e.g.:
# ~/npo/media/trunk/media-gui$ API_PORT=8080 ./watch.sh
# API_HOST=https://poms.omroep.nl ./watch.sh
# API_HOST=https://poms-dev.omroep.nl ./watch.sh

localhost_fromsettings=$(awk 'FS="=" { if ($1 == "http.host") {print $2}}' $HOME/conf/poms-general.properties)
localhost=${localhost_fromsettings:-localhost}
: ${API_PORT:=8071}
: ${API_SERVER:=$localhost}
: ${API_SCHEME:=http}
: ${API_HOST:=$API_SCHEME://$API_SERVER:$API_PORT}
: ${PORT:=4000}

D=$(dirname $BASH_SOURCE)
DIR=`(cd $D ; pwd)`
PATH=$DIR/node:$PATH
ARGS=
RUN="watch:dev"

if [ $API_SCHEME = 'https' ] ; then
  if [ -e "$D/server.key" ] ; then
    echo "creating key"
  fi
  ARGS="SERVER_KEY_PATH=$D/server.key SERVER_CRT_PATH=$D/server.crt"
  RUN="watch:dev-secure"
fi

echo "Using Media GUI API host $API_HOST"

echo "Find frontend at $API_SCHEME://$localhost:${PORT}"
(cd $DIR ; npm_config_apihost=$API_HOST  $ARGS npm run $RUN)
