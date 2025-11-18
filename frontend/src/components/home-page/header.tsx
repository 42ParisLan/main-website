import { IconChalkboardTeacher } from '@tabler/icons-react'

export function Header() {
    return (
        <header className="bg-background sticky top-0 w-full">
            <div className="container-wrapper">
                <nav className="flex items-center bg-black h-20 text-gray-300">
                    <div className="h-full flex items-center">
                        <button className="" type="button" onClick={() => (window.location.href = "/")}>
                            <IconChalkboardTeacher className="w-24 h-full" />
                        </button>
                    </div>
                    <div className="flex items-center justify-center gap-4 h-full text-lg">
                        <a className="h-full inline-flex items-center justify-center whitespace-nowrap font-medium transition-all outline-none hover:bg-gradient-to-br hover:from-blue-400 hover:to-purple-500 h-8  gap-1.5 px-3 text-white" data-slot="button" href="/tournaments">Tournaments</a>
                        <a className="h-full inline-flex items-center justify-center whitespace-nowrap font-medium transition-all outline-none hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500 h-8  gap-1.5 px-3 text-white" data-slot="button" href="/votes">Votes</a>
                        <a className="h-full inline-flex items-center justify-center whitespace-nowrap font-medium transition-all outline-none hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500 h-8  gap-1.5 px-3 text-white" data-slot="button" href="/admin">Admin</a>
                    </div>
                    <div className="w-full p-6 flex gap-6 justify-end">
                        <div className="p-2.5 border border-2 border-solid transition-all outline-none hover:bg-white hover:text-black">
                            <button>Sign In</button>
                        </div>
                        <div className="transition-all outline-none bg-purple-800 text-white hover:bg-purple-900">
                            <button className="p-3 " onClick={() => (window.location.href = "/tournaments/1/register")}>Register</button>
                        </div>
					</div>
                </nav>
            </div>
        </header>
    );
}
