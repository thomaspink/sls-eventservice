#!/usr/bin/env bash

set -u -e -o pipefail

PUBLIC=`pwd`/public
THEMES=${PUBLIC}/wp-content/themes
THEME_SRC=`pwd`/src/theme
THEME_DEST=${THEMES}/sls-2017
DEV=false

for ARG in "$@"; do
  case "$ARG" in
    --dev=*)
      DEV=true
      ;;
    *)
      echo 'Unknown option $ARG.'
      exit 1
      ;;
  esac
done


#######################################
# Copies a file or folder
# Arguments:
#   param1 - File or folder to copy
#   param2 - Destination
# Returns:
#   None
#######################################
copyFile() {
  if [[ -d ${1} ]]; then
    cp -R ${1} ${2}
  elif [[ -f ${1} ]]; then
      cp ${1} ${2}
  fi
}

rm -rf $THEME_DEST
mkdir $THEME_DEST

FILES=${THEME_SRC}/*
for f in $FILES
do
  if [[ ${DEV} == true ]]; then
    echo '1';
  else
      copyFile $f $THEME_DEST
  fi
done
