#!/usr/bin/env bash

set -u -e -o pipefail

PUBLIC=`pwd`/public
THEMES_DIR=${PUBLIC}/wp-content/themes
THEME_SRC=`pwd`/src/theme
THEME_DEST=${THEMES_DIR}/sls-2017
DEV=false

for ARG in "$@"; do
  case "$ARG" in
    --dev)
      DEV=true
      ;;
    *)
      echo "Unknown option $ARG."
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

#######################################
# Virtual link a file or folder
# Arguments:
#   param1 - File or folder to copy
#   param2 - Destination
# Returns:
#   None
#######################################
linkFile() {
  if [[ -d ${1} ]]; then
    ln -s ${1} ${2}
  elif [[ -f ${1} ]]; then
    ln -s ${1} ${2}
  fi
}

echo 'Cleaning up theme'
rm -rf $THEME_DEST
mkdir $THEME_DEST

echo 'Copying theme files'
FILES=${THEME_SRC}/*
for f in $FILES
do
  if [[ ${DEV} == true ]]; then
    linkFile $f $THEME_DEST
  else
    copyFile $f $THEME_DEST
  fi
done
echo 'Finished copying theme files'
