FROM --platform=$BUILDPLATFORM node:24-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM build-stage AS test
CMD ["./make.sh", "test"]
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 make.sh /
EXPOSE 80
CMD ["./make.sh", "run"]
