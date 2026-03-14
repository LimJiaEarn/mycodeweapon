FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# For prod
# COPY . .
# RUN npm run build

EXPOSE 3000

# For dev
CMD ["npm", "run", "dev"]

# For prod
# CMD ["npm", "start"]