# Specify the Node.js version to use
FROM node:latest

# Set the working directory for the app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code to the container
COPY . .

# Build the TypeScript code
RUN npm run tsc

# Set the command to run when the container starts
CMD ["node", "index.js"]
