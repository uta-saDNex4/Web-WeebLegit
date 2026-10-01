FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev antiword catdoc \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    fastapi \
    "uvicorn[standard]" \
    sqlalchemy \
    psycopg2-binary \
    python-jose[cryptography] \
    passlib[bcrypt] \
    python-multipart \
    pandas \
    openpyxl \
    bcrypt \
    pypdf \
    python-docx \
    pillow \
    pymupdf

COPY backend ./backend
COPY data ./data

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
