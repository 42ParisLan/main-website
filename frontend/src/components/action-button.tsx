import { type ComponentProps, useCallback, useState } from "react";
import { Button } from "./ui/button";
import { IconCheck, IconLoader, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type ActionButtonProps = ComponentProps<typeof Button> & {
  icon: React.ReactNode;
  action: () => Promise<unknown> | unknown;
};

export default function ActionButton({
	icon,
	className,
	children,
	action,
	...props
}: ActionButtonProps) {
	const [iconToRender, setIconToRender] = useState(icon);

	const onClick = useCallback(async () => {
		setIconToRender(<IconLoader className="w-5 h-5 animate-spin" />);
		try {
		await action();
		setIconToRender(<IconCheck className="w-5 h-5" />);
		} catch {
		setIconToRender(<IconX className="w-8 h-8 text-red-500" />);
		}
		setTimeout(() => setIconToRender(icon), 1000);
	}, [action, icon]);

	return (
		<Button
		{...props}
		className={cn("flex items-center gap-2", className)}
		onClick={onClick}
		>
		{iconToRender}
		{children}
		</Button>
	);
}
