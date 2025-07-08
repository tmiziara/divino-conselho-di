import os
import json

# Caminhos
input_path = 'public/data/nvi.json'
output_dir = 'public/data/bible/nvi'

# Garantir que o diretório de saída existe
os.makedirs(output_dir, exist_ok=True)

# Carregar o arquivo nvi.json
with open(input_path, encoding='utf-8-sig') as f:
    nvi = json.load(f)

# Salvar cada livro em um arquivo separado
for book in nvi:
    abrev = book.get('abbrev')
    if not abrev:
        print(f"Livro sem abreviação: {book.get('name')}")
        continue
    out_path = os.path.join(output_dir, f'{abrev}.json')
    with open(out_path, 'w', encoding='utf-8') as out_f:
        json.dump(book, out_f, ensure_ascii=False, indent=2)
    print(f'Salvo: {out_path}')

print('Divisão concluída!') 