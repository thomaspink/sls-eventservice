#!/usr/bin/env bash

set -u -e -o pipefail

PUBLIC=`pwd`/public

echo 'Creating wp-config.php'
cp -n ${PUBLIC}/wp-config-sample.php ${PUBLIC}/wp-config.php

# sed "s/false/true/g" ${PUBLIC}/wp-config.php
# cd ${PUBLIC}
# perl -p -i -e "s/false/true/g" "wp-config.php" < /dev/null 2> /dev/null

#######################################
# Generates a random string
# Arguments:
#   param1 - [Optional] Length of random string
# Returns:
#   String
#######################################
genRandom() {
  if [[ $# -eq 0 ]]; then
    LENGTH=32
  else
    LENGTH=${1}
  fi
  cat /dev/urandom | env LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w $LENGTH | head -n 1
}
