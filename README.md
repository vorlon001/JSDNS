## This is DNS server on nodejs.
### Based on https://github.com/gizur/redis-dns.


1. **Your IP:**

  - MASTER SERVER Debian 9.5.
  
  - Docker version 18.03.1-ce, build 9ee9f40

  - IP JSDNS: 172.19.0.2
   
  - IP MASTER SERVER: 172.19.0.2
  
*** 

2. **BUILD**

 - **docker network create --subnet=172.19.0.0/16 net_172_19**
 - **docker network ls**
 - **mkdir -p /docker/images/**
 - **mkdir -p /docker/host/**
 - **cd /docker/images/**
 - **git clone https://github.com/vorlon001/JSDNS**
 - **./build.sh**
 - **./run_dns.sh 1 172.19.0.2 128**
*** 

3. **Configure**
 - docker exec $(docker ps -a | grep redis_1_172.19.0.2 | awk '{print $1}') redis-cli set redis-dns:dbserver.redis-dns.local 10.0.0.1
 - docker exec $(docker ps -a | grep redis_1_172.19.0.2 | awk '{print $1}') redis-cli set redis-dns:appserver.redis-dns.local 10.0.0.2
 - docker exec $(docker ps -a | grep redis_1_172.19.0.2 | awk '{print $1}') redis-cli set redis-admin:172.19.0.1:token true

Add token for change dns record
***
 4. **TEST Your JSDNS**

  - dig @172.19.0.2 -p 5353 dbserver.redis-dns.local A
  - dig @172.19.0.2 -p 5000 dbserverrrr.redis-dns.local A
  - dig @172.19.0.2 -p 5000 dbserver.redis-dns.local A
  - dig @172.19.0.2 -p 5000 xxx.yy
  - dig @172.19.0.2 -p 5000 dbserver2.redis-dns.local A

  - curl http://172.19.0.2:3001/api/set/dbserver2.redis-dns.local/12.2.2.2/token
  - curl http://172.19.0.2:3001/api/get/dbserver2.redis-dns.local/token
  - curl http://172.19.0.2:3001/api/
