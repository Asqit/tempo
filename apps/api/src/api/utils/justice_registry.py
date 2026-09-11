from typing import NotRequired, TypedDict, cast

import httpx
from fastapi import Request


class RegistryValue(TypedDict):
    value: str


class RegistryCompany(TypedDict):
    subjektId: int
    nazev: RegistryValue
    ico: NotRequired[RegistryValue]


class RegistrySearchResponse(TypedDict):
    pocetCelkem: int
    data: list[RegistryCompany]


class JusticeRegistryClient:
    def __init__(self, client: httpx.AsyncClient) -> None:
        self._client = client

    async def search(
        self,
        query: str,
        *,
        registries: str = "VR",
    ) -> RegistrySearchResponse:
        response = await self._client.get(
            "/api/rejstriky/navrhy",
            params={
                "hledanyText": query,
                "rejstriky": registries,
            },
        )
        response.raise_for_status()

        return cast(RegistrySearchResponse, response.json())


# dependencies.py


def get_justice_registry_client(
    request: Request,
) -> JusticeRegistryClient:
    return JusticeRegistryClient(request.app.state.http_client)
