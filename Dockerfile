FROM node:8

# specify "dev" or "prod"
ARG target=prod

WORKDIR /app

COPY . ./

RUN yarn

RUN echo "Target is set to: $target"
RUN test "$target" = "prod" && yarn build || true

EXPOSE 3000

CMD ["yarn", "start"]