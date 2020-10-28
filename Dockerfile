FROM node:12 as builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --production --non-interactive
ENV REACT_APP_BACKEND_HOST /api
COPY . ./
RUN yarn build

FROM nginx:1.19.0-alpine

ENV LISTEN_PORT=8080

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf.tpl /etc/nginx/nginx.conf.tpl

CMD ["/bin/sh", "-c", "envsubst '${LISTEN_PORT} ${BACKEND_URL}' < /etc/nginx/nginx.conf.tpl > /etc/nginx/nginx.conf && exec nginx"]
