import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "./ui/input";
import { IconCopy, IconCopyCheck } from "@tabler/icons-react";

type CopyInputProps = {
	className?: string;
	value: string;
};

export default function CopyInput({ className, value }: CopyInputProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 1000);
	};

	return (
		<div className={cn("relative", className)}>
		{copied ? (
			<IconCopyCheck className="h-4 w-4 absolute right-2 top-3 text-green-500" />
		) : (
			<IconCopy
			className="h-4 w-4 absolute right-2 top-3 text-primary cursor-pointer hover:opacity-70"
			onClick={handleCopy}
			/>
		)}
		<Input value={value} readOnly className="w-full pr-8 cursor-text" />
		</div>
	);
}