FROM alpine:latest
MAINTAINER Kosh Vorlon <root@iblog.pro>

ENV REDIS_DATA_DIR=/var/lib/redis \
    LOGS_DATA_DIR=/opt/logs

RUN apk --no-cache add tini redis && apk --no-cache add --virtual devs tar curl
RUN apk --no-cache add nodejs npm
RUN /usr/bin/npm install --global yarn
RUN mkdir /opt
RUN mkdir /opt/logs
RUN mkdir /opt/jsdns

COPY jsdns/ /opt/jsdns/
COPY redis.conf /opt/redis.conf
COPY entrypoint.sh /opt/entrypoint.sh
RUN ls -la /opt/jsdns/*
RUN chmod +x /opt/entrypoint.sh

RUN /usr/bin/npm install --global yarn
RUN /usr/bin/npm install -g npm-check-updates
RUN /usr/bin/npm i sprint 

WORKDIR /opt/jsdns
RUN /usr/bin/ncu -u
RUN /usr/bin/npm i -f
RUN /usr/bin/npm i -g npm
RUN yarn install

EXPOSE 5000/udp
EXPOSE 5000/tcp
EXPOSE 3001/tcp

VOLUME ["${REDIS_DATA_DIR}"]
VOLUME ["${LOGS_DATA_DIR}"]

ENTRYPOINT ["/opt/entrypoint.sh"]
CMD ["start"]