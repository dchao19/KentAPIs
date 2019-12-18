FROM node

RUN echo "America/Denver" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

RUN mkdir /app
WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app

EXPOSE 8080

CMD npm run initial-config && npm test && npm start
