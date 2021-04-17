FROM node:14-alpine

WORKDIR /app

COPY . ./

## INITALLY BUILDING THE PROJECT 
RUN yarn install
RUN yarn build

EXPOSE 8080
CMD ["yarn", "start"]