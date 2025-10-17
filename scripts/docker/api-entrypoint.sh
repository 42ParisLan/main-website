#!/bin/sh

export POSTGRES_URL="postgres://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=disable"

if [ -z "$MIGRATIONS_DIR" ]; then
    echo "MIGRATIONS_DIR is not set"
    exit 1
fi

while true; do
    atlas migrate status \
    --dir file://$MIGRATIONS_DIR \
    --url $POSTGRES_URL > .migration_status
    if [ $? -ne 0 ]; then
        echo "waiting for database to be ready..."
        sleep 1
        continue
    fi
    break
done

echo "database is ready"

atlas migrate apply \
    --dir file://$MIGRATIONS_DIR \
    --url $POSTGRES_URL
if [ $? -ne 0 ]; then
    echo -e $RED$BOLD"failed to apply migrations"$RESET
    exit 1
fi
echo "now executing command: \"$@\""
exec "$@"
