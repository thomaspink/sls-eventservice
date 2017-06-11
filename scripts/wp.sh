#!/usr/bin/env bash

set -u -e -o pipefail

TMP=`pwd`/.tmp
PUBLIC=`pwd`/public

# SETUP
rm -rf $TMP
rm -rf $PUBLIC
mkdir $TMP
mkdir $PUBLIC

# DOWNLOAD
curl "https://wordpress.org/latest.tar.gz" --output ${TMP}/wp.tar.gz

# UNPACK
tar -xjf ${TMP}/wp.tar.gz -C $TMP

# MOVE to public
mv  -v ${TMP}/wordpress/* $PUBLIC

# CLEANUP
rm -rf $TMP
