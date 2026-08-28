from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str


class UserCreate(BaseModel):
    email: str = Field(min_length=3)
    country: str = Field(max_length=2, min_length=2, default="CZ")
    name: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=9, max_length=64)


class UserUpdate(BaseModel):
    email: str | None = Field(min_length=3, default=None)
    country: str | None = Field(max_length=2, min_length=2, default=None)
    name: str | None = Field(min_length=3, max_length=64, default=None)


# ------------ READ OPERATIONs


class DBUserBase(BaseModel):
    model_config = {"from_attributes": True}


class UserSummary(DBUserBase):
    email: str
    country: str
    name: str


class UserRead(UserSummary):
    id: int


class LoginResponse(BaseModel):
    user: UserRead
    token: Token
