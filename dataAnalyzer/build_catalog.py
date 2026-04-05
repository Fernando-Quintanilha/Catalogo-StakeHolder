import json
import os
import time
import csv
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv

AUTH_URL = "https://api.sankhya.com.br/auth/oauth/token"
PRODUTOS_URL = "https://api.sankhya.com.br/gateway/v1/produtos"

ARQUIVO_SAIDA = Path(__file__).parent.parent / "web-catalog" / "src" / "data" / "products.json"
ARQUIVO_MOCK = Path(__file__).parent / "data" / "fake_data.csv"
MAX_RETRIES = 3
REQUEST_TIMEOUT = 30
MOCK_PAGE_SIZE_DEFAULT = 10


def _request_with_retry(method: str, url: str, **kwargs: Any) -> requests.Response:
    last_error: Optional[Exception] = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.request(method=method, url=url, timeout=REQUEST_TIMEOUT, **kwargs)
            response.raise_for_status()
            return response
        except requests.RequestException as error:
            last_error = error
            if attempt == MAX_RETRIES:
                break
            wait_seconds = attempt
            print(f"⚠️ Tentativa {attempt}/{MAX_RETRIES} falhou em {url}. Repetindo em {wait_seconds}s...")
            time.sleep(wait_seconds)

    raise RuntimeError(f"Falha após {MAX_RETRIES} tentativas em {url}: {last_error}")


def _get_env_or_raise(var_name: str) -> str:
    value = os.getenv(var_name, "").strip()
    if not value:
        raise ValueError(f"Variável de ambiente obrigatória não encontrada: {var_name}")
    return value


def _is_mock_enabled() -> bool:
    return os.getenv("SANKHYA_MOCK", "false").strip().lower() == "true"


def _read_mock_page_size() -> int:
    raw_value = os.getenv("SANKHYA_MOCK_PAGE_SIZE", str(MOCK_PAGE_SIZE_DEFAULT)).strip()
    parsed_value = _to_int(raw_value)
    return parsed_value if parsed_value > 0 else MOCK_PAGE_SIZE_DEFAULT


def autenticar() -> str:
    client_id = _get_env_or_raise("SANKHYA_CLIENT_ID")
    client_secret = _get_env_or_raise("SANKHYA_CLIENT_SECRET")

    print("🔐 Autenticando no Gateway Sankhya...")
    response = _request_with_retry(
        "POST",
        AUTH_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        },
    )

    payload = response.json()
    access_token = payload.get("access_token")
    if not access_token:
        raise RuntimeError("Resposta de autenticação sem access_token.")

    return str(access_token)


def _extract_items(payload: Any) -> List[Dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]

    if isinstance(payload, dict):
        for key in ("items", "data", "content", "result", "results"):
            candidate = payload.get(key)
            if isinstance(candidate, list):
                return [item for item in candidate if isinstance(item, dict)]

        # Alguns endpoints retornam envelope interno com outro objeto de dados
        for key in ("data", "result"):
            nested = payload.get(key)
            if isinstance(nested, dict):
                for nested_key in ("items", "content", "results"):
                    candidate = nested.get(nested_key)
                    if isinstance(candidate, list):
                        return [item for item in candidate if isinstance(item, dict)]

    return []


def _has_next_page(payload: Any, current_page: int, total_items_in_page: int) -> bool:
    if isinstance(payload, dict):
        pagination = payload.get("pagination")
        if isinstance(pagination, dict):
            if "hasNext" in pagination:
                return bool(pagination.get("hasNext"))
            if "totalPages" in pagination:
                return current_page < int(pagination.get("totalPages", current_page))

        if "hasNext" in payload:
            return bool(payload.get("hasNext"))
        if "totalPages" in payload:
            return current_page < int(payload.get("totalPages", current_page))

    # Fallback: quando não existe metadado de paginação, encerra ao receber página vazia.
    return total_items_in_page > 0


