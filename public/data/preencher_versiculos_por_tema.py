import json
import re

# Função para mapear nomes dos livros para suas abreviações no nvi.json
BOOK_ABBREVIATIONS = {
    "Gênesis": "gn", "Êxodo": "ex", "Levítico": "lv", "Números": "nm", "Deuteronômio": "dt",
    "Josué": "js", "Juízes": "jz", "Rute": "rt", "1 Samuel": "1sm", "2 Samuel": "2sm",
    "1 Reis": "1rs", "2 Reis": "2rs", "1 Crônicas": "1cr", "2 Crônicas": "2cr", "Esdras": "ed",
    "Neemias": "ne", "Ester": "et", "Jó": "jó", "Salmo": "sl", "Salmos": "sl", "Provérbios": "pv",
    "Eclesiastes": "ec", "Cânticos": "ct", "Isaías": "is", "Jeremias": "jr", "Lamentações": "lm",
    "Ezequiel": "ez", "Daniel": "dn", "Oseias": "os", "Joel": "jl", "Amós": "am", "Obadias": "ob",
    "Jonas": "jn", "Miquéias": "mq", "Naum": "na", "Habacuque": "hc", "Sofonias": "sf", "Ageu": "ag",
    "Zacarias": "zc", "Malaquias": "ml", "Mateus": "mt", "Marcos": "mc", "Lucas": "lc", "João": "jo",
    "Atos": "at", "Romanos": "rm", "1 Coríntios": "1co", "2 Coríntios": "2co", "Gálatas": "gl",
    "Efésios": "ef", "Filipenses": "fp", "Colossenses": "cl", "1 Tessalonicenses": "1ts", "2 Tessalonicenses": "2ts",
    "1 Timóteo": "1tm", "2 Timóteo": "2tm", "Tito": "tt", "Filemom": "fm", "Hebreus": "hb",
    "Tiago": "tg", "1 Pedro": "1pe", "2 Pedro": "2pe", "1 João": "1jo", "2 João": "2jo", "3 João": "3jo",
    "Judas": "jd", "Apocalipse": "ap"
}

def parse_reference(ref):
    # Exemplo: "Efésios 2:8" ou "1 João 4:18"
    m = re.match(r"([1-3]?\s?\w+\s?\w*)\s(\d+):(\d+)", ref)
    if not m:
        return None
    book, chapter, verse = m.groups()
    book = book.strip()
    abbrev = BOOK_ABBREVIATIONS.get(book)
    if not abbrev:
        return None
    return abbrev, int(chapter), int(verse)

def main():
    with open("public/data/versiculos_por_tema.json", encoding="utf-8") as f:
        temas = json.load(f)
    with open("public/data/nvi.json", encoding="utf-8-sig") as f:
        nvi = json.load(f)
    # Mapeia abreviação para livro
    nvi_books = {book["abbrev"]: book for book in nvi}
    novos_temas = []
    for item in temas:
        ref = item["referencia"]
        parsed = parse_reference(ref)
        texto = ""
        if parsed:
            abbrev, chapter, verse = parsed
            book = nvi_books.get(abbrev)
            if book:
                try:
                    texto = book["chapters"][chapter-1][verse-1]
                except Exception:
                    texto = "(Versículo não encontrado)"
            else:
                texto = "(Livro não encontrado)"
        else:
            texto = "(Referência inválida)"
        novo = dict(item)
        novo["texto"] = texto
        novos_temas.append(novo)
    with open("public/data/versiculos_por_tema_com_texto.json", "w", encoding="utf-8") as f:
        json.dump(novos_temas, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main() 