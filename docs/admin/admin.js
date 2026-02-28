import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { 
    getFirestore, collection, query, orderBy, onSnapshot, 
    doc, getDoc, updateDoc, deleteDoc, where 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

console.log("[SYSTEM] 管理パネル起動中...");

// ログイン処理
document.getElementById('login-btn').onclick = () => {
    signInWithPopup(auth, provider).catch(err => console.error("[AUTH] ログイン失敗:", err));
};

// 認証監視
onAuthStateChanged(auth, async (user) => {
    const adminMain = document.getElementById('admin-main');
    const loginBtn = document.getElementById('login-btn');
    const authStatus = document.getElementById('auth-status');

    if (user) {
        try {
            const adminSnap = await getDoc(doc(db, "admin_config", "master"));
            if (adminSnap.exists() && adminSnap.data().uid === user.uid) {
                console.log("[AUTH] 管理者として承認されました");
                if (loginBtn) loginBtn.style.display = 'none';
                if (adminMain) adminMain.style.display = 'block';
                if (authStatus) authStatus.textContent = `管理者: ${user.email}`;
                
                loadAllStats();
                loadAllComments();
            } else {
                throw new Error("UID未登録");
            }
        } catch (e) {
            console.error("[AUTH] 権限なし:", e);
            document.body.innerHTML = `<div class="container"><h2>Access Denied</h2><p>権限がありません。</p></div>`;
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (adminMain) adminMain.style.display = 'none';
    }
});

// --- 統計管理 ---
function loadAllStats() {
    const list = document.getElementById('stats-list');
    onSnapshot(collection(db, "stats"), (snapshot) => {
        list.innerHTML = "";
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>${docSnap.id}</code></td>
                <td><input type="number" id="v-${docSnap.id}" value="${data.views || 0}" style="width:70px;"></td>
                <td><input type="number" id="l-${docSnap.id}" value="${data.likes || 0}" style="width:70px;"></td>
                <td><button class="save-stats-btn" data-id="${docSnap.id}">保存</button></td>
            `;
            tr.querySelector('.save-stats-btn').onclick = (e) => updateStats(e, docSnap.id);
            list.appendChild(tr);
        });
    });
}

async function updateStats(e, id) {
    const btn = e.target;
    const v = parseInt(document.getElementById(`v-${id}`).value);
    const l = parseInt(document.getElementById(`l-${id}`).value);
    try {
        await updateDoc(doc(db, "stats", id), { views: v, likes: l });
        btn.textContent = "✅OK";
        setTimeout(() => btn.textContent = "保存", 1500);
    } catch (err) { alert("更新失敗"); }
}

// --- お便り管理 ---
let currentFilter = null;

function loadAllComments() {
    const listEl = document.getElementById('admin-comment-list');
    listEl.innerHTML = `
        <div style="margin-bottom:20px; display:flex; gap:10px;">
            <input type="text" id="filter-input" placeholder="ページIDで絞り込み (home 等)..." style="flex:1;">
            <button id="filter-btn" class="minimal-btn">絞り込み</button>
            <button id="reset-btn" class="minimal-btn">解除</button>
        </div>
        <div id="comment-items-container"></div>
    `;

    document.getElementById('filter-btn').onclick = () => {
        currentFilter = document.getElementById('filter-input').value.trim() || null;
        renderComments();
    };
    document.getElementById('reset-btn').onclick = () => {
        document.getElementById('filter-input').value = "";
        currentFilter = null;
        renderComments();
    };

    renderComments();
}

function renderComments() {
    const container = document.getElementById('comment-items-container');
    let q = query(collection(db, "comments"), orderBy("createdAt", "desc"));
    if (currentFilter) {
        q = query(collection(db, "comments"), where("page", "==", currentFilter), orderBy("createdAt", "desc"));
    }

    onSnapshot(q, (snapshot) => {
        // 編集中はリセットしない（フォーカスがある時）
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        container.innerHTML = snapshot.empty ? "<p>該当するお便りはありません。</p>" : "";
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            const div = document.createElement('div');
            div.className = 'comment-item card';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:10px;">
                    <span class="badge">${data.page}</span>
                    <span style="color:#aaa;">${data.createdAt?.toDate().toLocaleString() || ''}</span>
                </div>
                <label style="font-size:0.7rem; color:#888;">お名前:</label>
                <input type="text" id="name-${id}" value="${data.name || ''}" style="width:100%; margin-bottom:8px;">
                <label style="font-size:0.7rem; color:#888;">本文:</label>
                <textarea id="text-${id}" class="admin-textarea">${data.text || ''}</textarea>
                <div style="text-align:right; margin-top:10px;">
                    <button class="upd-btn" style="background:#f0f7ff;">修正保存</button>
                    <button class="del-btn" style="color:#d9534f; border-color:#d9534f; margin-left:8px;">削除</button>
                </div>
            `;

            // 修正ボタン
            div.querySelector('.upd-btn').onclick = (e) => handleUpdate(e, id);
            // 削除ボタン（2段階認証式）
            const dBtn = div.querySelector('.del-btn');
            dBtn.onclick = () => {
                if (dBtn.textContent === "削除") {
                    dBtn.textContent = "本当に消す？";
                    dBtn.style.background = "#d9534f";
                    dBtn.style.color = "#fff";
                    setTimeout(() => { 
                        dBtn.textContent = "削除"; 
                        dBtn.style.background = ""; 
                        dBtn.style.color = "#d9534f";
                    }, 3000);
                } else {
                    handleDelete(id);
                }
            };

            container.appendChild(div);
        });
    });
}

async function handleUpdate(e, id) {
    const btn = e.target;
    const name = document.getElementById(`name-${id}`).value;
    const text = document.getElementById(`text-${id}`).value;
    btn.disabled = true;
    btn.textContent = "送信中...";
    try {
        await updateDoc(doc(db, "comments", id), { name, text });
        btn.textContent = "✅完了";
        setTimeout(() => { btn.disabled = false; btn.textContent = "修正保存"; }, 1500);
    } catch (err) { 
        alert("保存失敗");
        btn.disabled = false;
        btn.textContent = "修正保存";
    }
}

async function handleDelete(id) {
    try {
        await deleteDoc(doc(db, "comments", id));
        console.log("[SYSTEM] 削除完了:", id);
    } catch (err) { alert("削除失敗"); }
}