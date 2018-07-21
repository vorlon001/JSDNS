## Alt-H2 This is DNS server on nodejs.
### Based on https://github.com/gizur/redis-dns.


###### 1. Your IP:
######   +MASTER SERVER Debian 9.5.
######   +IP JSDNS: 172.19.0.2
######   +IP MASTER SERVER: 172.19.0.2
***
###### 2. **docker network create --subnet=172.19.0.0/16 net_172_19 **
###### 3. **docker **network **ls
###### 4. **./build.sh
###### 5. **./run_dns.sh **1 **172.19.0.2 128
***
###### 6. docker exec $(docker ps -a | grep redis_1_172.19.0.2 | awk '{print $1}') redis-cli set redis-dns:dbserver.redis-dns.local 10.0.0.1
###### 7. docker exec $(docker ps -a | grep redis_1_172.19.0.2 | awk '{print $1}') redis-cli set redis-dns:appserver.redis-dns.local 10.0.0.2
###### 8. docker exec $(docker ps -a | grep redis_1_172.19.0.2 | awk '{print $1}') redis-cli set redis-admin:172.19.0.1:token true
###### Add token for change dns record
***
###### 9. TEST Your JSDNS

 ###### - dig @172.19.0.2 -p 5353 dbserver.redis-dns.local A
 ###### - dig @172.19.0.2 -p 5000 dbserverrrr.redis-dns.local A
 ###### - dig @172.19.0.2 -p 5000 dbserver.redis-dns.local A
 ###### - dig @172.19.0.2 -p 5000  mail.ru
 ###### - dig @172.19.0.2 -p 5000 dbserver2.redis-dns.local A

 ###### - curl http://172.19.0.2:3001/api/set/dbserver2.redis-dns.local/12.2.2.2/token
 ###### - curl http://172.19.0.2:3001/api/get/dbserver2.redis-dns.local/token
 ###### - curl http://172.19.0.2:3001/api/
