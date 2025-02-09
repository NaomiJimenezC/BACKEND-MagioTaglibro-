// Server.js
const express = require('express');
const authRoutes = require('./Routes/Auth');
const entriesRoutes = require('./Routes/Entries');
const friendshipRoutes = require('./Routes/Friendships')
const contactRoutes = require('./Routes/Contact')
const userRoutes = require('./Routes/UserEditor')
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const {SitemapStream, streamToPromise} = require("sitemap");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rutas
app.use('/api/entries',entriesRoutes);
app.use('/api/users', authRoutes);
app.use('/api/friendship',friendshipRoutes)
app.use('/api/contact',contactRoutes)
app.use('/api/userEditor',userRoutes)

app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = 'https://front-magiotaglibro.onrender.com';
  const today = new Date().toISOString();

  const sitemapStream = new SitemapStream({ hostname: baseUrl });

  const urls = [
    { url: '/', lastmod: today, priority: 1.0 },
    { url: '/contact', lastmod: today, priority: 0.8 },
    { url: '/user', lastmod: today, priority: 0.8 },
    { url: '/diaries', lastmod: today, priority: 0.6 },
  ];

  // Enviar el sitemap como XML
  try {
    urls.forEach(url => sitemapStream.write(url));
    sitemapStream.end();

    const sitemapXML = await streamToPromise(sitemapStream);
    res.header('Content-Type', 'application/xml');
    res.send(sitemapXML);
  } catch (err) {
    console.error("Error generating sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
});

app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'robots.txt'));
});


// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
