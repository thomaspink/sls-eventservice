#!/usr/bin/env bash

set -u -e -o pipefail

PUBLIC=`pwd`/public
PLUGINS_DIR=${PUBLIC}/wp-content/plugins

echo 'Cleaning up plugins'
rm -rf $PLUGINS_DIR
mkdir $PLUGINS_DIR
