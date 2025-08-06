FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "npx mesh start --config-name ${MESH_CONFIG_NAME:-.meshrc.yaml}"]