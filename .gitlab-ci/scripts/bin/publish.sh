#!/usr/bin/env bash

# shellcheck disable=SC1091

set -eu

CI_SCRIPTS_DIR=$(dirname "$0")/..

# shellcheck source=.gitlab-ci/scripts/lib/version-check.sh
source "$CI_SCRIPTS_DIR"/lib/version-check.sh

function send_to_firefox() {
  echo "not supported yet"
  exit 1
}

function send_to_edge() {
  echo "not supported yet"
  exit 1
}

function send_to_chrome() {
  local token
  token=$(curl "https://www.googleapis.com/oauth2/v4/token" -H 'Content-Type: application/json' -d "$PAYLOAD_WS" | grep access_token | awk '{print $2}' | awk -F'"' '$0=$2')
  local id="$1"
  curl \
    -H "Authorization: Bearer $token"  \
    -H "x-goog-api-version: 2" \
    -H "Content-Length: 0" \
    -X POST \
    https://www.googleapis.com/chromewebstore/v1.1/items/"$id"/publish
}

if is_release_candidate "$CI_COMMIT_TAG"; then
  case $1 in
    chrome)
      send_to_chrome "$PASSBOLT_TESTING_CHROME_ID"
    ;;
    firefox)
      echo "We don't send RC for firefox to review"
    ;;

    edge)
      echo "We don't send RC for edge to review"
    ;;
    *) echo "I don't recognize this option"
    ;;
  esac
else
  case "$1" in
    chrome)
      send_to_chrome "$PASSBOLT_STABLE_CHROME_ID"
    ;;
    firefox)
      send_to_firefox
    ;;
    edge)
      send_to_edge
    ;;
    *) echo "I don't recognize this option"
    ;;
  esac
fi