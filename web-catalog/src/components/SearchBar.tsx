import { useState } from 'react';
import productsData from '../data/products.json';

const smoothScrollTo = (elementId: string, duration: number = 2000) => {
  const target = document.getElementById(elementId);
  if (!target) return;

  const targetPosition = target.getBoundingClientRect().top + window.scrollY;
  const startPosition = window.scrollY;
  const offsetPosition = targetPosition - (window.innerHeight / 2) + (target.clientHeight / 2);
  const distance = offsetPosition - startPosition;

  let startTime: number | null = null;

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;

    // Rampa de Aceleração ao Clicar no Item
    const run = ease(timeElapsed, startPosition, distance, duration);

    window.scrollTo(0, run);

    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t: number, b: number, c: number, d: number) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
};

export function SearchBar() {
  const [busca, setBusca] = useState('');

  const resultados = busca.length > 0
    ? productsData.filter(produto =>
      produto.NOME.toLowerCase().includes(busca.toLowerCase()) ||
      produto.SKU.toString().includes(busca)
    )
    : [];

  return (

    <div className="sticky top-0 z-50 bg-gray-50/95 backdrop-blur-sm py-4 mb-6 shadow-sm border-b border-gray-200 -mx-8 px-8">

      <div className="relative w-full max-w-md mx-auto">

        <div className="relative">
          <input
            type="text"
            placeholder="Busque por nome ou código..."
            className="w-full p-3 pl-4 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <div className="absolute right-3 top-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Resultados da PEsquisa */}
        {resultados.length > 0 && (
          <div className="absolute w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-80 overflow-y-auto overflow-x-hidden z-50">
            {resultados.map((produto) => {
              const caminhoBase = "/produtos/";
              const nomeArquivo = produto.imagem || `${produto.id}.jpg`;
              const imgFinal = `${caminhoBase}${nomeArquivo}`;

              return (
                <div
                  key={produto.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                  onClick={() => {
                    smoothScrollTo(`produto-${produto.id}`, 2000);

                    const elementoAlvo = document.getElementById(`produto-${produto.id}`);
                    if (elementoAlvo) {
                      elementoAlvo.classList.add('ring-4', 'ring-blue-500');
                      setTimeout(() => {
                        elementoAlvo.classList.remove('ring-4', 'ring-blue-500');
                      }, 2500);
                    }
                    setBusca('');
                  }}
                >
                  {/* Miniatura */}
                  <div className="h-12 w-12 shrink-0 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                    <img
                      src={imgFinal}
                      alt={produto.NOME}
                      className="h-full w-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/produtos/sem_foto.png"; }}
                    />
                  </div>
                  {/* Texto */}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">{produto.NOME}</span>
                    <span className="text-xs text-gray-400">Cód: {produto.SKU} • {produto.UNIDADE}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {busca.length > 0 && resultados.length === 0 && (
          <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
            Nenhum produto encontrado.
          </div>
        )}
      </div>
    </div>
  );
}