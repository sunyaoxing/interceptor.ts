#!/bin/bash
BASEDIR=$(dirname $0)
PACKAGE_DIR=$1
echo $BASEDIR $PACKAGE_DIR

mkdir $PACKAGE_DIR
cp -r $BASEDIR/../dist/* $PACKAGE_DIR/ 
cp $BASEDIR/../package.json $PACKAGE_DIR/
cp $BASEDIR/../README.md $PACKAGE_DIR/
