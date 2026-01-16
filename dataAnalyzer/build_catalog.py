import pandas as pd
import json
import os

ARQUIVO_ENTRADA = 'dataAnalyzer/data/fake_data.csv'
ARQUIVO_SAIDA = 'web-catalog/src/data/products.json' 

def converter_dados():
    print(f"🔄 Lendo {ARQUIVO_ENTRADA}...")
    
    try:
        if ARQUIVO_ENTRADA.endswith('.csv'):
            df = pd.read_csv(ARQUIVO_ENTRADA, sep=';', encoding='utf-8')
        else:
            df = pd.read_excel(ARQUIVO_ENTRADA)
            
        if 'IMAGEM' in df.columns:
            df['IMAGEM'] = df['IMAGEM'].fillna('')
        else:
            print("Coluna IMAGEM não encontrada. Criando vazia...")
            df['IMAGEM'] = ""

        produtos = df.to_dict(orient='records')
        
        lista_final = []
        for item in produtos:
            novo_item = {
                "id": int(item.get('SKU', 0)),
                "SKU": int(item.get('SKU', 0)),
                "NOME": str(item.get('NOME', '')),
                "UNIDADE": str(item.get('UNIDADE', '')),
                "imagem": str(item.get('IMAGEM', ''))
            }
            
            if novo_item['imagem'] == "":
                del novo_item['imagem']
                
            lista_final.append(novo_item)

        os.makedirs(os.path.dirname(ARQUIVO_SAIDA), exist_ok=True)
        
        with open(ARQUIVO_SAIDA, 'w', encoding='utf-8') as f:
            json.dump(lista_final, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Sucesso! {len(lista_final)} produtos exportados para {ARQUIVO_SAIDA}")

    except Exception as e:
        print(f"❌ Erro ao converter: {e}")

if __name__ == "__main__":
    converter_dados()