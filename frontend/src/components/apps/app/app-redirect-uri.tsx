import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useCallback, useState } from "react";

type AppRedirectURIProps = {
	values: string[];
	onValuesChange: (value: string[]) => void;
};

export default function AppRedirectURI({
	values,
	onValuesChange,
}: AppRedirectURIProps) {
	const [inputValue, setInputValue] = useState("");

	const addValue = useCallback(() => {
		if (!inputValue) return;
		onValuesChange([...values, inputValue]);
		setInputValue("");
	}, [inputValue, onValuesChange, values]);

	const removeValue = useCallback(
		(index: number) => {
		onValuesChange(values.filter((_, i) => i !== index));
		},
		[onValuesChange, values]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			addValue();
		}
		},
		[addValue]
	);

	const onValueChange = useCallback(
		(value: string, index: number) => {
		const newValues = [...values];
		newValues[index] = value;
		onValuesChange(newValues);
		},
		[onValuesChange, values]
	);

	return (
		<div>
		<div className="flex items-center justify-between gap-1">
			<Input
			placeholder="https://42.fr/callback"
			className="w-full"
			value={inputValue}
			onChange={(e) => setInputValue(e.target.value)}
			onKeyDown={handleKeyDown}
			/>
			<Button
			className="w-10"
			onClick={(e) => {
				e.preventDefault();
				addValue();
			}}
			>
			<Plus size={16} />
			</Button>
		</div>
		<div className="flex flex-col gap-1 mt-2">
			{values.map((value, index) => (
			<div key={index} className="flex items-center gap-1">
				<Input
				value={value}
				className="w-full"
				onChange={(e) => onValueChange(e.target.value, index)}
				/>
				<Button
				variant="destructive"
				className="w-10"
				onClick={(e) => {
					e.preventDefault();
					removeValue(index);
				}}
				>
				<Minus size={16} />
				</Button>
			</div>
			))}
		</div>
		</div>
	);
}
