async function loadWords() {
    try {
        const response = await fetch('./word.csv');
        const csvText = await response.text();

        const rows = csvText.trim().split('\n').slice(1);
        const wordList = document.getElementById('word-list');

        rows.forEach(row => {
            const [term, definition] = row.split('","').map(item => item.replace(/"/g, ''));

            if (term && definition) {
                const card = document.createElement('div');
                card.className = 'word-card';
                card.innerHTML = `
                    <dt class="word-term">${term}</dt>
                    <dd class="word-definition">${definition}</dd>
                `;
                wordList.appendChild(card);
            }
        });
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
    }
}

loadWords();