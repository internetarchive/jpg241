FROM denoland/deno:alpine

RUN apk update && apk add \
      # for `env -S`
      coreutils \
      # for cjpeg:
      libjpeg-turbo-utils \
      # to convert sources to PPM to feed to cjpeg
      imagemagick

WORKDIR /app
COPY . .

CMD ./index.js -p5000
