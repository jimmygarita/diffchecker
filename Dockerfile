# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Copy the rest of your application code to the container
COPY . .

# Expose the port that your application will run on
EXPOSE 4567

# Start the application with nodemon
CMD ["nodemon", "app.js"]
