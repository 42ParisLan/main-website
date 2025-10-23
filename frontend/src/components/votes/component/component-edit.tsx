import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { components } from "@/lib/api/types";

interface ComponentEditModalProps {
	component: components['schemas']['Component'];
}

export default function ComponentEdit({ component }: ComponentEditModalProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{component.name}
				</CardTitle>
				{component.description}
			</CardHeader>
			<CardContent>
				{component.color}
				{component.image_url}
			</CardContent>
		</Card>
	)
}