FROM node:12 as builder
WORKDIR /app
COPY . ./
RUN yarn
ENV REACT_APP_BACKEND_HOST /api
RUN yarn build

FROM nginx:1.19.0-alpine

ENV LISTEN_PORT=8080

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf.tpl /etc/nginx/nginx.conf.tpl

CMD ["/bin/sh", "-c", "envsubst '${LISTEN_PORT} ${BACKEND_URL}' < /etc/nginx/nginx.conf.tpl > /etc/nginx/nginx.conf && exec nginx"]
