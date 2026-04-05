# Catálogo Digital - StakeHolder (TH Chaves Distribuidora)

Uma solução full-stack para digitalização de processos de vendas. Este projeto substitui catálogos estáticos (PDF) por uma aplicação web interativa, permitindo busca rápida, carrinho de cotação e envio de pedidos via WhatsApp.

## Visão Geral do Projeto

O sistema opera em uma arquitetura híbrida de automação de dados e interface web:

1.  **Data Pipeline (Python):** Um script autentica no Sankhya Gateway, busca produtos via API REST paginada e gera uma base JSON otimizada.
2.  **Frontend (React):** Uma interface moderna e responsiva consome esse JSON estático para renderizar o catálogo com alta performance.

## Tecnologias Utilizadas

### Frontend (web-catalog)
- **React (Vite)**: Performance e componentização.
- **TypeScript**: Tipagem estática para segurança do código.
- **Tailwind CSS**: Estilização moderna e responsiva.
- **Context API**: Gerenciamento de estado global (Carrinho de compras).
- **React Icons**: Biblioteca de ícones.

### Automação de Dados (dataAnalyzer)
- **Python 3**: Linguagem de script.
- **Requests**: Consumo da API REST do Sankhya.
- **python-dotenv**: Carregamento de variáveis de ambiente via `.env`.

## Funcionalidades Principais

- **Busca Inteligente**: Filtragem em tempo real por nome do produto ou código SKU.
- **Carrinho Dinâmico**: Adição/remoção de itens com cálculo automático de quantidades.
- **Checkout via WhatsApp**: Gera uma mensagem formatada com o pedido e envia para o vendedor.
- **Tratamento de Erros**: Fallback automático para produtos sem imagem.
- **Responsividade**: Layout adaptado para Desktop e Mobile.

## Estrutura do Repositório

```bash
StakeHolder/
├── dataAnalyzer/      # Scripts Python para processamento de dados (ETL)
│   ├── build_catalog.py
│   └── ...
├── web-catalog/       # Aplicação Frontend React
│   ├── src/
│   ├── public/
│   └── ...
└── README.md
```

### Como Rodar o Projeto
## Pré-requisitos
Node.js
Python 3.x

```bash
cd dataAnalyzer
    pip install -r requirements.txt
    copy .env.example .env
python build_catalog.py

cd ..
cd web-catalog
npm install
npm run dev
```
Desenvolvido por Fernando Quintanilha.


