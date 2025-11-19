import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tournaments/$tournamentid/$teamid/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tournaments/$tournamentid/$teamid/"!</div>
}
