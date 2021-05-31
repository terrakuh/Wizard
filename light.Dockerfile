FROM python:3.9-alpine

EXPOSE 8000/tcp
WORKDIR /app
VOLUME ["/data"]

COPY backend /app
COPY private /app/static/private
RUN adduser -D -h /app wizard && chmod -R -w /app && chown wizard: -R /data \
        && pip install -r requirements.txt
COPY frontend/build /app/static

USER wizard:wizard
CMD ["python3", "main.py", "--wizard-db", "/data/wizard.db"]
