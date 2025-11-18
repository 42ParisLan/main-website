import { IconChalkboardTeacher } from '@tabler/icons-react'

export function Header() {
    return (
        <header className="bg-background sticky top-0 w-full">
            <div className="container-wrapper">
                <nav className="flex items-center bg-black h-20">
                    <div className="h-full flex items-center">
                        <button className="" type="button" onClick={() => (window.location.href = "/")}>
						    <IconChalkboardTeacher className="w-24 h-full text-white" />
                        </button>
					</div>
                    <div className="flex items-center justify-center gap-4 h-full ">
                        <a className="h-full inline-flex items-center justify-center whitespace-nowrap text-xl font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/10 hover:text-accent-foreground dark:hover:bg-accent/50 h-8  gap-1.5 px-3 text-white" data-slot="button" href="/tournaments">Tournaments</a>
                        <a className="h-full hover:bg-primary/10 inline-flex items-center justify-center whitespace-nowrap text-xl font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8  gap-1.5 px-3 text-white" data-slot="button" href="/votes">Votes</a>
                        <a className="h-full hover:bg-primary/10 inline-flex items-center justify-center whitespace-nowrap text-xl font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8  gap-1.5 px-3 text-white" data-slot="button" href="/admin">Admin</a>
                    </div>
                </nav>
            </div>
        </header>
    );
}
