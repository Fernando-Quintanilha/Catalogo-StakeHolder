export function Header() {
    return (
        <header className="bg-green-800 text-white shadow-lg sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
                <div className="text-center md:text-left">
                    <h1 className="text-2xl font-bold tracking-tight uppercase">Fernando Representações</h1>
                </div>
            </div>
        </header>
    );
}