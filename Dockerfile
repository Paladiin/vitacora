FROM vect0r/nginx-openssl1.0.2


RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
ADD nginx/conf.d/ /etc/nginx/conf.d/
ADD nginx/nginx.conf /etc/nginx/nginx.conf
ADD dist/ /www/app/dist

CMD ["nginx", "-g", "daemon off;"]
