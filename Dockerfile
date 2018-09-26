FROM node:10-alpine as build

# args
ARG version="0.1.0"
ARG repo="github.com/productionwentdown/dri"

# dependencies
RUN apk add --no-cache git

# source
WORKDIR /app
COPY . .

# build
RUN yarn install
RUN yarn build


FROM alpine:3.8

ARG version

# labels
LABEL org.label-schema.vcs-url="https://github.com/productionwentdown/email-collector"
LABEL org.label-schema.version=${version}
LABEL org.label-schema.schema-version="1.0"

# copy build output
COPY --from=build /app/dist /srv
# copy caddy
COPY --from=productionwentdown/caddy:0.11.0 /bin/caddy /usr/local/bin/caddy
# copy entrypoint.sh
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
CMD ["caddy", "-conf", "/etc/Caddyfile"]
