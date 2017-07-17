FROM node:7.10.1-alpine
COPY package.json /app/
COPY ./src /app/src
WORKDIR /app
RUN npm install

ENTRYPOINT ["npm", "run"]