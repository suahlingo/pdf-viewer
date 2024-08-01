import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PDFExtract } from 'pdf.js-extract';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5000;


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, decodeURIComponent(file.originalname));
  },
});

const upload = multer({ storage });

app.use('/uploads', express.static(uploadDir));


app.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = path.join(uploadDir, req.file.originalname);
  try {
    const data = await extractTableFromPDF(filePath);
    console.log('Parsed Data:', JSON.stringify(data, null, 2));
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).send('PDF 추출에 실패했습니다.');
  }
});


async function extractTableFromPDF(filePath) {
  const pdfExtract = new PDFExtract();
  const options = { firstPage: 6, lastPage: 8 }; // Only extract specific pages
  const data = await pdfExtract.extract(filePath, options);
  return parseTableFromContent(data.pages);
}

function parseTableFromContent(pages) {
  const parsedData = [];
  let inTable = false;
  const startTableText = '신·구조문대비표';
  const columnHeaders = ['현행', '개  정  안'];
  let currentRow = ['', ''];

  pages.forEach((page) => {
    page.content.forEach((item) => {
      const text = item.str.trim();

      // 페이지 번호 삭제
      if (text.match(/^- \d+ -$/)) { 
        return;
      }

      if (text.includes(startTableText)) {
        inTable = true;
        return;
      }

      if (inTable) {
        const xPosition = item.transform ? item.transform[4] : 0; 

        if (text.includes('-------------------------')) {
          if (currentRow[0] || currentRow[1]) {
            parsedData.push([...currentRow]); 
            currentRow = ['', '']; 
          }
          return;
        }

       
        if (item.transform) {
          if (xPosition < 300) {
            currentRow[0] += text + ' '; // Append to first column
          } else {
            currentRow[1] += text + ' '; // Append to second column
          }
        } else {
          // Fallback to decide based on current content length
          if (currentRow[0].length <= currentRow[1].length) {
            currentRow[0] += text + ' ';
          } else {
            currentRow[1] += text + ' ';
          }
        }
      }
    });
  });

 
  if (currentRow[0] || currentRow[1]) {
    parsedData.push([...currentRow]);
  }


  const cleanedData = parsedData.filter(row => row[0] || row[1]).map(row => [
    row[0].replace(/\s+/g, ' ').trim(),
    row[1].replace(/\s+/g, ' ').trim()
  ]);

  // Add column headers at the beginning
  cleanedData.unshift(columnHeaders);

  return cleanedData;
}
// function parseTableFromContent(pages) {
//   const parsedData = [];
//   let inTable = false;
//   const startTableText = '신·구조문대비표';
//   const columnHeaders = ['현행', '개  정  안'];
//   let currentRow = ['', ''];

//   pages.forEach((page) => {
//     page.content.forEach((item) => {
//       const text = item.str.trim();

//       if (text.includes(startTableText)) {
//         inTable = true;
//         return;
//       }

//       if (inTable) {
      
//         const xPosition = item.transform ? item.transform[4] : 0;

      
//         if (text.includes('-------------------------')) {
//           if (currentRow[0] || currentRow[1]) {
//             parsedData.push([...currentRow]);
//             currentRow = ['', ''];
//           }
//           return;
//         }

        
//         if (item.transform) {
//           if (xPosition < 300) {
//             currentRow[0] += text + ' ';
//           } else {
//             currentRow[1] += text + ' ';
//           }
//         } else {
          
//           if (currentRow[0].length <= currentRow[1].length) {
//             currentRow[0] += text + ' ';
//           } else {
//             currentRow[1] += text + ' ';
//           }
//         }
//       }
//     });
//   });

  
//   if (currentRow[0] || currentRow[1]) {
//     parsedData.push([...currentRow]);
//   }

//   const cleanedData = parsedData.filter(row => row[0] || row[1]).map(row => [
//     row[0].replace(/\s+/g, ' ').trim(),
//     row[1].replace(/\s+/g, ' ').trim()
//   ]);


//   cleanedData.unshift(columnHeaders);

//   return cleanedData;
// }


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


