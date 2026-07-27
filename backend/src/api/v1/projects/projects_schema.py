from typing import Optional

from pydantic import BaseModel

from src.api.v1.auth.auth_schemas import UserRead
from src.api.v1.clients.clients_schemas import ClientRead


class ProjectRead(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    name: str
    client: ClientRead
    user: UserRead


class ProjectWrite(BaseModel):
    name: str
    client_id: int


class ProjectPartial(BaseModel):
    name: Optional[str]
