FROM node:alpine AS frontend

COPY frontend /tmp/frontend
RUN cd /tmp/frontend && yarn && yarn build


FROM python:3.9-alpine

EXPOSE 8000/tcp
WORKDIR /app
VOLUME [ "/data" ]

COPY --from=frontend /tmp/frontend/build /app/static
ADD wizard-assets.zip /app/static/private

COPY backend /app/
RUN pip install -r requirements.txt

CMD ["python3", "main.py", "--wizard-db", "/data/wizard.db"]
