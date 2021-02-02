FROM golang:alpine AS backend

COPY backend /tmp/backend
RUN cd /tmp/backend && go build .


FROM node:alpine AS frontend

COPY frontend /tmp/frontend
RUN cd /tmp/frontend && yarn && yarn build


FROM alpine

COPY --from=backend /tmp/backend/Wizard /app/
COPY --from=frontend /tmp/frontend/build /app/static

WORKDIR /app
CMD ["./Wizard", "-host", "0.0.0.0:8080"]
