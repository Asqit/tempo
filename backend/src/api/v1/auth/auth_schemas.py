from pydantic import BaseModel

from src.api.v1.auth.auth_helpers import Token


class UserCreate(BaseModel):
    model_config = {"from_attributes": True}
    email: str
    country: str
    name: str
    password: str


class UserRead(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    email: str
    country: str
    name: str


class LoginResponse(Token, UserRead):
    pass
