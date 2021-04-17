FROM node:14-alpine

WORKDIR /app

RUN mkdir build
COPY build ./build
COPY package.json ./
COPY yarn.lock ./

RUN yarn install --prod

EXPOSE 8080
CMD ["yarn", "start"]