ROLE_HIERARCHY = {
    WorkspaceRole.MEMBER: 0,
    WorkspaceRole.ADMIN: 1,
    WorkspaceRole.OWNER: 2,
}

def has_permission(user_role: WorkspaceRole, min_role: WorkspaceRole) -> bool:
    return ROLE_HIERARCHY[user_role] >= ROLE_HIERARCHY[min_role]


def require_workspace_role(min_role: WorkspaceRole):
    async def checker(
        workspace_id: int,
        user: User = Depends(current_user),
        db: AsyncSession = Depends(get_db),
    ) -> WorkspaceMembers:
        member = await get_member(db, workspace_id, user.id)
        if not member or not has_permission(member.role, min_role):
            raise HTTPException(403, "Not enough permissions")
        return member
    return checker

async def require_workspace_role(min_role: WorkspaceRole):
    async def checker(workspace_id: int, user: User = Depends(current_user), db=Depends(get_db)):
        member = await get_member(db, workspace_id, user.id)
        if not member or not has_permission(member.role, min_role):
            raise HTTPException(403)
        return member
    return checker
