FROM node:9.5.0

WORKDIR /usr/src/halo

COPY . .

RUN npm install

HEALTHCHECK CMD curl --fail http://localhost:8055 || exit 1

CMD [ "node", "./api.js" ]
