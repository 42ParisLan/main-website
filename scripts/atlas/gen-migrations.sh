#!/bin/sh

RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

function fail {
    echo "🚑️ fatal error: $1"
    exit 1
}

# input migration name
read -p "Enter migration name (ex: migration_name): " migration_name
if [ -z "$migration_name" ]; then
    fail "migration name cannot be empty"
fi

# we normalize the migration name to lowercase and replace spaces with underscores
migration_name=$(echo $migration_name | tr '[:upper:]' '[:lower:]' | tr ' ' '_')


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

MIGRATIONS_DIR="ent/migrate/migrations"
DEV_URL="docker://postgres/13/postgres?search_path=public"
ENT_SCHEMA="ent/schema"

# check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    fail "migrations directory not found at $MIGRATIONS_DIR"
fi

echo -n "🔍 checking if required tools are installed... "
wrap_function "command -v atlas" "atlas CLI is required to run this script"
wrap_function "command -v docker" "docker is required to run this script"
wrap_function "command -v go" "go v1.22 or higher is required to run this script"
echo "✅"

echo -n "🏗️  generating go ent code... "
wrap_function "go generate ./ent" "failed to generate ent code"
echo "✅"

echo -n "🔨 resolving potential hash rebase issues... "
wrap_function "atlas migrate hash --dir file://$MIGRATIONS_DIR" "failed to resolve hash rebase issues"
echo "✅"

echo -n "🗃️  generating migrations... "
wrap_function "atlas migrate diff $migration_name --dir file://$MIGRATIONS_DIR --dev-url $DEV_URL --to ent://$ENT_SCHEMA" "failed to generate migrations"
echo "✅"

echo "🎉 migration generated successfully, linting report:"
atlas migrate lint --dir file://$MIGRATIONS_DIR --dev-url $DEV_URL --latest 1

echo "When you are ready to apply the migration, run the following command:"
echo "make dev.migrate"
