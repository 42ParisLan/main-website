
import { cn } from '@/lib/utils';
import type { DetailedHTMLProps, ImgHTMLAttributes } from 'react';
import logo from '@/assets/logo.svg';
import { Link } from '@tanstack/react-router';

export type AppLogoProps = DetailedHTMLProps<
	ImgHTMLAttributes<HTMLImageElement>,
	HTMLImageElement
>;

export default function AppLogo(props: AppLogoProps) {
	return (
		<Link to="/">
			<img
				src={logo}
				alt="Logo"
				className={cn('cursor-pointer', props.className)}
				width={100}
				height={100}
				{...props}
			/>
		</Link>
	);
}
