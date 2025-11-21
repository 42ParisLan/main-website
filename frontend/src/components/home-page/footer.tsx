import { IconBrandDiscordFilled, IconBrandTwitterFilled, IconBrandYoutubeFilled, IconBrandTwitch } from '@tabler/icons-react'

export function Footer() {
    return(
        <footer style={{ fontFamily: "Orbitron" }} className="w-full h-60 bg-black">
            <div className="gap-2 p-10 h-full w-full flex justify-evenly flex-row text-gray-400">
                <div className="gap-4 flex flex-col text-left">
                    <span className="text-primary font-bold text-xl">42LAN</span>
                    <span className="text-gray-400 text-xs">ecrire des trucs ici</span>
                    <div className="flex gap-4 py-6">
                        <IconBrandDiscordFilled/>
                        <IconBrandTwitterFilled/>
                        <IconBrandYoutubeFilled/>
                        <IconBrandTwitch/>
                    </div>
                </div>
                <div className="gap-4 text-xs flex flex-col">
                    <span className="text-lg text-white">Tournaments</span>
                    <a href="#">Active events</a>
                    <a href="">Upcoming</a>
                    <a href="">blablabla</a>
                </div>
                <div className="gap-4 text-xs flex flex-col">
                    <span className="text-lg text-white">Community</span>
                    <a href="">Forum</a>
                    <a href="">Discord</a>
                    <a href="">bllablabal</a>
                </div>
                <div className="gap-4 text-xs flex flex-col">
                    <span className="text-lg text-white">Support</span>
                    <a href="">Help Center</a>
                    <a href="">Contact</a>
                    <a href="">Rules</a>
                </div>

            </div>
            <div className="bg-black text-xs text-gray-400 flex flex items-center justify-center">
                <span>2025 blablabla qu'estce qu'on ecrit ici </span>
            </div>
        </footer>
    );
}