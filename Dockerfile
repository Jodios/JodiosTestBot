FROM node:14-alpine

WORKDIR /app

COPY . ./

RUN yarn install
RUN yarn build
RUN ls

EXPOSE 8080
CMD ["yarn", "start"]