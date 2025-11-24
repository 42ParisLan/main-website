import { IconChalkboardTeacher } from '@tabler/icons-react'
import { Button } from '../ui/button';
import { Link } from '@tanstack/react-router';

export function Header() {
    return (
        <header className="bg-background sticky top-0 w-full">
            <div className="container-wrapper">
                <nav className="flex items-center bg-black h-20 text-gray-300">
                    <div className="h-full flex items-center">
                        <button className="cursor-pointer" type="button" onClick={() => (window.location.href = "/")}>
                            <IconChalkboardTeacher className="w-24 h-full" />
                        </button>
                    </div>
                    <div className="flex items-center justify-center gap-4 h-full text-lg">
                        <Button asChild size="header" variant="transparent" hover="gradient" radius="none" className="h-full inline-flex items-center justify-center">
                            <Link to="/tournaments">Tournaments</Link>
                        </Button>
                         <Button asChild size="header" variant="transparent" hover="gradient" radius="none" className="h-full inline-flex items-center justify-center">
                            <Link to="/votes">Votes</Link>
                        </Button> <Button asChild size="header" variant="transparent" hover="gradient" radius="none" className="h-full inline-flex items-center justify-center">
                            <Link to="/admin">Admin</Link>
                        </Button>
                    </div>
                    <div className="w-full p-6 flex gap-6 justify-end">
                        <div className="rounded-md p-[4px] bg-gradient-to-br from-primary to-secondary dark">
                            <div className="rounded-md p-2.5 bg-black transition-all outline-none hover:bg-transparent hover:text-black">
                                <Button asChild size="header" variant="transparent" className="h-full inline-flex items-center justify-center">
                                    <Link to="/">Login</Link>
                                </Button>
                            </div>
                        </div>
                        <Button asChild size="xl" variant="secondary" className="p-3">
                            <Link to="/">Register</Link>
                        </Button>
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