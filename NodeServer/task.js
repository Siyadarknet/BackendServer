// // Simple Express server to serve articles.json as API
// const express = require('express');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Endpoint to get all articles
// app.get('/api/articles', (req, res) => {
//   const articlesPath = path.join(__dirname, 'articles.json');
//   fs.readFile(articlesPath, 'utf8', (err, data) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to read articles data.' });
//     }
//     try {
//       const articles = JSON.parse(data);
//       res.json(articles);
//     } catch (parseErr) {
//       res.status(500).json({ error: 'Failed to parse articles data.' });
//     }
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// // New endpoint to get articles from article.txt as structured JSON
// app.get('/api/articles-from-txt', (req, res) => {
//   const txtPath = path.join(__dirname, 'article.txt');
//   fs.readFile(txtPath, 'utf8', (err, data) => {
//     if (err) {
//       return res.status(500).json({ error: 'Failed to read article.txt.' });
//     }
//     try {
//       // Split articles by pattern: article_X =
//       const articles = [];
//       const regex = /article_(\d+)\s*=\s*([^\n]+)\n([\s\S]*?)(?=(?:\narticle_\d+\s*=)|$)/g;
//       let match;
//       while ((match = regex.exec(data)) !== null) {
//         const article_no = match[1];
//         const title = match[2].trim();
//         const body = match[3].trim();
//         // Optionally, extract headers (first line of body before a question or colon)
//         let header = '';
//         const headerMatch = body.match(/^(.*?)(\n|$)/);
//         if (headerMatch) header = headerMatch[1].trim();
//         articles.push({
//           article_no,
//           title,
//           header,
//           body
//         });
//       }
//       res.json(articles);
//     } catch (parseErr) {
//       res.status(500).json({ error: 'Failed to parse article.txt.' });
//     }
//   });
// });
