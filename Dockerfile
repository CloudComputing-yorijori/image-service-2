FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY gcp-key.json ./gcp-key.json

EXPOSE 3000
CMD ["npm", "start"]