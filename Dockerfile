FROM node:22-alpine AS build

# args
ARG version="0.2.0"
ARG repo="github.com/productionwentdown/dri"
ENV VITE_APP_VERSION=${version}
ENV VITE_APP_SOURCE_LINK="https://${repo}"

# dependencies
RUN apk add --no-cache git

WORKDIR /app
COPY package-lock.json package.json .
RUN npm clean-install
COPY . .
RUN npm run build


FROM caddy:2-alpine

ARG version

# labels
LABEL org.label-schema.vcs-url="https://github.com/productionwentdown/dri"
LABEL org.label-schema.version=${version}
LABEL org.label-schema.schema-version="1.0"

# copy build output
COPY --from=build /app/dist /srv
# copy entrypoint.sh
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
CMD ["caddy", "run", "--config", "/etc/Caddyfile"]
