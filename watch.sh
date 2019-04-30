#!/usr/bin/env bash

#Default values
#You can override by enviroment variables
# e.g.:
# ~/npo/media/trunk/media-gui$ API_PORT=8080 ./watch.sh
# API_HOST=https://poms.omroep.nl ./watch.sh
# API_HOST=https://poms-dev.omroep.nl ./watch.sh

localhost=`hostname`
: ${API_PORT:=8071}
: ${API_SERVER:=$localhost}
: ${API_SCHEME:=http}
: ${API_HOST:=$API_SCHEME://$API_SERVER:$API_PORT}


D=$(dirname $BASH_SOURCE)
DIR=`(cd $D ; pwd)`
PATH=$DIR/node:$PATH
CONSTANTS=$DIR/src/js/poms/constants.js
ARGS=
RUN="watch:dev"

if [ $API_SCHEME eq 'https' ] ; then
  if [ -e "$D/server.key" ] ; then
    echo "creating key"
  fi
  ARGS="SERVER_KEY_PATH=$D/server.key SERVER_CRT_PATH=$D/server.crt"
  RUN="watch:dev-secure"
fi

echo "Using Media Backend API host $API_HOST"

echo "Find frontend at $API-SCHEME://$localhost:4000"
echo "Making backup of $CONSTANTS"
cp $CONSTANTS $DIR/constants.js.bu
(cd $DIR ; NPM_CONFIG_APIHOST=$API_HOST NPM_CONFIG_SIGNONHOST=https://sso-dev.omroep.nl $ARGS npm run $RUN)
echo "Restoring $CONSTANTS"
mv -f $DIR/constants.js.bu $CONSTANTS
