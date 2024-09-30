FROM denoland/deno:alpine

RUN apk update && apk add \
      # for shell out
      bash \
      # want GNU grep
      grep \
      # for `env -S`
      coreutils \
      # for `cjpeg`:
      libjpeg-turbo-utils \
      # to convert sources to PPM to feed to cjpeg
      imagemagick

WORKDIR /app
COPY . .

# like jekyll, convert `README.md` to `index.html`
RUN echo 'import showdown from "https://esm.archive.org/showdown"; Deno.writeTextFileSync("index.html", new showdown.Converter({ completeHTMLDocument: true, tables: true, metadata: true }).makeHtml(Deno.readTextFileSync("README.md")))' | deno run -A -

# cache JS files we'll use
RUN deno cache --allow-import ./index.js

# fire up minimal webserver that serves static files & handles arbitrary routes to JS
CMD ./index.js -p5000
