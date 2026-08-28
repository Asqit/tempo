import { TableCell, TableRow } from "@/components/ui/table";

type StateRowProps = {
  colSpan: number;
  message: string;
  tone?: "default" | "danger";
};

export function StateRow({
  colSpan,
  message,
  tone = "default",
}: StateRowProps) {
  const toneClassName =
    tone === "danger" ? "text-destructive" : "text-muted-foreground";

  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className={`py-6 text-center ${toneClassName}`}
      >
        {message}
      </TableCell>
    </TableRow>
  );
}
