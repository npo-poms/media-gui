#!/bin/sh
echo "Start haproxy"
cd "$(dirname "$0")"
haproxy -f poms-gui.cfg
