#!/usr/bin/env bash
for i in `find . -name index.html | grep 'deploy/CMSSelector/index.html'`; do
  lines=`cat $i | wc -l`
  echo $lines
  if (( $lines > 1 )); then
    exit 1;
  else
    exit 0;
  fi


done
