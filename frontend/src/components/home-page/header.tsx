import { Button } from '../ui/button';
import { Link } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import defaultpng from "@/assets/default.png"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import logo from '@/assets/logo.svg';
import { useAuth, useLogout } from '@/providers/auth.provider';

export function Header() {
	const {me} = useAuth();
	const logout = useLogout()

	return (
		<header className="sticky top-0 w-full z-[1000]">
			<div className="container-wrapper">
				<nav className="flex items-center bg-black h-20 text-gray-300">
					<div className="h-full flex items-center">
						<Link to="/">
							<img src={logo}
									className="h-30">
							</img>
						</Link>
					</div>
					<div className="flex items-center justify-center gap-4 h-full text-lg">
						<Button asChild size="header" variant="transparent" radius="none" className="h-full inline-flex items-center justify-center bg-black rounded-xl h-13">
							<Link to="/tournaments">Tournaments</Link>
						</Button>
						<Button asChild size="header" variant="transparent" radius="none" className="h-full inline-flex items-center justify-center bg-black rounded-xl h-13">
							<Link to="/votes">Votes</Link>
						</Button>
					</div>
					<div className="w-full p-6 flex gap-6 justify-end">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="p-0 h-auto w-auto rounded-full focus-visible:ring-0 focus:ring-0 focus:outline-none" variant="transparent">
									<div className="rounded-full p-[4px] bg-gradient-to-br from-primary to-secondary dark">  
										<Avatar className="h-12 w-12">
										<AvatarImage src={me.picture ?? defaultpng} alt="Profile" />
										<AvatarFallback className="text-2xl">JD</AvatarFallback>
										</Avatar>
									</div>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="dark bg-background z-[1001]">
								<DropdownMenuItem>
									<div className='flex flex-col'>
										<Button variant="link" radius="md" asChild>
											<Link to="/users/me">Profile</Link>
										</Button>
										<Button variant="destructive" radius="md" onClick={logout}>
											Logout
										</Button>
									</div>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</nav>
			</div>
		</header>
	);
}
