#!/bin/sh

RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

function fail {
    echo "🚑️ fatal error: $1"
    exit 1
}

function wrap_function {
    cmd="$1"
    error_message="$2"
    eval $cmd &> .cmd_output
    if [ $? -ne 0 ]; then
        echo 🚨
        echo -e $RED$BOLD"command: $cmd"$RESET
        echo -ne $RED
        echo -e "$error_message\n"
        cat .cmd_output
        rm .cmd_output
        echo -ne $RESET
        exit 1
    fi
    rm .cmd_output
}

function env_or_default {
    key="$1"
    default="$2"
    value=$(printenv $key)
    if [ -z "$value" ]; then
        echo $default
    else
        echo $value
    fi
}

# get .env variables

source ./.env

PG_USER=$(env_or_default "PG_USER" "pedago-dashboard")
PG_PASSWORD=$(env_or_default "PG_PASSWORD" "pedago-dashboard")
PG_HOST=$(env_or_default "PG_HOST" "127.0.0.1")
PG_PORT=$(env_or_default "PG_PORT" "5432")
PG_DATABASE=$(env_or_default "PG_DATABASE" "pedago-dashboard")
POSTGRES_URL="postgres://$PG_USER:$PG_PASSWORD@$PG_HOST:$PG_PORT/$PG_DATABASE?sslmode=disable"

atlas schema inspect --url $POSTGRES_URL -w