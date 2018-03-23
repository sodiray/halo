FROM node:9.5.0

WORKDIR /usr/src/halo

COPY . .

RUN npm install

CMD [ "node", "./index.js" ]
