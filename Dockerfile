FROM node:10-alpine as build

# args
ARG version="0.1.0"
ARG repo="github.com/productionwentdown/dri"
ENV VUE_APP_VERSION=${version}
ENV VUE_APP_SOURCE_LINK="https://${repo}"

# dependencies
RUN apk add --no-cache git=2.18.1-r0

# source
WORKDIR /app
COPY . .

# build
RUN yarn install
RUN yarn build


FROM productionwentdown/caddy:0.11.0 as caddy


FROM alpine:3.8

ARG version

# labels
LABEL org.label-schema.vcs-url="https://github.com/productionwentdown/dri"
LABEL org.label-schema.version=${version}
LABEL org.label-schema.schema-version="1.0"

# copy build output
COPY --from=build /app/dist /srv
# copy caddy
COPY --from=caddy /bin/caddy /usr/local/bin/caddy
# copy entrypoint.sh
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
CMD ["caddy", "-conf", "/etc/Caddyfile"]
