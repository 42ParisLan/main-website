import { IconBrandDiscordFilled, IconBrandX, IconBrandYoutubeFilled } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router';
import logo from '@/assets/logo.svg';

export function Footer() {
	return(
		<footer className="w-full bg-black py-8">
			<div className="container mx-auto px-4">
				<div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
					<Link to="/">
						<img src={logo} alt="42LAN Logo" className="h-8" />
					</Link>
					<div className="flex gap-4">
						<a href="#" aria-label="Discord" className="text-gray-400 hover:text-white"><IconBrandDiscordFilled/></a>
						<a href="#" aria-label="X" className="text-gray-400 hover:text-white"><IconBrandX/></a>
						<a href="#" aria-label="Youtube" className="text-gray-400 hover:text-white"><IconBrandYoutubeFilled/></a>
					</div>
					<div className="flex flex-col md:flex-row gap-4 text-xs">
						<Link to="/terms-of-service" className="text-gray-400 hover:text-white">Terms of Service</Link>
						<Link to="/gdpr" className="text-gray-400 hover:text-white">Privacy Policy (GDPR)</Link>
					</div>
				</div>
				<div className="mt-8 border-t border-gray-800 pt-4 text-center text-xs text-gray-400">
					<span>© 2025 42LAN. All rights reserved.</span>
				</div>
			</div>
		</footer>
	);
}