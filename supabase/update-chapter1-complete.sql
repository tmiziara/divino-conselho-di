-- Script para atualizar o capítulo 1 com o texto completo
-- Execute este script no SQL Editor do Supabase

UPDATE bible_study_chapters 
SET 
    reflective_reading = 'A ansiedade é uma das epidemias silenciosas do nosso tempo. Ela se infiltra em nossas mentes como uma neblina espessa, obscurecendo nossa visão da fidelidade de Deus e nossa capacidade de confiar em Seus planos perfeitos. Paulo, ao escrever estas palavras aos filipenses, não estava em um resort de luxo ditando pensamentos filosóficos abstratos. Ele estava em uma prisão romana, enfrentando a possibilidade real de execução, longe de seus amigos e das igrejas que tanto amava.\n\nÉ exatamente dessa posição de vulnerabilidade que surge uma das mais poderosas receitas contra a ansiedade já registradas na história humana. Paulo descobriu um segredo que milhões de pessoas hoje ainda lutam para compreender: a ansiedade é, em sua essência, um convite disfarçado para uma intimidade mais profunda com Deus.\n\nQuando Paulo diz "não andeis ansiosos de coisa alguma", ele não está minimizando nossos problemas reais ou sugerindo que devemos viver em negação. A palavra grega usada aqui, "merimnao", literalmente significa "ser puxado em direções diferentes" ou "ter a mente dividida". A ansiedade nos fragmenta, nos divide entre o que sabemos sobre o caráter de Deus e o que tememos sobre nosso futuro.\n\nImagine por um momento um pai amoroso observando seu filho de cinco anos preocupado porque não sabe como vai pagar as contas da casa. O pai sorriria com ternura, não por menosprezar a sinceridade da preocupação da criança, mas porque ele conhece recursos que a criança nem imagina. Ele tem planos, provisões e um amor que nunca falhará. Essa é exatamente nossa posição diante de Deus quando nos consumimos com ansiedade.\n\nA alternativa que Paulo apresenta não é a negação, mas a transferência. "Em tudo, pela oração e pela súplica, com ações de graças, sejam as vossas petições conhecidas diante de Deus." Observe a progressão aqui: primeiro reconhecemos nossa necessidade (oração), depois especificamos nossos pedidos (súplica), e fazemos isso tudo envolvido em gratidão (ações de graças).\n\nA gratidão em meio à ansiedade pode parecer contraditória, mas é exatamente isso que transforma nossa perspectiva. Quando escolhemos ser gratos mesmo antes de ver a resposta, estamos declarando nossa confiança no caráter de Deus, não apenas em Suas ações. Estamos dizendo: "Deus, mesmo que eu não entenda este momento, eu sei quem Tu és, e isso é suficiente."',
    updated_at = NOW()
WHERE study_id = (
    SELECT id FROM bible_studies 
    WHERE title = 'Vencendo a Ansiedade com Fé'
) AND chapter_number = 1;

-- Verificar se foi atualizado
SELECT 
    chapter_number,
    title,
    LEFT(reflective_reading, 500) || '...' as reflective_reading_preview
FROM bible_study_chapters 
WHERE study_id = (
    SELECT id FROM bible_studies 
    WHERE title = 'Vencendo a Ansiedade com Fé'
) AND chapter_number = 1; 