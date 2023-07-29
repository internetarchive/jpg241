FROM denoland/deno:alpine

RUN apk update && apk add \
      # for cjpeg:
      libjpeg-turbo-utils

WORKDIR /app
COPY . .
