export type ProjectsTableProps = {
  clientId?: number | null;
  hideHeader?: boolean;
  title?: string;
  description?: string;
  compact?: boolean;
};

export type ProjectItem = {
  id: number;
  name: string;
  client?: {
    id?: number | null;
    name?: string | null;
    user?: {
      name?: string | null;
    } | null;
  } | null;
};

export type ProjectsResponse = {
  items?: ProjectItem[];
  pages?: number | null;
};