def buscar_produtos(token: str) -> List[Dict[str, Any]]:
    print("📦 Buscando produtos paginados...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }

    todos_produtos: List[Dict[str, Any]] = []
    page = 1

    while True:
        response = _request_with_retry(
            "GET",
            PRODUTOS_URL,
            headers=headers,
            params={"page": page},
        )
        payload = response.json()
        produtos_pagina = _extract_items(payload)

        if not produtos_pagina:
            break

        todos_produtos.extend(produtos_pagina)
        print(f"  - Página {page}: {len(produtos_pagina)} itens")

        if not _has_next_page(payload, page, len(produtos_pagina)):
            break

        page += 1

    print(f"✅ Total de produtos recebidos: {len(todos_produtos)}")
    return todos_produtos


def _ler_produtos_mock_csv() -> List[Dict[str, Any]]:
    if not os.path.exists(ARQUIVO_MOCK):
        raise FileNotFoundError(f"Arquivo de mock não encontrado: {ARQUIVO_MOCK}")

    encodings = ["utf-8", "latin-1"]
    last_error: Optional[Exception] = None

    for encoding in encodings:
        try:
            with open(ARQUIVO_MOCK, "r", encoding=encoding, newline="") as file:
                reader = csv.DictReader(file, delimiter=";")
                rows = [dict(row) for row in reader if row]
                return rows
        except (UnicodeDecodeError, OSError) as error:
            last_error = error

    raise RuntimeError(f"Falha ao ler arquivo mock {ARQUIVO_MOCK}: {last_error}")


def _normalizar_mock_item(item: Dict[str, Any]) -> Dict[str, Any]:
    sku = _to_int(item.get("SKU") or item.get("sku"))
    nome = str(item.get("NOME") or item.get("nome") or "").strip()
    unidade = str(item.get("UNIDADE") or item.get("unidade") or "").strip()
    imagem = str(item.get("IMAGEM") or item.get("imagem") or "").strip()

    return {
        "SKU": sku,
        "NOME": nome,
        "UNIDADE": unidade or "CADA",
        "GRUPO": "MOCK",
        "DESCRICAO": nome,
        "IMAGEM": imagem,
    }


def buscar_produtos_mock() -> List[Dict[str, Any]]:
    print("🧪 Modo mock ativo: usando fake_data.csv com paginação simulada...")
    produtos_csv = [_normalizar_mock_item(item) for item in _ler_produtos_mock_csv()]
    page_size = _read_mock_page_size()

    todos_produtos: List[Dict[str, Any]] = []
    page = 1

    while True:
        start = (page - 1) * page_size
        end = start + page_size
        itens_pagina = produtos_csv[start:end]

        payload = {
            "data": itens_pagina,
            "pagination": {
                "hasNext": end < len(produtos_csv),
                "totalPages": (len(produtos_csv) + page_size - 1) // page_size,
            },
        }

        produtos_pagina = _extract_items(payload)
        if not produtos_pagina:
            break

        todos_produtos.extend(produtos_pagina)
        print(f"  - Página {page} (mock): {len(produtos_pagina)} itens")

        if not _has_next_page(payload, page, len(produtos_pagina)):
            break

        page += 1

    print(f"✅ Total de produtos mock recebidos: {len(todos_produtos)}")
    return todos_produtos


def _to_int(value: Any) -> int:
    if value is None:
        return 0
    try:
        text = str(value).strip()
        if not text:
            return 0
        return int(float(text))
    except (ValueError, TypeError):
        return 0


def _pick_first(item: Dict[str, Any], keys: List[str]) -> Any:
    for key in keys:
        if key in item and item[key] not in (None, ""):
            return item[key]
    return None


def carregar_mapa_imagens() -> Dict[int, str]:
    mapa: Dict[int, str] = {}

    if not os.path.exists(ARQUIVO_SAIDA):
        return mapa

    try:
        with open(ARQUIVO_SAIDA, "r", encoding="utf-8") as file:
            produtos_existentes = json.load(file)

        if not isinstance(produtos_existentes, list):
            return mapa

        for produto in produtos_existentes:
            if not isinstance(produto, dict):
                continue
            sku = _to_int(produto.get("SKU") or produto.get("id"))
            imagem = str(produto.get("imagem", "")).strip()
            if sku > 0 and imagem:
                mapa[sku] = imagem
    except (json.JSONDecodeError, OSError) as error:
        print(f"⚠️ Não foi possível carregar mapa de imagens existente: {error}")

    return mapa


def montar_catalogo(produtos_api: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    mapa_imagens = carregar_mapa_imagens()
    lista_final: List[Dict[str, Any]] = []

    for item in produtos_api:
        sku_raw = _pick_first(item, ["SKU", "sku", "CODPROD", "codProd", "codigo"])
        sku = _to_int(sku_raw)
        if sku <= 0:
            continue

        nome = _pick_first(item, ["NOME", "nome", "DESCRPROD", "descrProd", "descricao", "DESCRICAO"])
        descricao = _pick_first(item, ["descricao", "DESCRICAO", "DESCRCOMPL", "descrCompl"])
        unidade = _pick_first(item, ["UNIDADE", "unidade", "CODVOL", "codVol"])
        grupo = _pick_first(item, ["GRUPO", "grupo", "CODGRUPOPROD", "codGrupoProd"])

        nome_final = str(nome or descricao or f"Produto {sku}").strip()
        unidade_final = str(unidade or grupo or "CADA").strip()

        novo_item: Dict[str, Any] = {
            "id": sku,
            "SKU": sku,
            "NOME": nome_final,
            "UNIDADE": unidade_final,
        }

        imagem_api = str(_pick_first(item, ["IMAGEM", "imagem"]) or "").strip()
        imagem = mapa_imagens.get(sku, "").strip() or imagem_api
        if imagem:
            novo_item["imagem"] = imagem

        lista_final.append(novo_item)

    return lista_final


def salvar_catalogo(produtos: List[Dict[str, Any]]) -> None:
    os.makedirs(os.path.dirname(ARQUIVO_SAIDA), exist_ok=True)
    with open(ARQUIVO_SAIDA, "w", encoding="utf-8") as file:
        json.dump(produtos, file, indent=2, ensure_ascii=False)

    print(f"✅ Sucesso! {len(produtos)} produtos exportados para {ARQUIVO_SAIDA}")


def converter_dados() -> None:
    try:
        load_dotenv()
        if _is_mock_enabled():
            produtos_api = buscar_produtos_mock()
        else:
            token = autenticar()
            produtos_api = buscar_produtos(token)
        catalogo = montar_catalogo(produtos_api)
        salvar_catalogo(catalogo)
    except Exception as error:
        print(f"❌ Erro ao gerar catálogo: {error}")


if __name__ == "__main__":
    converter_dados()