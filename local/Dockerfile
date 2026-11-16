FROM node:24-bookworm-slim
WORKDIR /app
COPY . .
ENV PORT=8099 MOC_DATA_DIR=/data NODE_ENV=production
VOLUME ["/data"]
EXPOSE 8099
CMD ["node","bootstrap.mjs"]
