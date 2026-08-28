FROM python:3.14-slim

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN pip install uv \
    && uv sync --frozen --no-dev

COPY src ./src
COPY alembic.ini .
COPY alembic ./alembic

CMD ["uv", "run", "python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
