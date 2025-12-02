import { IconChalkboardTeacher } from '@tabler/icons-react'
import { Button } from '../ui/button';
import { Link } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingPage from '@/components/loading-page';
import useQueryClient from '@/hooks/use-query-client';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import logo from '@/assets/logo.svg';

export function Header() {

    const client = useQueryClient();
    let picture = 'https://static.posters.cz/image/750/star-wars-see-no-stormtrooper-i101257.jpg';
    
      const {data: user, isLoading} = client.useQuery("get", "/me")
    
      if (isLoading) {
        return (
          <LoadingPage/>
        )
      }
      if (user) {
        picture = user.picture;
      }
    return (
        <header className="bg-background sticky top-0 w-full ">
            <div className="container-wrapper">
                <nav className="flex items-center bg-black h-20 text-gray-300">
                    <div className="h-full flex items-center">
                        <button className="cursor-pointer" type="button" onClick={() => (window.location.href = "/")}>
                            <img src={logo}
                                    className="h-30">
                            </img>
                        </button>
                    </div>
                    <div className="flex items-center justify-center gap-4 h-full text-lg">
                        <div className="rounded-xl p-1 bg-transparent hover:bg-gradient-to-r hover:from-primary hover:to-secondary dark transition-all duration-300">
                            <Button asChild size="header" variant="transparent" radius="none" className="h-full inline-flex items-center justify-center bg-black rounded-xl h-13">
                                <Link to="/tournaments">Tournaments</Link>
                            </Button>
                        </div>
                        <div className="rounded-xl p-1 bg-transparent hover:bg-gradient-to-r hover:from-primary hover:to-secondary dark transition-all duration-300">
                            <Button asChild size="header" variant="transparent" radius="none" className="h-full inline-flex items-center justify-center bg-black rounded-xl h-13">
                                <Link to="/votes">Votes</Link>
                            </Button>
                        </div>
                        <div className="rounded-xl p-1 bg-transparent hover:bg-gradient-to-r hover:from-primary hover:to-secondary dark transition-all duration-300">
                            <Button asChild size="header" variant="transparent" radius="none" className="h-full inline-flex items-center justify-center bg-black rounded-xl h-13">
                                <Link to="/admin">Admin</Link>
                            </Button>
                        </div>                        
                    </div>
                    <div className="w-full p-6 flex gap-6 justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="p-0 h-auto w-auto rounded-full focus-visible:ring-0 focus:ring-0 focus:outline-none" variant="transparent">
                                    <div className="rounded-full p-[4px] bg-gradient-to-br from-primary to-secondary dark">  
                                        <Avatar className="h-12 w-12">
                                        <AvatarImage src={picture} alt="Profile" />
                                        <AvatarFallback className="text-2xl">JD</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark bg-background">
                                <DropdownMenuItem asChild>
                                    <Link to="/users/me">Profile</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
					</div>
                </nav>
            </div>
        </header>
    );
}

{/* <Button asChild size="lg" variant="default" className="min-w-[220px]">
    <Link to="/admin">
        <IconChalkboardTeacher className="mr-2 w-5 h-5" />
        Access Admin Console
    </Link>
</Button> */}