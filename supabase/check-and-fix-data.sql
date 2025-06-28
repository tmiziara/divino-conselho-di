-- Script para verificar e corrigir dados dos estudos bíblicos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela bible_studies existe e tem dados
SELECT 'Verificando tabela bible_studies:' as info;
SELECT COUNT(*) as total_studies FROM bible_studies;
SELECT * FROM bible_studies;

-- 2. Verificar se a tabela bible_study_chapters existe e tem dados
SELECT 'Verificando tabela bible_study_chapters:' as info;
SELECT COUNT(*) as total_chapters FROM bible_study_chapters;
SELECT * FROM bible_study_chapters;

-- 3. Verificar se há estudos ativos
SELECT 'Estudos ativos:' as info;
SELECT id, title, is_active, total_chapters FROM bible_studies WHERE is_active = true;

-- 4. Verificar capítulos por estudo
SELECT 'Capítulos por estudo:' as info;
SELECT 
    bs.title as study_title,
    COUNT(bsc.id) as chapters_count,
    bs.total_chapters as expected_chapters
FROM bible_studies bs
LEFT JOIN bible_study_chapters bsc ON bs.id = bsc.study_id
WHERE bs.is_active = true
GROUP BY bs.id, bs.title, bs.total_chapters;

-- 5. Se não houver dados, inserir o estudo "Vencendo a Ansiedade com Fé"
-- Primeiro, vamos limpar dados existentes para evitar duplicação
DELETE FROM bible_study_chapters WHERE study_id IN (SELECT id FROM bible_studies WHERE title LIKE '%Ansiedade%');
DELETE FROM bible_studies WHERE title LIKE '%Ansiedade%';

-- Inserir o estudo
INSERT INTO bible_studies (
    id,
    title,
    description,
    total_chapters,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Vencendo a Ansiedade com Fé',
    'Um estudo bíblico de 7 capítulos que combina versículos poderosos, reflexões profundas e aplicações práticas para superar a ansiedade através da fé em Deus.',
    7,
    true,
    NOW(),
    NOW()
) RETURNING id;

-- 6. Inserir os capítulos do estudo
-- Capítulo 1
INSERT INTO bible_study_chapters (
    id,
    study_id,
    chapter_number,
    title,
    main_verse,
    main_verse_reference,
    reflective_reading,
    reflection_question,
    chapter_prayer,
    practical_application,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM bible_studies WHERE title = 'Vencendo a Ansiedade com Fé'),
    1,
    'Não Andeis Ansiosos',
    'Não andeis ansiosos por coisa alguma; antes em tudo sejam os vossos pedidos conhecidos diante de Deus pela oração e súplica, com ações de graças.',
    'Filipenses 4:6',
    'A ansiedade é uma das maiores armadilhas do inimigo para roubar nossa paz. Paulo nos ensina que a resposta não é suprimir a ansiedade, mas transformá-la em oração. Quando nos sentimos ansiosos, Deus não nos repreende, mas nos convida a levar tudo a Ele em oração.\n\nA chave está em "em tudo" - não apenas nas grandes crises, mas também nas pequenas preocupações do dia a dia. Deus se importa com cada detalhe da nossa vida.\n\nAs "ações de graças" são fundamentais. Mesmo antes de ver a resposta, agradecemos a Deus por Sua fidelidade e cuidado.',
    'Em que áreas da sua vida você tem sentido mais ansiedade ultimamente? Como você tem lidado com essas preocupações?',
    'Pai querido, reconheço que tenho permitido que a ansiedade roube minha paz. Ensina-me a transformar cada preocupação em oração. Ajuda-me a confiar que Tu cuidas de mim e que nada é pequeno demais para Teu cuidado. Em nome de Jesus, amém.',
    'Hoje, quando sentir ansiedade surgindo, pare por um momento e transforme essa preocupação em oração. Não importa quão pequena seja a situação, leve-a a Deus com gratidão por Sua presença em sua vida.',
    NOW(),
    NOW()
);

