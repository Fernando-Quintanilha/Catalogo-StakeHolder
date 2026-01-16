import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
    id: number;
    SKU: number;
    NOME: string;
    UNIDADE: string;
    imagem?: string;
    quantidade: number; 
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: number) => void;
    updateCartQuantity: (id: number, novaQuantidade: number) => void;
    totalItems: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Função para adicionar item no carrinho
    function addToCart(product: any) {
        setCart((currItems) => {
            const itemExists = currItems.find((item) => item.id === product.id);
            if (itemExists) {
                return currItems.map((item) =>
                    item.id === product.id ? { ...item, quantidade: item.quantidade + 1 } : item
                );
            } else {
                return [...currItems, { ...product, quantidade: 1 }];
            }
        });
    }

    // Função pra remover item
    function removeFromCart(id: number) {
        setCart((currItems) => currItems.filter((item) => item.id !== id));
    }

    function updateCartQuantity(id: number, novaQuantidade: number) {
        setCart((currItems) => {
            // Se o usuário digitou 0 ou menos, remove o item
            if (novaQuantidade <= 0) {
                return currItems.filter((item) => item.id !== id);
            }
            return currItems.map((item) =>
                item.id === id ? { ...item, quantidade: novaQuantidade } : item
            );
        });
    }

    const totalItems = cart.reduce((total, item) => total + item.quantidade, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartQuantity, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}
export function useCart() {
    return useContext(CartContext);
}