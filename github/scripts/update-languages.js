const fs = require("fs");
const fetch = require("node-fetch");

const username = "verner-haimbili"; // Replace with your GitHub username

async function fetchLanguages() {
    const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100`
    );
    const repositories = await response.json();
    const languages = {};

    for (const repo of repositories) {
        const repoLanguagesResponse = await fetch(repo.languages_url);
        const repoLanguages = await repoLanguagesResponse.json();

        for (const [language, bytes] of Object.entries(repoLanguages)) {
            if (languages[language]) {
                languages[language] += bytes;
            } else {
                languages[language] = bytes;
            }
        }
    }

    return languages;
}

async function updateLanguages() {
    try {
        const languages = await fetchLanguages();
        const sortedLanguages = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .map(([language]) => language);

        const content = `{"languages": ${JSON.stringify(sortedLanguages)}}`;
        fs.writeFileSync(".github/languages.json", content);

        console.log("Languages updated successfully.");
    } catch (error) {
        console.error("Error updating languages:", error.message);
        process.exit(1);
    }
}

updateLanguages();