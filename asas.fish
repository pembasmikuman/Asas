#!/usr/bin/env fish
# Start Asas (dev server) + expose it via Cloudflare Tunnel.
# Dev server (not `next start`) is required: it serves runtime image uploads
# from public/uploads. A production build only serves files present at build time.
# Ctrl-C (or closing the window) stops both. Run: ./asas.fish

set -l dir (path resolve (dirname (status --current-filename)))
cd $dir

set -x PORT 3009           # fixed port (3000-3002 taken by other apps)
set -l TUNNEL asas         # cloudflared tunnel name (see DEPLOY runbook)

echo "Starting app on http://localhost:$PORT ..."
bun run dev &
set -l app_pid $last_pid

echo "Starting Cloudflare Tunnel '$TUNNEL' ..."
cloudflared tunnel run $TUNNEL &
set -l cf_pid $last_pid

# Kill both (and their children) on Ctrl-C / close.
function _asas_cleanup --on-signal INT --on-signal TERM \
        --inherit-variable app_pid --inherit-variable cf_pid
    echo \n"Stopping Asas..."
    kill $app_pid $cf_pid 2>/dev/null
    pkill -P $app_pid 2>/dev/null   # next dev's child node process
    exit 0
end

echo "Asas is live. Ctrl-C to stop."
wait
