#!/bin/sh
curr_date=`/bin/date '+%Y%m%d'`
docker build  -t iblog.pro/jsdns-${curr_date}  .