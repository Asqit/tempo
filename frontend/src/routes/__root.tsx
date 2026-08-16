import * as React from "react";
import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackDevtools } from "@tanstack/react-devtools";

import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

// TODO: fill-out SEO details
export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "Tempo ",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <React.Fragment>
      <HeadContent />
      <Outlet />
      <TanStackDevtools
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
          },
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </React.Fragment>
  );
}
