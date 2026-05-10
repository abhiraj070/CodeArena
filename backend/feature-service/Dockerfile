#creating a backend container
FROM node:20 
# node:20 is a already formed image in docker our other images will be built on top of this otherwise will will have to collect all the images form scratch
WORKDIR /app
# this creates a folder named app which will be used for containing future files. this is not created on the local system, rather it is created inside the docker filesystem.
COPY package*.json ./
# this copies package.json and package-lock.json to the container
RUN npm install

COPY . .
# copies everything and put it in the current working dir(/app).
EXPOSE 8000
# note this does not actually creates a exposes the pots. this is just to tell that this container will be listening on these ports

CMD ["node", "-r", "dotenv/config", "src/index.js"]
# startup command - run node directly so SIGTERM reaches it cleanly (no npm wrapper)