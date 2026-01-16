import { useCart } from '../contexts/CartContext';

interface ProductProps {
  product: {
    id: number;
    SKU: number;
    NOME: string;
    UNIDADE: string;
    imagem?: string;
  }
}

export function ProductCard({ product }: ProductProps) {
  const { cart, addToCart, removeFromCart, updateCartQuantity } = useCart();

  const caminhoBase = "/produtos/";

  const itemInCart = cart.find((item) => item.id === product.id);
  const quantidadeAtual = itemInCart ? itemInCart.quantidade : 0;

  const nomeArquivo = product.imagem || `${product.id}.jpg`;
  const imagemFinal = `${caminhoBase}${nomeArquivo}`;

  return (
    <div id={`produto-${product.id}`} className="border p-4 rounded-lg shadow-md flex flex-col justify-between gap-2 w-full bg-white hover:shadow-lg transition-all duration-200 h-full">

      {/* Imagem e Detalhes */}
      <div className="w-full h-48 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center relative border border-gray-100">
        <img
          src={imagemFinal}
          alt={product.NOME}
          className="object-contain h-full w-full mix-blend-multiply"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span className="absolute top-1 right-1 bg-gray-200 text-gray-600 text-[10px] px-1 rounded font-mono">
          #{product.SKU}
        </span>
      </div>

      <div className="flex flex-col gap-1 mt-2 mb-2">
        <h3 className="text-md font-bold text-gray-800 leading-tight line-clamp-2">
          {product.NOME}
        </h3>
        <p className="text-xs text-gray-400 uppercase font-semibold">
          UNID: {product.UNIDADE}
        </p>
      </div>

      <div className="mt-auto">
        {quantidadeAtual === 0 ? (
          <button
            onClick={() => addToCart(product)}
            className="w-full bg-green-600 text-white font-medium text-sm py-2 rounded hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            Adicionar à Cotação
          </button>
        ) : (
          // Controles (Menos | Input | Mais)
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded text-green-900 font-bold">

            <button
              onClick={() => {
                if (quantidadeAtual === 1) {
                  removeFromCart(product.id);
                } else {
                  updateCartQuantity(product.id, quantidadeAtual - 1);
                }
              }}
              className="px-4 py-2 hover:bg-green-100 text-lg transition-colors border-r border-green-200"
            >
              -
            </button>

            <input
              type="number"
              min="1"
              aria-label={`Quantidade de ${product.NOME}`}
              value={quantidadeAtual}
              // Auto-select text on focus to facilitate quick editing
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                  updateCartQuantity(product.id, val);
                }
              }}
              onBlur={(e) => {
                if (e.target.value === "" || parseInt(e.target.value) === 0) {
                  updateCartQuantity(product.id, 1);
                }
              }}
              className="w-full text-center bg-transparent focus:outline-none text-green-900 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <button
              onClick={() => addToCart(product)}
              className="px-4 py-2 hover:bg-green-100 text-lg transition-colors border-l border-green-200"
            >
              +
            </button>

          </div>
        )}
      </div>

    </div>
  )
}