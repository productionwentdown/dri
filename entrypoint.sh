#!/bin/sh

BASE_URL=${BASE_URL:=/}

REGISTRY_HOST=${REGISTRY_HOST:=""}
REGISTRY_API=${REGISTRY_API:=""}

[[ "$DELETE_ENABLED" != "true" ]] && [[ "$DELETE_ENABLED" != "false" ]] && DELETE_ENABLED=false
REPOSITORIES_PER_PAGE=${REPOSITORIES_PER_PAGE:=0}
TAGS_PER_PAGE=${TAGS_PER_PAGE:=30}

[[ "$USE_PORTUS_EXPLORE" != "true" ]] && [[ "$USE_PORTUS_EXPLORE" != "false" ]] && USE_PORTUS_EXPLORE=false

sed -i "s~<base href=/ >~<base href=\"$BASE_URL\">~" /srv/index.html

cat > /etc/Caddyfile << EOF
:80$BASE_URL {
    root /srv
    rewrite {
        regexp (.*)
        to {1} {1}/ /
    }
}
EOF

cat > /srv/config.json << EOF
{
    "registryHost": "$REGISTRY_HOST",
	"registryAPI": "$REGISTRY_API",
	"deleteEnabled": $DELETE_ENABLED,
	"repositoriesPerPage": $REPOSITORIES_PER_PAGE,
	"tagsPerPage": $TAGS_PER_PAGE,
	"usePortusExplore": $USE_PORTUS_EXPLORE
}
EOF

"$@"
