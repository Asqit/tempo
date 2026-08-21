from fastapi import APIRouter

router = APIRouter(
    prefix="/workspaces/{workspace_id}/members", tags=["workspace-members"]
)


@router.get("/")
async def list_workspace_members():
    pass


@router.post("/")
async def add_workspace_member():
    pass


@router.put("/{member_id}")
async def change_member_role():
    pass


@router.delete("/{member_id}")
async def leave_workspace():
    pass
