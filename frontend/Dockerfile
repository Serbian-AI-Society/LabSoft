# Use a newer official node image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies including ionic and amplify
RUN npm install -g @ionic/cli
RUN npm install -g @aws-amplify/cli
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which the app will run
EXPOSE 8100

# Command to run the application
CMD ["ionic", "serve", "--host", "0.0.0.0"]
