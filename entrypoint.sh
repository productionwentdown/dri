#!/bin/sh

BASE_URL=${BASE_URL:=/}
SITE_TITLE=${SITE_TITLE:=dri}

REGISTRY_HOST=${REGISTRY_HOST:=""}
REGISTRY_API=${REGISTRY_API:=""}

[[ "$DELETE_ENABLED" != "true" ]] && [[ "$DELETE_ENABLED" != "false" ]] && DELETE_ENABLED=false
REPOSITORIES_PER_PAGE=${REPOSITORIES_PER_PAGE:=0}
TAGS_PER_PAGE=${TAGS_PER_PAGE:=30}

[[ "$USE_PORTUS_EXPLORE" != "true" ]] && [[ "$USE_PORTUS_EXPLORE" != "false" ]] && USE_PORTUS_EXPLORE=false

mkdir -p /tmp/srv

sed \
        -e "s~<base href=\"/\">~<base href=\"$BASE_URL\">~" \
        -e "s~<title>dri</title>~<title>$SITE_TITLE</title>~" \
        /srv/index.html > /tmp/srv/index.html

cat > /tmp/srv/config.json << EOF
{
        "registryHost": "$REGISTRY_HOST",
        "registryAPI": "$REGISTRY_API",
        "deleteEnabled": $DELETE_ENABLED,
        "repositoriesPerPage": $REPOSITORIES_PER_PAGE,
        "tagsPerPage": $TAGS_PER_PAGE,
        "usePortusExplore": $USE_PORTUS_EXPLORE
}
EOF

exec "$@"