-- Capítulo 2
INSERT INTO bible_study_chapters (
    id,
    study_id,
    chapter_number,
    title,
    main_verse,
    main_verse_reference,
    reflective_reading,
    reflection_question,
    chapter_prayer,
    practical_application,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM bible_studies WHERE title = 'Vencendo a Ansiedade com Fé'),
    2,
    'Lançando Sobre Ele Toda a Vossa Ansiedade',
    'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.',
    '1 Pedro 5:7',
    'Pedro usa a palavra "lançar" - não é um ato passivo, mas uma ação deliberada. Como quando lançamos algo longe de nós, devemos ativamente entregar nossas ansiedades a Deus.\n\nA promessa é clara: "ele tem cuidado de vós". Deus não apenas pode cuidar, mas já está cuidando. É um cuidado ativo e contínuo.\n\nEste versículo vem no contexto de humildade. Precisamos reconhecer que não podemos carregar tudo sozinhos e humildemente entregar nossas cargas ao Senhor.',
    'Você tem tentado carregar sozinho cargas que Deus quer carregar por você? Que situações você precisa "lançar" sobre Ele hoje?',
    'Senhor, ensina-me a ser humilde o suficiente para reconhecer que não posso carregar tudo sozinho. Ajuda-me a lançar ativamente minhas ansiedades sobre Ti, confiando que Tu já estás cuidando de mim. Em nome de Jesus, amém.',
    'Faça uma lista das suas principais preocupações. Depois, uma por uma, "lance-as" sobre Deus em oração, visualizando literalmente entregando cada uma a Ele.',
    NOW(),
    NOW()
);

-- Capítulo 3
INSERT INTO bible_study_chapters (
    id,
    study_id,
    chapter_number,
    title,
    main_verse,
    main_verse_reference,
    reflective_reading,
    reflection_question,
    chapter_prayer,
    practical_application,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM bible_studies WHERE title = 'Vencendo a Ansiedade com Fé'),
    3,
    'Buscai Primeiro o Reino de Deus',
    'Portanto, não vos inquieteis, dizendo: Que comeremos? Que beberemos? Ou: Com que nos vestiremos? Porque os gentios é que procuram todas essas coisas; pois vosso Pai celeste sabe que necessitais de todas elas. Mas buscai primeiro o seu reino e a sua justiça, e todas essas coisas vos serão acrescentadas.',
    'Mateus 6:31-33',
    'Jesus nos mostra que a ansiedade muitas vezes vem de focarmos nas coisas erradas. Quando nos preocupamos excessivamente com necessidades básicas, perdemos de vista o que realmente importa.\n\n"Buscai primeiro" significa priorizar. Deus não está dizendo para ignorarmos nossas necessidades, mas para confiarmos que Ele as suprirá enquanto focamos no que é eterno.\n\nA promessa é clara: quando buscamos o reino de Deus primeiro, "todas essas coisas vos serão acrescentadas". É uma questão de prioridades e confiança.',
    'O que você tem colocado em primeiro lugar na sua vida? Suas preocupações materiais ou seu relacionamento com Deus?',
    'Pai, perdoa-me por tantas vezes colocar minhas necessidades materiais acima do Teu reino. Ensina-me a buscar primeiro a Ti e confiar que Tu suprirás todas as minhas necessidades. Em nome de Jesus, amém.',
    'Hoje, quando se preocupar com algo material, pergunte-se: "Estou buscando primeiro o reino de Deus?" Se não, reoriente seus pensamentos para o que é eterno.',
    NOW(),
    NOW()
);

-- Capítulo 4
INSERT INTO bible_study_chapters (
    id,
    study_id,
    chapter_number,
    title,
    main_verse,
    main_verse_reference,
    reflective_reading,
    reflection_question,
    chapter_prayer,
    practical_application,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM bible_studies WHERE title = 'Vencendo a Ansiedade com Fé'),
    4,
    'A Paz de Deus que Excede Todo Entendimento',
    'E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.',
    'Filipenses 4:7',
    'Esta paz "excede todo o entendimento" - não é uma paz que podemos explicar logicamente. É uma paz sobrenatural que vem de Deus mesmo em circunstâncias difíceis.\n\nA paz de Deus "guarda" nossos corações e pensamentos. É como uma sentinela que protege nossa mente de pensamentos ansiosos e destrutivos.\n\nEsta paz está "em Cristo Jesus" - não é algo que conseguimos por nossos próprios esforços, mas um dom que recebemos através do relacionamento com Cristo.',
    'Você já experimentou essa paz que "excede todo o entendimento"? Como ela se manifestou na sua vida?',
    'Senhor, anseio por essa paz que excede todo o entendimento. Guarda meu coração e meus pensamentos em Cristo Jesus. Que eu experimente essa paz sobrenatural mesmo em meio às tempestades da vida. Em nome de Jesus, amém.',
    'Quando se sentir ansioso, repita este versículo e peça a Deus para guardar seus pensamentos. Observe como a paz de Deus começa a substituir a ansiedade.',
    NOW(),
    NOW()
);

