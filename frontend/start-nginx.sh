#!/bin/sh

# Replace the placeholder with the actual value
sed -i "s|__BACKEND_URL__|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf

for file in $(grep -rl '__BACKEND_URL__' /usr/share/nginx/html); do
  sed -i "s|__BACKEND_URL__|${BACKEND_URL}|g" "$file"
done

# Start nginx
exec nginx -g 'daemon off;'
