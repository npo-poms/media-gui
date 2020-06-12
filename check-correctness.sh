#!/usr/bin/env bash
for i in `find . -name index.html | grep 'deploy/CMSSelector/index.html'`; do
  lines=`cat $i | wc -l`
  echo $lines
  if (( $lines > 1 )); then
    echo "ERROR CMSSelector.index.html looks ERORNEOUS!!"
    exit 1;
  else
    echo "CMSSelector.index.html looks fine"
    exit 0;
  fi
done