-- Capítulo 5
INSERT INTO bible_study_chapters (
    id,
    study_id,
    chapter_number,
    title,
    main_verse,
    main_verse_reference,
    reflective_reading,
    reflection_question,
    chapter_prayer,
    practical_application,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM bible_studies WHERE title = 'Vencendo a Ansiedade com Fé'),
    5,
    'Não Temas, Porque Eu Sou Contigo',
    'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.',
    'Isaías 41:10',
    'Deus não apenas diz "não temas", mas dá a razão: "porque eu sou contigo". Sua presença é a fonte da nossa coragem.\n\n"Eu sou o teu Deus" - é uma declaração de posse e cuidado. Ele não é apenas Deus, mas o SEU Deus, pessoal e próximo.\n\nA promessa é tripla: "eu te fortaleço, e te ajudo, e te sustento". Deus não apenas está presente, mas ativamente trabalhando em nosso favor.',
    'Você tem sentido a presença de Deus em momentos de ansiedade? Como essa presença se manifestou?',
    'Pai, obrigado por Tua presença constante. Ajuda-me a lembrar que Tu estás sempre comigo, mesmo quando não Te sinto. Fortalece-me, ajuda-me e sustenta-me com Tua mão poderosa. Em nome de Jesus, amém.',
    'Quando se sentir sozinho ou ansioso, repita: "Deus está comigo". Visualize Sua presença ao seu lado, sustentando você com Sua mão poderosa.',
    NOW(),
    NOW()
);

-- Capítulo 6
INSERT INTO bible_study_chapters (
    id,
    study_id,
    chapter_number,
    title,
    main_verse,
    main_verse_reference,
    reflective_reading,
    reflection_question,
    chapter_prayer,
    practical_application,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM bible_studies WHERE title = 'Vencendo a Ansiedade com Fé'),
    6,
    'O Senhor é Meu Pastor, Nada Me Faltará',
    'O Senhor é o meu pastor, nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas. Refrigera a minha alma.',
    'Salmos 23:1-3',
    'Davi usa a metáfora do pastor para descrever o cuidado de Deus. Um pastor conhece suas ovelhas, cuida delas e as protege.\n\n"Nada me faltará" - não significa que teremos tudo que queremos, mas que Deus suprirá todas as nossas necessidades reais.\n\n"Refrigera a minha alma" - Deus restaura nossa paz interior, mesmo quando estamos ansiosos e cansados.',
    'Você tem experimentado Deus como seu Pastor? Como Ele tem suprido suas necessidades?',
    'Senhor, Tu és meu Pastor. Ensina-me a confiar que nada me faltará. Guia-me a águas tranquilas e refrigera minha alma ansiosa. Em nome de Jesus, amém.',
    'Quando se sentir ansioso, imagine-se como uma ovelha sendo cuidada pelo Pastor. Deixe que essa imagem traga paz ao seu coração.',
    NOW(),
    NOW()
);

-- Capítulo 7
INSERT INTO bible_study_chapters (
    id,
    study_id,
    chapter_number,
    title,
    main_verse,
    main_verse_reference,
    reflective_reading,
    reflection_question,
    chapter_prayer,
    practical_application,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM bible_studies WHERE title = 'Vencendo a Ansiedade com Fé'),
    7,
    'Vivendo Livre da Ansiedade',
    'Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei. Tomai sobre vós o meu jugo, e aprendei de mim, que sou manso e humilde de coração; e encontrareis descanso para as vossas almas.',
    'Mateus 11:28-29',
    'Jesus faz um convite pessoal: "Vinde a mim". Não é uma ordem, mas um convite amoroso para todos que estão cansados e sobrecarregados.\n\n"Tomai sobre vós o meu jugo" - um jugo é algo que une duas criaturas para trabalhar juntas. Jesus quer carregar nossas cargas conosco.\n\n"Encontrareis descanso para as vossas almas" - não apenas descanso físico, mas descanso profundo para a alma ansiosa.',
    'Você tem aceitado o convite de Jesus para ir a Ele com suas cargas? Como isso tem transformado sua vida?',
    'Jesus, aceito Teu convite para ir a Ti com todas as minhas cargas. Ensina-me a ser manso e humilde como Tu. Que eu encontre descanso para minha alma em Ti. Amém.',
    'Faça uma lista de todas as suas preocupações e cargas. Depois, uma por uma, entregue-as a Jesus, dizendo: "Jesus, tomo Teu jugo sobre mim".',
    NOW(),
    NOW()
);

-- 7. Verificar se os dados foram inseridos corretamente
SELECT 'Verificação final:' as info;
SELECT 
    bs.title,
    COUNT(bsc.id) as chapters_count
FROM bible_studies bs
LEFT JOIN bible_study_chapters bsc ON bs.id = bsc.study_id
WHERE bs.title = 'Vencendo a Ansiedade com Fé'
GROUP BY bs.id, bs.title; 