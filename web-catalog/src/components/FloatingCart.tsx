import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import vendedoresData from '../data/vendedores.json';

interface Vendedor {
    id: number;
    nome: string;
    whatsapp: string;
}

export function FloatingCart() {
    const { cart, totalItems, removeFromCart } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

    const vendedores = vendedoresData as Vendedor[];

    const openWhatsAppCheckout = (whatsapp: string) => {
        if (!whatsapp) return;

        let message = "*Olá! Gostaria de solicitar a cotação destes itens:*\n\n";
        cart.forEach(item => {
            message += `*${item.quantidade}x* ${item.NOME}\n   (Cód: ${item.SKU})\n\n`;
        });
        message += "----------------\nAguardo o retorno!";

        const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleVendorSelection = (vendedor: Vendedor) => {
        setIsVendorModalOpen(false);
        openWhatsAppCheckout(vendedor.whatsapp);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        if (vendedores.length === 0) return;
        if (vendedores.length === 1) {
            openWhatsAppCheckout(vendedores[0].whatsapp);
            return;
        }

        setIsVendorModalOpen(true);
    };

    return (
        <>
            {/* float cart */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-2xl hover:bg-green-700 hover:scale-110 transition-all z-50 flex items-center justify-center group cursor-pointer"
            >
                {/* Icone de Carrinho */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>

                {/* Bolinha Vermelha com Contador */}
                {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                        {totalItems}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>

                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                            <h2 className="font-bold text-lg text-gray-800">Seus itens</h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 p-2 font-bold cursor-pointer">
                                ✕
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            {cart.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <p>Seu carrinho está vazio.</p>
                                    <button onClick={() => setIsOpen(false)} className="mt-4 text-green-600 font-medium hover:underline">
                                        Ver produtos
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 border-b pb-3 last:border-0">
                                            {/* Mini Foto na SearchBar */}
                                            <div className="h-12 w-12 bg-gray-100 rounded border overflow-hidden shrink-0">
                                                <img src={`/produtos/${item.imagem || item.id + '.jpg'}`} alt="" className="h-full w-full object-contain"
                                                    onError={(e) => (e.target as HTMLImageElement).src = "/produtos/sem_foto.png"} />
                                            </div>

                                            <div className="flex-1">
                                                <p className="font-semibold text-sm line-clamp-2">{item.NOME}</p>
                                                <p className="text-xs text-gray-500">Qtd: <strong className="text-gray-800 text-sm">{item.quantidade}</strong> ({item.UNIDADE})</p>
                                            </div>

                                            {/*  Lixeira */}
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                                                title="Remover item"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 border-t">
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || vendedores.length === 0}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/30 transition-all cursor-pointer"
                            >
                                <span>Enviar Cotação</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {isVendorModalOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setIsVendorModalOpen(false)}
                >
                    <div
                        className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg text-gray-800">Escolha um vendedor</h2>
                                <p className="text-sm text-gray-500">Selecione para enviar sua cotação pelo WhatsApp.</p>
                            </div>
                            <button
                                onClick={() => setIsVendorModalOpen(false)}
                                className="text-gray-400 hover:text-red-500 p-2 font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            {vendedores.map((vendedor) => (
                                <div
                                    key={vendedor.id}
                                    className="border rounded-lg p-4 flex items-center justify-between gap-4"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">{vendedor.nome}</p>
                                        <p className="text-sm text-gray-500">WhatsApp: {vendedor.whatsapp}</p>
                                    </div>
                                    <button
                                        onClick={() => handleVendorSelection(vendedor)}
                                        className="shrink-0 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer"
                                    >
                                        Selecionar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}