import { SearchBar } from './components/SearchBar';
import { ProductCard } from './components/ProductCard';
import { FloatingCart } from './components/FloatingCart';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import productsData from './data/products.json';
import logoTh from "../../web-catalog/src/assets/logoTh.svg"
import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

function App() {

  const [busca, setBusca] = useState('');
  const produtosFiltrados = productsData.filter((produto) => {
    const textoBusca = busca.toLowerCase();
    const nomeProduto = produto.NOME.toLowerCase();
    const skuProduto = produto.SKU.toString();

    return nomeProduto.includes(textoBusca) || skuProduto.includes(textoBusca);
  });

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pb-32">

        <div className="text-center mb-8 mt-4">

          <img
            src={logoTh}
            alt="Logo TH Chaves"
            className="h-24 w-auto mx-auto mb-4 object-contain"
          />

          <h2 className="text-3xl font-bold text-gray-800">Catálogo Digital</h2>
          <p className="text-gray-500 mt-2">Selecione os itens e adicione à cotação</p>
        </div>

        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Busque por nome ou código..."
            className="w-full pr-10 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <FaSearch size={18} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {produtosFiltrados.length > 0 ? (
            produtosFiltrados.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500 mt-10">
              Nenhum produto encontrado com "{busca}".
            </p>
          )}
        </div>

        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-0">
          {productsData.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div> */}

      </main>

      <Footer />
      <FloatingCart />

    </div>
  )
}

export default App