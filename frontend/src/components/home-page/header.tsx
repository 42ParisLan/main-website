import { Button } from '../ui/button';
import { Link } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import defaultpng from "@/assets/default.png"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import logo from '@/assets/logo.svg';
import { useAuth, useLogout } from '@/providers/auth.provider';
import { HeaderNotifs } from './header-notif';

export function Header() {
	const {me} = useAuth();
	const logout = useLogout()

	return (
		<header className="sticky top-0 w-full z-[1000] border-b border-border/50 bg-black/95 backdrop-blur-sm">
			<div className="container mx-auto px-4 lg:px-6">
				<nav className="flex items-center justify-between h-20">
					<div className="h-40 flex items-center gap-12">
						<Link to="/" className="shrink-0">
							<img src={logo} alt="Logo" className="h-15 w-auto"/>
						</Link>
						<div className="hidden md:flex items-center gap-2 ">
							<Button asChild size="header" variant="gradient-border">
								<Link to="/tournaments">Tournaments</Link>
							</Button>
							<Button asChild size="header" variant="gradient-border">
								<Link to="/votes">Votes</Link>
							</Button>
							{me.roles.includes("basic_admin") && (
								<Button asChild size="header" variant="gradient-border">
									<Link to="/admin">Admin</Link>
								</Button>
							)}
						</div>
					</div>
					<div className="flex items-center gap-4">
						<HeaderNotifs />
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="p-0 h-auto w-auto rounded-full focus-visible:ring-2 ring-primary/50 hover:ring-primary transition-all" variant="transparent">
									<div className="rounded-full p-[2px] bg-gradient-to-br from-primary to-secondary">  
										<Avatar className="h-10 w-10">
											<AvatarImage src={me.picture ?? defaultpng} alt="Profile" />
											<AvatarFallback className="text-sm font-medium">
												{me.username?.slice(0, 2).toUpperCase() || 'U'}
											</AvatarFallback>
										</Avatar>
									</div>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" side="bottom" sideOffset={12} className="dark bg-card border border-border/50 w-48 mt-2">
								<DropdownMenuItem asChild>
									<Button variant="ghost" className="w-full justify-start" asChild>
										<Link to="/users/me">Profile</Link>
									</Button>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Button variant="destructive" className="w-full justify-start" onClick={logout}>
										Logout
									</Button>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</nav>
			</div>
		</header>
	);
}
