import os
import json
import sys

if len(sys.argv) < 2:
    print('Uso: python split_bible_by_book.py <arquivo_entrada.json>')
    sys.exit(1)

input_file = sys.argv[1]
version = os.path.splitext(os.path.basename(input_file))[0]  # pt_aa, pt_acf, etc
output_dir = f'public/data/bible/{version}'

os.makedirs(output_dir, exist_ok=True)

with open(input_file, encoding='utf-8-sig') as f:
    bible = json.load(f)

for book in bible:
    abrev = book.get('abbrev')
    if not abrev:
        print(f"Livro sem abreviação: {book.get('name')}")
        continue
    out_path = os.path.join(output_dir, f'{abrev}.json')
    with open(out_path, 'w', encoding='utf-8') as out_f:
        json.dump(book, out_f, ensure_ascii=False, indent=2)
    print(f'Salvo: {out_path}')

print('Divisão concluída!') 