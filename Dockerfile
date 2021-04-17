FROM node:14-alpine

WORKDIR /app

COPY ./build ./build
COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install --prod
RUN ls

EXPOSE 8080
CMD ["yarn", "start"]