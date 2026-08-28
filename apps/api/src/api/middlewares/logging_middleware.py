import logging
from time import perf_counter

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = perf_counter()
        client_ip = request.client.host
        method = request.method
        url = request.url.path
        base = f"[{method}] - [{url}] - [{client_ip}]"

        logger.info(base)

        response = await call_next(request)
        status_code = response.status_code

        delta = "{:.2f}".format(perf_counter() - start)
        logger.info(f"{base} - [{status_code}] - [{(delta)}s]")

        return response
