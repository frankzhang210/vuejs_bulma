FROM nginx:latest
COPY ./dist/ /usr/share/nginx/html/
COPY ./docker/nginx2.prod.conf /etc/nginx/conf.d/default.conf
COPY ./docker/nginx2.common.conf /etc/nginx/common.conf 

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# sudo docker image build -t weather_forcast_nginx:1.02  -f ./nginx.dockerfile .
# sudo docker run -d --rm -ti -p 8060:8086 --network play-net --ip 172.19.0.86 --name weather_forcast weather_forcast_nginx:1.02
