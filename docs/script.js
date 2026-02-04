import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, increment, setDoc, getDoc, onSnapshot, collection, addDoc, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
	apiKey: "AIzaSyAm0YLG5YbB8sV-Wn2s3KG0KVWP-GJuVAs",
	authDomain: "aruihayoruself-esteem.firebaseapp.com",
	projectId: "aruihayoruself-esteem",
	storageBucket: "aruihayoruself-esteem.firebasestorage.app",
	messagingSenderId: "810585062123",
	appId: "1:810585062123:web:b0e7a5afe2ceb885e99cae",
	measurementId: "G-T4190601V6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const pathParts = window.location.pathname
    .split('/')
    .filter(part => part && part !== 'AruihaYoru' && !part.includes('.html'));

const pageId = pathParts[0] || 'home';

console.log("Current Page ID:", pageId);
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await handleViewCount(user.uid);
        setupStatsRealtime();
        setupCommentsRealtime();
    } else {
        signInAnonymously(auth).catch(err => console.error("Auth Error:", err));
    }
});

async function handleViewCount(uid) {
    const visitorRef = doc(db, "pageViews", pageId, "visitors", uid);
    const visitorSnap = await getDoc(visitorRef);
    if (!visitorSnap.exists()) {
        await setDoc(visitorRef, { timestamp: new Date() });
        await setDoc(doc(db, "stats", pageId), { views: increment(1) }, { merge: true });
    }
}

function setupStatsRealtime() {
    onSnapshot(doc(db, "stats", pageId), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            if(document.getElementById('view-count')) document.getElementById('view-count').textContent = data.views || 0;
            if(document.getElementById('like-count')) document.getElementById('like-count').textContent = data.likes || 0;
        }
    });

    const likeBtn = document.getElementById('like-btn');
    if (likeBtn) {
        likeBtn.onclick = async () => {
            await setDoc(doc(db, "stats", pageId), { likes: increment(1) }, { merge: true });
        };
    }
}

async function setupCommentsRealtime() {
    const q = query(collection(db, "comments"), where("page", "==", pageId), orderBy("createdAt", "desc"), limit(10));
    
    onSnapshot(q, (snapshot) => {
        const listEl = document.getElementById('comment-list');
        if (!listEl) return;
        listEl.innerHTML = "";
        snapshot.forEach((doc) => {
            const data = doc.data();
            const div = document.createElement('div');
            div.className = 'comment-item';
            
            const name = data.name || "名無しさん";
            div.innerHTML = `
                <div class="comment-meta"><strong>${name}</strong></div>
                <div class="comment-text">${data.text.replace(/\n/g, '<br>')}</div>
            `;
            listEl.appendChild(div);
        });
    });

    const btn = document.getElementById('comment-btn');
    const input = document.getElementById('comment-input');
    const nameInput = document.getElementById('comment-name');

	if (btn) {
        btn.onclick = async () => {
            const nameValue = nameInput.value.trim();
            const inputValue = input.value.trim();

            // 1. 本文があれば本文、なければ名前、どちらもなければ半角スペース
            const postText = inputValue || nameValue || " ";
            // 2. 名前が空なら「名無しさん」
            const postName = nameValue || "名無しさん";

            btn.disabled = true;
            try {
                await addDoc(collection(db, "comments"), {
                    page: pageId,
                    name: postName,
                    text: postText,
                    createdAt: new Date()
                });
                input.value = "";
                nameInput.value = "";
            } catch (e) {
                console.error("投稿エラー:", e);
            }
            btn.disabled = false;
        };
    }
}