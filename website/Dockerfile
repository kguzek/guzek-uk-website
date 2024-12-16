# Build stage
FROM node:18-alpine AS build
ENV YARN_VERSION=3.2.3
RUN corepack enable && yarn policies set-version $YARN_VERSION
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Production Stage
FROM nginx:stable-alpine as production
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
