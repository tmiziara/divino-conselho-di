-- Create bible_studies table
CREATE TABLE public.bible_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT,
  total_chapters INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bible_study_chapters table
CREATE TABLE public.bible_study_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID REFERENCES public.bible_studies(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  main_verse TEXT NOT NULL,
  main_verse_reference TEXT NOT NULL,
  reflective_reading TEXT NOT NULL,
  reflection_question TEXT NOT NULL,
  chapter_prayer TEXT NOT NULL,
  practical_application TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(study_id, chapter_number)
);

-- Create user_study_progress table
CREATE TABLE public.user_study_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  study_id UUID REFERENCES public.bible_studies(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.bible_study_chapters(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Create user_study_favorites table
CREATE TABLE public.user_study_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.bible_study_chapters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Enable Row Level Security
ALTER TABLE public.bible_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_study_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_study_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for bible_studies (public read, admin write)
CREATE POLICY "bible_studies_select" ON public.bible_studies
FOR SELECT USING (true);

CREATE POLICY "bible_studies_insert" ON public.bible_studies
FOR INSERT WITH CHECK (true);

CREATE POLICY "bible_studies_update" ON public.bible_studies
FOR UPDATE USING (true);

-- Policies for bible_study_chapters (public read, admin write)
CREATE POLICY "bible_study_chapters_select" ON public.bible_study_chapters
FOR SELECT USING (true);

CREATE POLICY "bible_study_chapters_insert" ON public.bible_study_chapters
FOR INSERT WITH CHECK (true);

CREATE POLICY "bible_study_chapters_update" ON public.bible_study_chapters
FOR UPDATE USING (true);

-- Policies for user_study_progress (users can only see their own progress)
CREATE POLICY "user_study_progress_select" ON public.user_study_progress
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_study_progress_insert" ON public.user_study_progress
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_study_progress_update" ON public.user_study_progress
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_study_progress_delete" ON public.user_study_progress
FOR DELETE USING (user_id = auth.uid());

-- Policies for user_study_favorites (users can only see their own favorites)
CREATE POLICY "user_study_favorites_select" ON public.user_study_favorites
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_study_favorites_insert" ON public.user_study_favorites
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_study_favorites_delete" ON public.user_study_favorites
FOR DELETE USING (user_id = auth.uid());

-- Insert the first study: "Vencendo a Ansiedade com Fé"
INSERT INTO public.bible_studies (id, title, description, total_chapters) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Vencendo a Ansiedade com Fé',
  'Um estudo bíblico de 7 capítulos para superar a ansiedade através da fé em Deus, baseado em passagens fundamentais da Escritura.',
  7
);

-- Insert chapters for the first study
INSERT INTO public.bible_study_chapters (study_id, chapter_number, title, main_verse, main_verse_reference, reflective_reading, reflection_question, chapter_prayer, practical_application) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  1,
  'Deus Conhece Suas Preocupações',
  'Não andeis ansiosos de coisa alguma; antes, em tudo, pela oração e pela súplica, com ações de graças, sejam as vossas petições conhecidas diante de Deus.',
  'Filipenses 4:6',
  'A ansiedade é uma das epidemias silenciosas do nosso tempo. Ela se infiltra em nossas mentes como uma neblina espessa, obscurecendo nossa visão da fidelidade de Deus e nossa capacidade de confiar em Seus planos perfeitos. Paulo, ao escrever estas palavras aos filipenses, não estava em um resort de luxo ditando pensamentos filosóficos abstratos. Ele estava em uma prisão romana, enfrentando a possibilidade real de execução, longe de seus amigos e das igrejas que tanto amava.

É exatamente dessa posição de vulnerabilidade que surge uma das mais poderosas receitas contra a ansiedade já registradas na história humana. Paulo descobriu um segredo que milhões de pessoas hoje ainda lutam para compreender: a ansiedade é, em sua essência, um convite disfarçado para uma intimidade mais profunda com Deus.

Quando Paulo diz "não andeis ansiosos de coisa alguma", ele não está minimizando nossos problemas reais ou sugerindo que devemos viver em negação. A palavra grega usada aqui, "merimnao", literalmente significa "ser puxado em direções diferentes" ou "ter a mente dividida". A ansiedade nos fragmenta, nos divide entre o que sabemos sobre o caráter de Deus e o que tememos sobre nosso futuro.

Imagine por um momento um pai amoroso observando seu filho de cinco anos preocupado porque não sabe como vai pagar as contas da casa. O pai sorriria com ternura, não por menosprezar a sinceridade da preocupação da criança, mas porque ele conhece recursos que a criança nem imagina. Ele tem planos, provisões e um amor que nunca falhará. Essa é exatamente nossa posição diante de Deus quando nos consumimos com ansiedade.

A alternativa que Paulo apresenta não é a negação, mas a transferência. "Em tudo, pela oração e pela súplica, com ações de graças, sejam as vossas petições conhecidas diante de Deus." Observe a progressão aqui: primeiro reconhecemos nossa necessidade (oração), depois especificamos nossos pedidos (súplica), e fazemos isso tudo envolvido em gratidão (ações de graças).

A gratidão em meio à ansiedade pode parecer contraditória, mas é exatamente isso que transforma nossa perspectiva. Quando escolhemos ser gratos mesmo antes de ver a resposta, estamos declarando nossa confiança no caráter de Deus, não apenas em Suas ações. Estamos dizendo: "Deus, mesmo que eu não entenda este momento, eu sei quem Tu és, e isso é suficiente."',
  'Identifique uma área da sua vida onde você tem tentado ser o "controlador geral". Como seria entregar especificamente essa área para Deus hoje?',
  'Pai celestial, reconheço que tenho carregado preocupações que são pesadas demais para mim. Hoje escolho trazê-las diante de Ti, não porque Tu não as conheces, mas porque preciso da Tua paz que excede meu entendimento. No nome de Jesus, amém.',
  'Toda vez que sentir ansiedade, pare e diga: "Deus, esta preocupação pertence a Ti agora."'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  2,
  'Foque no Que Realmente Importa',
  'Portanto, não vos inquieteis com o dia de amanhã, pois o amanhã cuidará de si mesmo. Basta a cada dia o seu mal.',
  'Mateus 6:34',
  'Jesus tinha uma maneira única de ir direto ao coração dos problemas humanos, e a ansiedade era um deles. No Sermão do Monte, falando para uma multidão de pessoas que enfrentavam incertezas econômicas, políticas e sociais sob o domínio romano, Ele apresentou um princípio revolucionário: a arte de viver um dia de cada vez.

A frase "não vos inquieteis" não é um comando casual ou superficial. É um imperativo que reconhece uma tendência humana fundamental: nossa propensão a viver mentalmente no futuro enquanto nossos corpos estão no presente. A ansiedade é, em grande parte, uma viagem mental para territórios que ainda não existem, onde nossa imaginação pinta cenários que na maioria das vezes nunca se concretizam.

Mark Twain uma vez disse: "Vivi muitas tragédias na minha vida, algumas das quais realmente aconteceram." Esta frase captura perfeitamente a natureza ilusória de muito do nosso sofrimento ansioso. Gastamos energia emocional hoje preocupando-nos com problemas hipotéticos de amanhã, roubando de nós mesmos a capacidade de experimentar a graça e a provisão de Deus que estão disponíveis agora.

Jesus não estava sendo insensível às preocupações legítimas quando disse essas palavras. Ele estava revelando um princípio espiritual profundo: Deus distribui Sua graça e força em porções diárias, não em estoques para toda a vida. Assim como o maná no deserto era fornecido dia a dia para os israelitas, a graça de Deus para enfrentar os desafios da vida vem em medidas diárias.

Quando tentamos viver o amanhã hoje, estamos tentando usar a graça de hoje para enfrentar os problemas de amanhã. É como tentar usar a passagem de trem de hoje para uma viagem que faremos na próxima semana. A graça de Deus para os problemas de amanhã virá amanhã, junto com os próprios problemas.',
  'Que situações futuras têm roubado sua paz no presente? Como você pode se concentrar completamente no que Deus tem para você hoje?',
  'Senhor Jesus, obrigado por me lembrar que Tua graça é suficiente para hoje. Ajuda-me a confiar que assim como Tu cuidaste de mim até agora, Tu continuarás cuidando.',
  'Pratique o "exercício dos 5 sentidos" quando se preocupar com o futuro: 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que prova.'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  3,
  'Deus é Seu Pastor',
  'O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.',
  'Salmo 23:1-2',
  'O Salmo 23 é, sem dúvida, um dos textos mais conhecidos e amados de toda a Escritura. Suas palavras têm trazido conforto a milhões de pessoas ao longo de milênios, desde leitos de hospital até campos de batalha, desde momentos de luto profundo até celebrações de grande alegria. Mas sua familiaridade pode, às vezes, obscurecer a profundidade radical de sua mensagem sobre ansiedade e confiança.

Davi, ao escrever estas palavras, não estava filosofando sobre conceitos abstratos. Ele havia passado anos de sua juventude cuidando de ovelhas nas colinas áridas ao redor de Belém. Ele conhecia intimamente a vulnerabilidade desses animais aparentemente indefesos e a responsabilidade absoluta que recaía sobre os ombros do pastor. Uma ovelha perdida significava uma busca incansável. Uma ovelha ferida significava cuidado pessoal até a recuperação completa. Uma ovelha ameaçada significava que o pastor arriscaria sua própria vida para protegê-la.

Quando Davi declara "O Senhor é o meu pastor", ele está fazendo uma das afirmações mais ousadas possíveis sobre a natureza de seu relacionamento com Deus. Ele está dizendo que o Criador do universo, Aquele que sustenta as estrelas em suas órbitas e conta cada grão de areia na praia, assumiu responsabilidade pessoal por cada detalhe de sua vida.

A frase "nada me faltará" não é uma promessa de riqueza material ou ausência de dificuldades. É uma declaração de confiança absoluta na provisão divina. Davi está dizendo que, independentemente das circunstâncias externas, suas necessidades mais profundas - segurança, direção, propósito, amor - serão sempre supridas pelo seu Pastor celestial.

As imagens que seguem são extraordinariamente consoladoras para uma mente ansiosa. "Verdes pastos" falam de provisão abundante e descanso restaurador. No clima árido do Oriente Médio, encontrar pastagens verdes era um tesouro raro e precioso. "Águas tranquilas" contrastam vividamente com as torrentes perigosas que poderiam afogar uma ovelha. O pastor conhece onde encontrar água segura e refrescante.

A palavra "mansamente" é particularmente significativa. Ovelhas são facilmente assustadas e propensas ao pânico. Um pastor sábio as guia com gentileza, nunca forçando ou apressando. Da mesma forma, Deus não nos arrasta através da vida; Ele nos guia com paciência infinita, respeitando nosso ritmo e nossas limitações.',
  'Em que áreas da sua vida você tem tentado ser seu próprio pastor? Como seria confiar completamente na liderança de Deus nessas áreas?',
  'Senhor, Tu és meu Pastor. Mesmo quando não entendo Teus caminhos, escolho confiar em Tua direção. Obrigado por me guiar a verdes pastos e águas tranquilas.',
  'Tire 5 minutos diários para sentar em silêncio e meditar na imagem de Deus como seu Pastor pessoal.'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  4,
  'Força na Fraqueza',
  'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel.',
  'Isaías 41:10',
  'As palavras de Isaías 41:10 foram originalmente dirigidas a uma nação em crise. Israel estava enfrentando o exílio, a dispersão e a incerteza sobre seu futuro como povo de Deus. Era um momento de medo coletivo e individual, quando as estruturas familiares de segurança haviam desmoronado e o futuro parecia sombrio e imprevisível.

É neste contexto de vulnerabilidade máxima que Deus pronuncia uma das mais poderosas declarações de segurança de toda a Escritura. Observe a estrutura desta promessa: ela começa com um comando ("não temas"), prossegue com uma razão ("porque eu sou contigo"), e termina com uma série de compromissos divinos específicos.

"Não temas" não é uma negação da realidade das ameaças que enfrentamos. É um convite para ver essas ameaças à luz de uma realidade maior: a presença constante e o poder ilimitado de Deus. O medo, em sua essência, é uma resposta a uma percepção de inadequação diante de uma ameaça. Quando Deus diz "não temas", Ele está oferecendo Sua própria adequação como substituto para nossa inadequação.

"Porque eu sou contigo" é mais do que proximidade física. É uma promessa de participação ativa em nossa experiência. Deus não é um observador distante de nossas lutas; Ele é um participante íntimo. Quando enfrentamos ansiedade, não estamos enfrentando sozinhos. O Deus que criou e sustenta o universo está conosco na trincheira de nossa experiência humana.

A sequência de promessas que se segue é progressiva e abrangente. "Eu te fortaleço" fala de capacitação interior - Deus fornecendo recursos espirituais e emocionais que excedem nossa capacidade natural. "Eu te ajudo" indica assistência ativa - Deus trabalhando conosco e através de nós para enfrentar os desafios que encontramos. "Eu te sustento" sugere suporte contínuo - Deus nos mantendo firmes quando nossas próprias forças falham.

A imagem da "destra fiel" é particularmente poderosa. Na cultura bíblica, a mão direita representava força, habilidade e autoridade. É a mão que segura a espada, a mão que abençoa, a mão que trabalha. Quando Deus promete nos sustentar com Sua destra fiel, Ele está prometendo aplicar todo o Seu poder e autoridade à nossa situação.

Uma das maiores ironias da experiência cristã é que nossa fraqueza frequentemente se torna o local onde a força de Deus é mais claramente demonstrada. Paulo descobriu isso em sua própria luta com o que ele chamou de "espinho na carne". A resposta de Deus a seus pedidos repetidos de alívio foi: "A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza" (2 Coríntios 12:9).',
  'Em que área da sua vida você mais precisa da força de Deus hoje? Como seria entregar sua fraqueza para que Ele demonstre Seu poder?',
  'Deus, confesso que me sinto fraco e ansioso. Preciso da Tua força para enfrentar este dia. Obrigado por Tua promessa de que posso ser forte em Ti.',
  'Memorize Isaías 41:10 e repita quando sentir medo ou inadequação.'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  5,
  'A Paz que Excede o Entendimento',
  'E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.',
  'Filipenses 4:7',
  'Esta é a promessa que segue imediatamente a instrução de Paulo sobre ansiedade em Filipenses 4:6. É a consequência natural de uma vida de oração ao invés de preocupação. Mas a paz que Paulo descreve aqui não é a ausência de problemas ou circunstâncias favoráveis. É algo muito mais profundo e sobrenatural.

A palavra grega para "paz" aqui é "eirene", que significa muito mais do que a simples ausência de conflito. Ela deriva da palavra hebraica "shalom", que representa completude, integridade, bem-estar holístico. É a paz que vem de saber que estamos alinhados com o propósito de Deus e protegidos por Seu amor.

"Que excede todo o entendimento" é uma frase crucial. Paulo está descrevendo uma paz que não faz sentido lógico dado as circunstâncias. É a paz que Jesus demonstrou dormindo durante uma tempestade no Mar da Galileia. É a paz que permitiu a Paulo e Silas cantarem hinos na prisão de Filipos. É uma paz que desafia explicação humana porque sua fonte é divina.

Esta paz não é passiva; ela é ativa. Paulo diz que ela "guardará" nossos corações e mentes. A palavra grega "phroureo" significa "fazer guarda" ou "proteger com uma guarnição militar". É a imagem de soldados montando guarda ao redor de uma cidade para protegê-la de ataques inimigos. A paz de Deus funciona como uma força protetiva ao redor de nossa vida emocional e mental.',
  'Como você pode cultivar a prática de buscar a paz de Deus ao invés de tentar criar sua própria paz através do controle das circunstâncias?',
  'Senhor, desejo experimentar Tua paz que excede todo entendimento. Que ela guarde meu coração e mente hoje, especialmente quando as circunstâncias não fazem sentido.',
  'Quando se sentir ansioso, respire profundamente e declare: "A paz de Deus está guardando meu coração agora."'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  6,
  'Lançando Toda Ansiedade',
  'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.',
  '1 Pedro 5:7',
  'Pedro escreve estas palavras a cristãos que enfrentavam perseguição severa. Eles tinham razões muito reais para ansiedade - suas vidas, famílias e meios de subsistência estavam em perigo constante. É neste contexto de ameaça genuína que Pedro oferece um dos mais práticos e poderosos antídotos contra a ansiedade.

A palavra "lançando" no grego é "epiripto", que significa literalmente "atirar sobre" ou "descarregar". É a imagem de alguém carregando um fardo pesado demais e finalmente encontrando alguém forte o suficiente para carregá-lo. O ato de lançar requer uma escolha deliberada e ativa - não é algo que acontece automaticamente.

"Toda a vossa ansiedade" é abrangente. Pedro não está sugerindo que devemos selecionar cuidadosamente quais preocupações são apropriadas para trazer a Deus. Ele está dizendo que todas elas - desde as mais triviais até as mais avassaladoras - são candidatas para transferência divina.

A razão que Pedro oferece é profundamente pessoal: "porque ele tem cuidado de vós". A palavra grega "melei" significa "ter interesse genuíno" ou "se importar profundamente". Não é uma preocupação casual ou distante, mas o cuidado íntimo de alguém que conhece cada detalhe de nossa situação e está genuinamente investido em nosso bem-estar.',
  'Quais ansiedades você tem tentado carregar sozinho? Como seria "lançar" especificamente essas preocupações sobre Deus hoje?',
  'Deus, hoje escolho lançar sobre Ti todas as minhas ansiedades. Obrigado porque Tu tens cuidado de mim e nada do que me preocupa é insignificante demais para Teu amor.',
  'Escreva suas preocupações em papel, ore sobre cada uma, e depois rasgue o papel como símbolo de entregá-las a Deus.'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  7,
  'Vivendo em Liberdade',
  'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei. Tomai sobre vós o meu jugo, e aprendei de mim, que sou manso e humilde de coração; e encontrareis descanso para as vossas almas.',
  'Mateus 11:28-29',
  'Estas palavras de Jesus representam um dos convites mais ternos e inclusivos de toda a Escritura. Elas são dirigidas não aos religiosos bem-sucedidos ou aos espiritualmente avançados, mas aos "cansados e oprimidos" - aqueles que estão no fim de suas forças, carregando fardos que são pesados demais para suas capacidades.

O convite de Jesus reconhece uma realidade fundamental da experiência humana: todos nós carregamos peso. Alguns carregam o peso da culpa, outros o peso da rejeição, outros ainda o peso da ansiedade sobre o futuro. Jesus não minimiza esses fardos ou sugere que eles são ilusórios. Em vez disso, Ele oferece uma troca: Seus fardos pelos nossos.

"Eu vos aliviarei" é uma promessa de alívio real e tangível. A palavra grega "anapauo" significa "dar descanso" ou "refrescar". É a mesma palavra usada para descrever o sábado - um tempo de cessação deliberada do trabalho e da preocupação.

O convite para "tomar Seu jugo" pode parecer contraditório - por que Jesus ofereceria alívio e depois mencionaria outro jugo? A resposta está na natureza do jugo de Cristo. Enquanto nossos fardos auto-impostos são pesados e destrutivos, o jugo de Cristo é "suave" e sua carga é "leve". É o jugo da parceria com Deus, onde dividimos o trabalho com Aquele que tem força infinita.

A promessa final - "encontrareis descanso para as vossas almas" - fala do tipo mais profundo de paz. Não é apenas alívio físico ou emocional, mas renovação espiritual. É o descanso que vem de saber que estamos onde devemos estar, fazendo o que devemos fazer, na companhia de Quem devemos estar.',
  'Como seria trocar completamente seus fardos de ansiedade pelo jugo suave de Cristo? Que mudanças práticas isso traria para sua vida diária?',
  'Jesus, venho a Ti cansado e sobrecarregado com ansiedade. Aceito Teu convite para descanso. Troco meus fardos pesados por Teu jugo suave. Ensina-me a viver na liberdade que Tu ofereces.',
  'Ao final de cada dia desta semana, dedique 10 minutos para conscientemente "entregar" todas as preocupações do dia a Jesus antes de dormir.'
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bible_studies_updated_at
BEFORE UPDATE ON public.bible_studies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bible_study_chapters_updated_at
BEFORE UPDATE ON public.bible_study_chapters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_study_progress_updated_at
BEFORE UPDATE ON public.user_study_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 