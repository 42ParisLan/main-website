
import { cn } from "@/lib/utils";
import type { DetailedHTMLProps, ImgHTMLAttributes } from "react";

export type AppLogoProps = DetailedHTMLProps<
  ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

export default function AppLogo(props: AppLogoProps) {
	return (
		<img
			src="/42paris.svg"
			alt="Logo"
			className={cn("cursor-pointer dark:filter dark:invert", props.className)}
			width={100}
			height={100}
			onClick={() => (window.location.href = "/dash")}
			{...props}
		/>
	);
}
