import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { $api } from "@/lib/api";

export function WorkspaceShare() {
  const {} = $api.useMutation(
    "post",
    "/api/v1/workspaces/{workspace_id}/members/",
    {},
  );

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <UserPlus className="size-3.5" />
        Pozvat
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pozvat členy workspace</DialogTitle>
          <DialogDescription>
            Tady bude možné pozvat další členy. Sdílení workspace právě
            připravujeme.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
