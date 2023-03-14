const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));



const GITHUB_ACCESS_TOKEN = "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"
const GITHUB_API_URL = 'https://api.github.com';

app.get('/commit_history', async (req, res) => {
    const url = `${GITHUB_API_URL}/repos/ensured/punycode/commits?per_page=1`;

    try {
        const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
            'User-Agent': 'My GitHub API Client',
        },
        });

        const commitData = response.data[0];
        const commitInfo = {
        message: commitData.commit.message,
        author: commitData.commit.author.name,
        timestamp: commitData.commit.author.date,
        };

        res.send(commitInfo);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting GitHub commit data');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

