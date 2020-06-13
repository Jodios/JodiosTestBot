FROM node:12

ARG discordToken
ENV discordToken="${discordToken}"
#create directory
RUN mkdir -p /usr
WORKDIR /usr/

COPY package.json ./
RUN npm install
COPY . ./
RUN ls src

EXPOSE 8080
CMD ["npm", "start"] 