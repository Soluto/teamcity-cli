FROM node:7.10.1-alpine
COPY . /src
WORKDIR /src
RUN npm install
ENTRYPOINT ["npm", "run"]
