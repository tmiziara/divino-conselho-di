const fs = require('fs');
const path = require('path');

// Função para ler arquivo CSV
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : '';
      });
      data.push(row);
    }
  }
  
  return data;
}

// Função para processar versículos do CSV
function processVersiculos(csvData) {
  return csvData.map(verse => ({
    id: parseInt(verse.id),
    livro: verse.livro,
    capitulo: parseInt(verse.capitulo),
    versiculo: parseInt(verse.versiculo),
    texto: verse.texto,
    versao: verse.versao
  }));
}

// Função para processar estudos bíblicos do CSV
function processBibleStudies(csvData) {
  return csvData.map(study => ({
    id: study.id,
    title: study.title,
    description: study.description,
    cover_image: study.cover_image,
    total_chapters: parseInt(study.total_chapters),
    is_active: study.is_active === 'true',
    created_at: study.created_at,
    updated_at: study.updated_at
  }));
}

// Função para processar capítulos dos estudos do CSV
function processBibleStudyChapters(csvData) {
  return csvData.map(chapter => ({
    id: chapter.id,
    study_id: chapter.study_id,
    chapter_number: parseInt(chapter.chapter_number),
    title: chapter.title,
    main_verse: chapter.main_verse,
    main_verse_reference: chapter.main_verse_reference,
    reflective_reading: chapter.reflective_reading,
    reflection_question: chapter.reflection_question,
    chapter_prayer: chapter.chapter_prayer,
    practical_application: chapter.practical_application,
    created_at: chapter.created_at,
    updated_at: chapter.updated_at
  }));
}

// Função principal
async function processLocalData() {
  try {
    console.log('Processando dados locais...');
    
    // Ler arquivos CSV
    const versiculosCSV = fs.readFileSync(path.join(__dirname, '../supabase/versiculos_rows.csv'), 'utf8');
    const bibleStudiesCSV = fs.readFileSync(path.join(__dirname, '../supabase/bible_studies_rows.csv'), 'utf8');
    const bibleStudyChaptersCSV = fs.readFileSync(path.join(__dirname, '../supabase/bible_study_chapters_rows.csv'), 'utf8');
    
    // Processar dados
    const versiculosData = parseCSV(versiculosCSV);
    const bibleStudiesData = parseCSV(bibleStudiesCSV);
    const bibleStudyChaptersData = parseCSV(bibleStudyChaptersCSV);
    
    // Processar versículos
    const versiculos = processVersiculos(versiculosData);
    
    // Processar estudos bíblicos
    const bibleStudies = processBibleStudies(bibleStudiesData);
    
    // Processar capítulos dos estudos
    const bibleStudyChapters = processBibleStudyChapters(bibleStudyChaptersData);
    
    // Ler Bíblia NVI
    const nviBible = JSON.parse(fs.readFileSync(path.join(__dirname, '../supabase/nvi.json'), 'utf8'));
    
    // Criar diretório se não existir
    const outputDir = path.join(__dirname, '../public/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Salvar arquivos JSON
    fs.writeFileSync(path.join(outputDir, 'versiculos.json'), JSON.stringify(versiculos, null, 2));
    fs.writeFileSync(path.join(outputDir, 'bible_studies.json'), JSON.stringify(bibleStudies, null, 2));
    fs.writeFileSync(path.join(outputDir, 'bible_study_chapters.json'), JSON.stringify(bibleStudyChapters, null, 2));
    fs.writeFileSync(path.join(outputDir, 'nvi.json'), JSON.stringify(nviBible, null, 2));
    
    console.log('✅ Dados processados com sucesso!');
    console.log(`📊 Versículos: ${versiculos.length}`);
    console.log(`📚 Estudos: ${bibleStudies.length}`);
    console.log(`📖 Capítulos: ${bibleStudyChapters.length}`);
    console.log(`📖 Livros da Bíblia: ${nviBible.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao processar dados:', error);
  }
}

// Executar script
processLocalData();

// Novo arquivo: scripts/process-chapters.cjs
const chaptersPath = path.join(__dirname, '../public/data/bible_study_chapters.json');
const outputDir = path.join(__dirname, '../public/data/');

function splitChaptersByStudy() {
  if (!fs.existsSync(chaptersPath)) {
    console.error('Arquivo bible_study_chapters.json não encontrado!');
    process.exit(1);
  }
  const chapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf-8'));
  const byStudy = {};
  chapters.forEach(chapter => {
    if (!byStudy[chapter.study_id]) byStudy[chapter.study_id] = [];
    byStudy[chapter.study_id].push(chapter);
  });
  Object.entries(byStudy).forEach(([studyId, chapters]) => {
    const outFile = path.join(outputDir, `chapters_${studyId}.json`);
    fs.writeFileSync(outFile, JSON.stringify(chapters, null, 2), 'utf-8');
    console.log(`Gerado: ${outFile}`);
  });
  console.log('Divisão concluída!');
}

if (require.main === module) {
  splitChaptersByStudy();
} 