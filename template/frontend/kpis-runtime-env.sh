#!/bin/sh
set -eu
# Public configuration only. Character-wise JSON escaping also protects config.js.
mkdir -p "${DIST_FOLDER:-/usr/share/nginx/html}"
awk '
function json(value, i, character, result) {
    result = "\""
    for (i = 1; i <= length(value); i++) {
        character = substr(value, i, 1)
        if (character == "\"" || character == "\\") result = result "\\" character
        else if (character == "\n") result = result "\\n"
        else if (character == "\r") result = result "\\r"
        else if (character == "\t") result = result "\\t"
        else result = result character
    }
    return result "\""
}
BEGIN {
    print "window.KPIS_SCRIPT_URL = " json(ENVIRON["KPIS_SCRIPT_URL"]) ";"
    print "window.KPIS_WEBSITE_ID = " json(ENVIRON["KPIS_WEBSITE_ID"]) ";"
}' > "${DIST_FOLDER:-/usr/share/nginx/html}/config.js"
