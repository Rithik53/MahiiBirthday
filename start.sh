      #!/usr/bin/env bash
# Starts a local static server for the birthday app.
#  - finds a free port (starting at 8080)
#  - binds to 0.0.0.0 so your phone can reach it over Wi-Fi
#  - prints both the localhost URL and the mobile (LAN) URL
set -euo pipefail

# run from the folder this script lives in
cd "$(dirname "$0")"

START_PORT="${1:-8080}"

# --- find the first free TCP port from START_PORT upward -------------------
port_in_use() { lsof -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

PORT="$START_PORT"
while port_in_use "$PORT"; do
  PORT=$((PORT + 1))
  if [ "$PORT" -gt $((START_PORT + 50)) ]; then
    echo "No free port found between $START_PORT and $PORT." >&2
    exit 1
  fi
done

# --- find this machine's LAN IP (for the phone URL) ------------------------
LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
[ -z "$LAN_IP" ] && LAN_IP="$(ipconfig getifaddr en1 2>/dev/null || true)"
[ -z "$LAN_IP" ] && LAN_IP="$(ipconfig getifaddr en2 2>/dev/null || true)"

# --- print the banner ------------------------------------------------------
echo ""
echo "  🌙  Under the Same Sky — local server"
echo "  ------------------------------------"
echo "  On this computer : http://localhost:${PORT}"
if [ -n "$LAN_IP" ]; then
  echo "  On your phone    : http://${LAN_IP}:${PORT}"
  echo "  (phone must be on the same Wi-Fi as this Mac)"
else
  echo "  On your phone    : could not detect LAN IP — check Wi-Fi is connected"
fi
echo "  ------------------------------------"
echo "  Press Ctrl+C to stop."
echo ""

# --- start the server ------------------------------------------------------
exec python3 -m http.server "$PORT" --bind 0.0.0.0
