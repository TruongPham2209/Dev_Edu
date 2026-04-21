#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/workspace}"
cd "$APP_DIR"

hash_sources() {
  find src/main/java src/main/resources -type f \
    \( -name '*.java' -o -name '*.xml' -o -name '*.properties' -o -name '*.yml' -o -name '*.yaml' \) \
    | sort \
    | xargs sha256sum \
    | sha256sum \
    | awk '{print $1}'
}

echo "Compiling project..."
mvn -q -DskipTests compile

echo "Starting Spring Boot with DevTools..."
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.devtools.restart.enabled=true" &
APP_PID=$!

cleanup() {
  if kill -0 "$APP_PID" 2>/dev/null; then
    kill "$APP_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup INT TERM EXIT

LAST_HASH="$(hash_sources)"

while kill -0 "$APP_PID" 2>/dev/null; do
  CURRENT_HASH="$(hash_sources)"
  if [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
    LAST_HASH="$CURRENT_HASH"
    echo "Source change detected; recompiling..."
    if mvn -q -DskipTests compile; then
      echo "Recompile finished; DevTools will restart automatically."
    else
      echo "Recompile failed; keeping the previous app state."
    fi
  fi

  sleep 1
done

wait "$APP_PID"