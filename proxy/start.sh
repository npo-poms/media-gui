#!/bin/sh
cd "$(dirname "$0")"

#echo "Start haproxy"
#haproxy -f poms-gui.cfg


NGINX_DIR=${NGINX_DIR:='/usr/local/etc/nginx/servers'}

cp nginx-poms.config $NGINX_DIR
nginx -g 'daemon off;'