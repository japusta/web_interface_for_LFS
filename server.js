const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;
app.use(express.static('public'));

// Функция для рекурсивного списка директорий с ограничением глубины
async function listDirRecursive(dirPath, depth = 0, maxDepth = 2) {
  if (depth > maxDepth) {
    return null; // Остановить рекурсию, если достигнута максимальная глубина
  }
  
  let result = { path: dirPath, directories: [], files: [] };
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (let entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const dirResult = await listDirRecursive(fullPath, depth + 1, maxDepth);
      if (dirResult) { // Добавляем директорию, только если она не превысила максимальную глубину
        result.directories.push(dirResult);
      }
    } else if (entry.isFile()) {
      result.files.push(entry.name);
    }
  }

  return result;
}

app.get('/filesystem/*', async (req, res) => {
  const reqPath = req.params[0];
  const fullPath = path.resolve('/', reqPath);

  try {
    const contents = await listDirRecursive(fullPath, 0, 2); // Ограничиваем глубину рекурсии, например, до 2
    res.json(contents);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error reading directory');
  }
});

app.listen(port, () => {
  console.log(`Filesystem API server listening at http://localhost:${port}`);
});
