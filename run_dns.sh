#!/bin/bash
# ./run.sh 1 172.19.1.101 512 

function quit {
    echo "run: ./{script name} 1 172.19.1.101 512"
    exit
}

if [ -z $1 ]; then
    echo "number server not yet set"
    quit
fi
if [ -z $2 ]; then
    echo "ipv4-address server not yet set"
    quit
fi
if [ -z $3 ]; then
    echo "max memory MB server not yet set"
    quit
fi

echo 'Server N:'$1
echo 'Server IPv4:'$2
echo 'Server max memory:'$3
echo 'Server user:'$4
echo 'Server password:'$5
echo 'Server path:/docker/host/redis_'$1'_'$2
echo 'Server nameredis_'$1'_'$2

mkdir /docker/host/jsdns_$1_$2
mkdir /docker/host/jsdns_$1_$2/log
mkdir /docker/host/jsdns_$1_$2/data

cp -r jsdns /docker/host/jsdns_$1_$2/

docker run --name jsdns_$1_$2 \
-v /docker/host/jsdns_$1_$2/data:/var/lib/redis \
-v /docker/host/jsdns_$1_$2/log:/opt/logs  \
--net net_172_19 --ip $2 \
-m $3M \
--memory-swappiness 0 \
--restart=always -d $(docker images | grep iblog.pro/jsdns | awk '{print $1}')

