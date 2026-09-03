import type { components } from "@tempo/api-types";
import { ReportTable } from "./components/report-table";
import { ReportStats } from "./components/report-stats";

interface Props {
  data: Array<components["schemas"]["TimeEntryRead"]>;
}

export function ReportDetail({ data }: Props) {
  return (
    <>
      <ReportStats entries={data} />
      <ReportTable entries={data} />
    </>
  );
}
