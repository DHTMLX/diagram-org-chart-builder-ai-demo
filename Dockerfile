FROM node:16-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production && npm cache clean --force

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
