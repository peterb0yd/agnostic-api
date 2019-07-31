# Pull from node image
FROM node


# Create app directory
WORKDIR /usr/src/api

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# install NPM packages
RUN npm install

# Bundle app source
COPY . .

# Port we are using
EXPOSE 3000

# Dumb-init initialize
ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Start server
CMD [ "dumb-init", "node", "-r", "dotenv/config", "./src/server.js" ]
