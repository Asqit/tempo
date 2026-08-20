import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/settings/workspace')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/settings/workspace"!</div>
}
