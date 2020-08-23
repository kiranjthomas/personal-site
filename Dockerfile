# install all deps
FROM node:12.16.2-alpine as install
WORKDIR /deps
COPY /ui/package*.json ./
RUN npm ci

# copy sources and build
FROM node:12.16.2-alpine AS build
WORKDIR /build
COPY /ui ./
COPY --from=install \
    /deps ./
RUN npm run build

# prune devDependencies
FROM build as release
RUN npm prune --production
