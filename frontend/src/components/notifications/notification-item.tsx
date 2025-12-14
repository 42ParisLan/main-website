import { Button } from '@/components/ui/button';
import useQueryClient from '@/hooks/use-query-client';
import errorModelToDescription from '@/lib/utils';
import type { components } from '@/lib/api/types';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

type Notification = components['schemas']['Notification'];

type Props = {
	notification: Notification
	compact?: boolean
	onMarkRead?: (notificationId: number) => void
}

export default function NotificationItem({ notification, compact = false, onMarkRead }: Props) {
	const client = useQueryClient();

	const { mutate: mutateMarkRead, isPending: isMarkingRead } = client.useMutation('post', '/notifications/{id}/read', {
		onSuccess() {
			if (onMarkRead) {
				onMarkRead(notification.id);
			}
			toast.success('Notification marked as read');
		},
		onError(error) {
			console.error(`Error while marking notification as read ${error}`)
			const errorMessage = errorModelToDescription(error);
			toast.error(`Error while marking notification as read: ${errorMessage}`)
		},
	});

	const handleMarkRead = () => {
		mutateMarkRead({
			params: {
				path: {
					id: notification.id,
				},
			},
		});
	};

	return (
		<div
			className={
				compact
					? "flex flex-col gap-1 py-2"
					: "flex items-center justify-between gap-4 p-3"
			}
		>
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-2 flex-1">
					<div className={`size-2 rounded-full ${notification.read ? "bg-gray-500" : "bg-primary"} shrink-0`} />
					{notification.href ? (
						<Link
							to={notification.href}
							target={compact ? "_blank" : undefined}
							rel={compact ? "noopener noreferrer" : undefined}
							className={compact ? "text-sm font-semibold text-white/90 underline decoration-primary/60 decoration-2 underline-offset-4" : "text-base font-medium hover:underline"}
						>
							{notification.title}
						</Link>
					) : (
						<span className={compact ? "text-sm font-semibold text-white/90" : "text-base font-medium"}>
							{notification.title}
						</span>
					)}
				</div>
				{!notification.read && (
					<Button
						variant={compact ? "ghost" : "outline"}
						size="sm"
						className={compact ? "h-7 px-2 text-xs" : ""}
						onClick={(e) => {
							if (compact) {
								e.preventDefault();
								e.stopPropagation();
							}
							handleMarkRead();
						}}
						disabled={isMarkingRead}
					>
						{compact ? "Mark read" : (
							<>
								<Check className="size-4" />
								Mark Read
							</>
						)}
					</Button>
				)}
				{notification.read && compact && (
					<Button
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-xs"
						disabled
					>
						Read
					</Button>
				)}
			</div>
			{notification.message && (
				<span className={compact ? "text-xs text-gray-300 leading-snug line-clamp-2" : "text-sm text-muted-foreground"}>
					{notification.message}
				</span>
			)}
			{!compact && (
				<div className="flex items-center justify-between gap-2">
					<p className="text-xs text-muted-foreground">Type: {notification.type}</p>
					<span className="text-xs text-muted-foreground whitespace-nowrap">
						{new Date(notification.created_at).toLocaleDateString()}
					</span>
				</div>
			)}
		</div>
	);
}
