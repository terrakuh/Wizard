FROM golang:alpine AS backend

COPY backend /tmp/backend
RUN cd /tmp/backend && go build .


FROM node:alpine AS frontend

COPY frontend /tmp/frontend
RUN cd /tmp/frontend && yarn && yarn build


FROM alpine

EXPOSE 8080/tcp

COPY --from=backend /tmp/backend/wizard /app/
COPY --from=frontend /tmp/frontend/build /app/static

WORKDIR /app
ENTRYPOINT ["./wizard"]
