# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /build

# --ignore-scripts: verified safe against this lockfile (esbuild's postinstall
# is not required -- npm resolves its platform binary as an optionalDependency
# regardless). Skips running arbitrary code from any dependency at install time.
COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

# Vite inlines VITE_* variables at build time, so the API URL has to be known
# here rather than at container start. Override per environment:
#   docker build --build-arg VITE_API_BASE_URL=https://api.example.com
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---------- runtime ----------
# nginxinc/nginx-unprivileged, not plain nginx: a container compromise
# shouldn't hand over root, and the stock nginx image can only bind port 80 by
# running as root. This image is purpose-built to run as a non-root user with
# correct permissions already set on the cache/pid directories it needs, which
# hand-rolling on top of the stock image would otherwise require reproducing.
FROM nginxinc/nginx-unprivileged:1.31-alpine AS runtime

COPY --from=build /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
