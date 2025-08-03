const express = require('express');
const puppeteer = require('puppeteer');

browser = await puppeteer.launch({
  headless: true,
  executablePath: puppeteer.executablePath(), // 👈 this points to bundled Chromium
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});


const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/subscriber-count', async (req, res) => {
  const { url } = req.query;

  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  let browser;
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await page.waitForSelector('#profile_show_subscriber_count', { timeout: 10000 });
    const count = await page.$eval('#profile_show_subscriber_count', el => el.textContent.trim());

    res.json({ url, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to extract subscriber count', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ API server running at http://localhost:${PORT}`);
});
