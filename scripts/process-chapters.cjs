const fs = require('fs');
const path = require('path');

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
  console.time('StudiesPageLoad');
  splitChaptersByStudy();
  console.timeEnd('StudiesPageLoad');
} 