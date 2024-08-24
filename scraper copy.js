const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const PORT = 3000;

// Serve the initial HTML page
app.get('/', (req, res) => {
    res.send(`
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>Web Scraping</title>
            <style>
                body { font-family: Arial, sans-serif; }
                #result { margin-top: 20px; }
            </style>
            <script>
                async function startScraping() {
                    document.getElementById('status').innerText = 'Scraping in progress...';
                    try {
                        const response = await fetch('/scrape');
                        const data = await response.json();
                       
                        // Display the results
                        document.getElementById('startTime').innerText = 'Start Time: ' + data.startTime;
                        document.getElementById('endTime').innerText = 'End Time: ' + data.endTime;
                        document.getElementById('scrapedData').innerText = 'Data Extracted: ' + data.data;
                    } catch (error) {
                        document.getElementById('status').innerText = 'Error during scraping: ' + error;
                    }
                }
            </script>
        </head>
        <body>
            <h1>Web Scraping</h1>
            <button onclick="startScraping()">Start Scraping</button>
            <p id="status"></p>
            <div id="result">
                <p id="startTime"></p>
                <p id="endTime"></p>
                <p id="scrapedData"></p>
            </div>
        </body>
        </html>
    `);
});

// Scraping route
app.get('/scrape', async (req, res) => {
    const startTime = new Date().toISOString();

    // Launch a new browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const url = 'https://www.scamadviser.com/check-website/icbroker.io';

    // Open the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the specific element
    await page.waitForSelector('.trustscore-rating span', { timeout: 10000 });

    // Extract the content of the span
    const score = await page.$eval('.trustscore-rating span', el => el.textContent);

    await browser.close();

    const endTime = new Date().toISOString();

    // Send the results back as JSON
    res.json({
        startTime,
        endTime,
        data: score || 'Data not found'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});