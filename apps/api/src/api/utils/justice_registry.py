from typing import Any

import httpx
from fastapi import Request


class JusticeRegistryClient:
    def __init__(self, client: httpx.AsyncClient) -> None:
        self._client = client

    async def search(
        self,
        query: str,
        *,
        registries: str = "VR",
    ) -> dict[str, Any]:
        response = await self._client.get(
            "/api/rejstriky/navrhy",
            params={
                "hledanyText": query,
                "rejstriky": registries,
            },
        )
        response.raise_for_status()

        return response.json()


# dependencies.py


def get_justice_registry_client(
    request: Request,
) -> JusticeRegistryClient:
    return JusticeRegistryClient(request.app.state.http_client)
