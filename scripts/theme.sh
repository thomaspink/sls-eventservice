#!/usr/bin/env bash

set -u -e -o pipefail

PUBLIC=`pwd`/public
THEME_SRC=`pwd`/src/theme
THEMES=${PUBLIC}/wp-content/themes

rm -rf ${THEMES}/sls-2017
mkdir ${THEMES}/sls-2017

FILES=${THEME_SRC}/*
for f in $FILES
do
  if [[ -d $f ]]; then
    echo "$f is a folder"
  elif [[ -f $f ]]; then
      echo "$f is a file"
  else
      echo "$f is not valid"
      exit 1
  fi
done
