FROM --platform=$BUILDPLATFORM node:lts-bookworm-slim as builder-base

WORKDIR /frontend
COPY package*.json .
#RUN rm -rf package-lock.json
RUN npm ci

COPY . .

COPY ./set_proxy.sh .
RUN chmod +x set_proxy.sh && \
    cat set_proxy.sh | tr -d '\r' > set_proxy_unix.sh && \
    chmod +x set_proxy_unix.sh && \
    ./set_proxy_unix.sh

# Increase Node memory limit to 4096 MB
ENV NODE_OPTIONS=--max_old_space_size=4096

RUN npm run build


FROM nginxinc/nginx-unprivileged:stable-bookworm-perl as runtime

ENV BACKEND_URL=https://imgenie-rag-backend-v3-412195401920.asia-east1.run.app

COPY --from=builder-base --chown=nginx /frontend/build /usr/share/nginx/html
COPY --chown=nginx ./docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx ./docker/frontend/start-nginx.sh /start-nginx.sh
RUN chmod +x /start-nginx.sh
ENTRYPOINT ["/start-nginx.sh"]