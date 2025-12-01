import useQueryClient from '@/hooks/use-query-client';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Header } from '@/components/home-page/header'
import { Footer } from '@/components/home-page/footer'

export const Route = createFileRoute('/tournaments/$tournamentid/')({
  component: RouteComponent,
})

function RouteComponent() {
	const {tournamentid} = Route.useParams();
	const router = useRouter();

	const client = useQueryClient();

	const {data, isLoading, isError} = client.useQuery("get", "/tournaments/{id_or_slug}", {
		params:{
			path: {
				id_or_slug: tournamentid
			}
		}
	})

	const modules = import.meta.glob('../../../components/tournaments/custom-pages/*.tsx', { eager: true }) as Record<string, any>

	const { componentMap, files } = useMemo(() => {
		const map: Record<string, React.ComponentType<any>> = {}
		const list: string[] = []
		for (const p of Object.keys(modules)) {
			const name = p.split('/').pop()?.replace(/\.tsx?$/, '') || p
			list.push(name)
			const mod = modules[p]
			map[name] = mod?.default ?? (() => null)
		}
		return { componentMap: map, files: list }
	}, [modules])

	if (isLoading) {
		return <div className="text-sm text-muted-foreground">Loading tournament…</div>
	}

	if (isError) {
		router.navigate({to: '/tournaments'})
		return
	}

	const chosen = data?.custom_page_component || "default"
	const Component = componentMap[chosen] ?? componentMap['default'] ?? (() => <p>Missing component</p>)

	if (files.length === 0 )
	{
		return (
			<p className="text-sm text-muted-foreground">No custom pages found.</p>
		)
	} else {
		return (
			<div className="min-h-screen dark bg-background">
				<Header/>
				<div>
					{data && (
						<Component tournament={data} />
					)}
				</div>
				<Footer/>
			</div>
		)
	}
}
