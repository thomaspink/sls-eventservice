#!/usr/bin/env bash

set -u -e -o pipefail

TMP=`pwd`/.tmp
PUBLIC=`pwd`/public

# SETUP
echo 'Preparing new wordpress instance'
rm -rf $TMP
rm -rf $PUBLIC
mkdir $TMP
mkdir $PUBLIC

# DOWNLOAD
echo 'Downloading latest wordpress'
curl "https://wordpress.org/latest.tar.gz" --output ${TMP}/wp.tar.gz

# UNPACK
echo 'Unpacking wordpress'
tar -xjf ${TMP}/wp.tar.gz -C $TMP

# MOVE to public
mv  -v ${TMP}/wordpress/* $PUBLIC

# CLEANUP
rm -rf $TMP

echo 'Finished installing wordpress'
