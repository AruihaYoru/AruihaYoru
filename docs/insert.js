const statsAndCommentHTML = `

    <section class="stats-section">
        閲覧数: <span id="view-count">...</span> | 
        <button id="like-btn" class="minimal-btn">
            ❤ <span id="like-count">0</span>
        </button>
    </section>

    <section class="comment-section">
        <h3>ポスト</h3>
        <div id="comment-list" class="comment-list"></div>
        
		<a href="/promise.html" class="promise-link">ガイドライン。お約束ごと。（これリンクだよ！）</a>
        <div class="comment-form">
            <div class="input-group">
                <input type="text" id="comment-name" placeholder="お名前（空欄でも可）" maxlength="50">
            </div>
            <div class="input-group">
                <textarea id="comment-input" placeholder="綴る" maxlength="10000">お早う。</textarea>
            </div>
            <button id="comment-btn" class="minimal-btn">投函する</button>
        </div>
    </section>
`;

document.addEventListener('DOMContentLoaded', () => {
    const target = document.querySelector('.afterword') 
                || document.querySelector('main') 
                || document.querySelector('.container');

    if (target) {
        target.insertAdjacentHTML('afterend', statsAndCommentHTML);
    }
});