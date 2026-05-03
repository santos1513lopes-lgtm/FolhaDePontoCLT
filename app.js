import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ COLE A SUA CHAVE AQUI ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyCs-v8G50VdrPmaoeroyPQ3CZQGhggDpvQ",
  authDomain: "folhadeponto-7cb37.firebaseapp.com",
  projectId: "folhadeponto-7cb37",
  storageBucket: "folhadeponto-7cb37.firebasestorage.app",
  messagingSenderId: "178753574962",
  appId: "1:178753574962:web:451ec8989ac935aa8f842b"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentMode = 'week';
let appData = {}; 

// ======= AUTENTICAÇÃO =======
window.handleLogin = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        document.getElementById('login-error').innerText = "Erro: Verifique e-mail e senha.";
    }
};

window.handleLogout = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        initApp();
    } else {
        currentUser = null;
        document.getElementById('login-screen').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
    }
});

function initApp() {
    window.initTheme();
    const now = new Date();
    document.getElementById('month-input').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNo = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    document.getElementById('week-input').value = `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;

    window.loadEmployeesList(); 
    window.renderTable();
}

window.initTheme = () => {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('theme-icon').innerText = saved === 'dark' ? '☀️' : '🌙';
};

window.toggleTheme = () => {
    const curr = document.documentElement.getAttribute('data-theme');
    const newTheme = curr === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.getElementById('theme-icon').innerText = newTheme === 'dark' ? '☀️' : '🌙';
};

window.setMode = (mode) => {
    currentMode = mode;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${mode}`).classList.add('active');

    document.getElementById('view-config').style.display = mode === 'config' ? 'block' : 'none';
    document.getElementById('view-ponto').style.display = mode === 'config' ? 'none' : 'block';

    if(mode === 'week') {
        document.getElementById('week-control').style.display = 'flex';
        document.getElementById('month-control').style.display = 'none';
        document.getElementById('base-hours').value = 44;
        window.renderTable();
    } else if (mode === 'month') {
        document.getElementById('week-control').style.display = 'none';
        document.getElementById('month-control').style.display = 'flex';
        document.getElementById('base-hours').value = 220;
        window.renderTable();
    }
};

window.addEmployee = async () => {
    const name = document.getElementById('new-employee-name').value.trim();
    if(!name) return;
    
    const empRef = doc(db, "empresas", currentUser.uid, "funcionarios", name);
    await setDoc(empRef, { nome: name, criadoEm: new Date() }, { merge: true });
    
    const empresaRef = doc(db, "empresas", currentUser.uid);
    const docSnap = await getDoc(empresaRef);
    let lista = docSnap.exists() && docSnap.data().listaNomes ? docSnap.data().listaNomes : [];
    if(!lista.includes(name)) {
        lista.push(name);
        await setDoc(empresaRef, { listaNomes: lista }, { merge: true });
    }
    
    document.getElementById('config-msg').innerText = `${name} cadastrado com sucesso!`;
    document.getElementById('new-employee-name').value = '';
    window.loadEmployeesList();
};

window.loadEmployeesList = async () => {
    const empresaRef = doc(db, "empresas", currentUser.uid);
    const docSnap = await getDoc(empresaRef);
    
    const select = document.getElementById('employee-select');
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Selecione um funcionário --</option>';
    
    if (docSnap.exists() && docSnap.data().listaNomes) {
        docSnap.data().listaNomes.forEach(nome => {
            const opt = document.createElement('option');
            opt.value = nome; opt.innerText = nome;
            select.appendChild(opt);
        });
    }
    select.value = currentVal;
};

window.loadEmployeeData = async () => {
    const employeeName = document.getElementById('employee-select').value;
    if(!employeeName) {
        appData = {};
        window.renderTable();
        return;
    }
    const docRef = doc(db, "empresas", currentUser.uid, "funcionarios", employeeName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().horas) appData = docSnap.data().horas;
    else appData = {};
    window.renderTable();
};

window.saveData = async (dateStr, field, value) => {
    const employeeName = document.getElementById('employee-select').value;
    if(!employeeName) {
        alert("Por favor, selecione um funcionário primeiro!");
        window.renderTable(); 
        return;
    }

    if (!appData[dateStr]) appData[dateStr] = { ent: '', sai1: '', ret2: '', sai2: '', feriado: false };
    if (field === 'feriado') appData[dateStr].feriado = value;
    else appData[dateStr][field] = value;

    window.renderTable();

    const docRef = doc(db, "empresas", currentUser.uid, "funcionarios", employeeName);
    await setDoc(docRef, { horas: appData }, { merge: true });
};

window.getDatesToRender = () => {
    let dates = [];
    if (currentMode === 'week') {
        const weekVal = document.getElementById('week-input').value; 
        if (!weekVal) return [];
        const [y, w] = weekVal.split('-W').map(Number);
        const simple = new Date(y, 0, 1 + (w - 1) * 7);
        const ISOweekStart = new Date(simple);
        const dow = simple.getDay();
        ISOweekStart.setDate(simple.getDate() - (dow === 0 ? 6 : dow - 1));
        for (let i = 0; i < 7; i++) {
            const cur = new Date(ISOweekStart); cur.setDate(ISOweekStart.getDate() + i);
            dates.push(cur.toISOString().split('T')[0]);
        }
    } else {
        const [y, m] = document.getElementById('month-input').value.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        for (let i = 1; i <= lastDay; i++) dates.push(`${y}-${String(m).padStart(2,'0')}-${String(i).padStart(2,'0')}`);
    }
    return dates;
};

window.renderTable = () => {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    const dates = window.getDatesToRender();
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    dates.forEach(dateStr => {
        const [y, m, d] = dateStr.split('-');
        const dateObj = new Date(y, m-1, d);
        const diaNome = diasSemana[dateObj.getDay()];
        const dayData = appData[dateStr] || { ent: '', sai1: '', ret2: '', sai2: '', feriado: false };
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${diaNome}</strong><br><small>${d}/${m}</small></td>
            <td><input type="time" value="${dayData.ent}" onchange="window.saveData('${dateStr}', 'ent', this.value)"></td>
            <td><input type="time" value="${dayData.sai1}" onchange="window.saveData('${dateStr}', 'sai1', this.value)"></td>
            <td><input type="time" value="${dayData.ret2}" onchange="window.saveData('${dateStr}', 'ret2', this.value)"></td>
            <td><input type="time" value="${dayData.sai2}" onchange="window.saveData('${dateStr}', 'sai2', this.value)"></td>
            <td><label class="cb-container"><input type="checkbox" ${dayData.feriado ? 'checked' : ''} onchange="window.saveData('${dateStr}', 'feriado', this.checked)"></label></td>
            <td id="total-${dateStr}" style="font-weight: bold; font-size: 0.9rem;">00:00</td>
        `;
        tbody.appendChild(tr);
        window.calcDailyTotal(dateStr, dayData);
    });
    window.updateSummary();
};

window.calcDailyTotal = (dateStr, data) => {
    // Detecta se é domingo pela data
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(y, m-1, d);
    const isDomingo = dateObj.getDay() === 0;

    const toM = (t) => { if(!t) return 0; const [h,m]=t.split(':').map(Number); return h*60+m; };
    let m1 = toM(data.ent), m2 = toM(data.sai1), m3 = toM(data.ret2), m4 = toM(data.sai2);
    let workedMins = 0;
    if(m2 > m1) workedMins += (m2 - m1);
    if(m4 > m3) workedMins += (m4 - m3);

    let finalMins = workedMins;
    let isAbono = false;

    // Se marcou feriado mas NÃO trabalhou -> Abono (Ganha as horas sem trabalhar)
    if (data.feriado && workedMins === 0) {
        finalMins = toM(document.getElementById('jornada-diaria').value || '08:00');
        isAbono = true;
    }

    const format = (m) => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');
    const el = document.getElementById(`total-${dateStr}`);
    
    if(el) {
        let innerHTML = format(finalMins);
        if(isAbono) innerHTML += `<span style="color: var(--warning); display:block; font-size: 0.75rem;">(Abonado)</span>`;
        // Se trabalhou no Feriado OU no Domingo, marca como 100%
        else if((data.feriado || isDomingo) && workedMins > 0) innerHTML += `<span style="color: var(--info); display:block; font-size: 0.75rem;">(100%)</span>`;
        el.innerHTML = innerHTML;
    }
    
    return { total: finalMins, worked: workedMins, isFeriado: data.feriado, isDomingo: isDomingo, isAbono: isAbono };
};

window.updateSummary = () => {
    const dates = window.getDatesToRender();
    let totalMins = 0;
    let horas100Mins = 0;

    dates.forEach(d => {
        const result = window.calcDailyTotal(d, appData[d] || {});
        totalMins += result.total;
        
        // Se trabalhou num Domingo ou Feriado (e não foi abono), vai pro painel de 100%
        if ((result.isFeriado || result.isDomingo) && !result.isAbono && result.worked > 0) {
            horas100Mins += result.worked;
        }
    });
    
    const format = (m) => (m < 0 ? '-' : '') + String(Math.floor(Math.abs(m)/60)).padStart(2,'0') + ':' + String(Math.abs(m)%60).padStart(2,'0');
    document.getElementById('total-trabalhado').innerText = format(totalMins);
    document.getElementById('horas-100').innerText = format(horas100Mins);
    
    const base = (parseFloat(document.getElementById('base-hours').value) || 0) * 60;
    const saldo = totalMins - base;
    const saldoEl = document.getElementById('saldo-final');
    saldoEl.innerText = format(saldo);
    saldoEl.className = 'value ' + (saldo >= 0 ? 'positive' : 'negative');
};

// ======= EXPORTAR, IMPORTAR E LIMPAR =======
window.clearData = async () => {
    const employeeName = document.getElementById('employee-select').value;
    if(!employeeName) return alert("Selecione um funcionário.");
    
    if(confirm('Isso apagará TODOS os dados deste funcionário da nuvem. Deseja continuar?')) {
        appData = {};
        window.renderTable();
        const docRef = doc(db, "empresas", currentUser.uid, "funcionarios", employeeName);
        await setDoc(docRef, { horas: {} }, { merge: true });
    }
};

window.exportCSV = () => {
    const employeeName = document.getElementById('employee-select').value || 'Geral';
    const dates = Object.keys(appData).sort();
    let csv = "Data,Entrada,Saida_Almoco,Retorno_Almoco,Saida_Final,Feriado\n";
    dates.forEach(d => {
        const v = appData[d];
        const isFeriado = v.feriado ? 'Sim' : 'Nao';
        csv += `${d},${v.ent},${v.sai1},${v.ret2},${v.sai2},${isFeriado}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob); 
    a.download = `ponto_${employeeName}.csv`; 
    a.click();
};

window.handleCSVImport = async (input) => {
    const employeeName = document.getElementById('employee-select').value;
    if(!employeeName) {
        alert("Selecione um funcionário antes de importar!");
        input.value = ''; return;
    }
    
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const rows = e.target.result.split('\n').slice(1);
        rows.forEach(row => {
            const cols = row.split(',');
            if(cols.length >= 5 && cols[0].trim().length > 0) {
                const date = cols[0].trim();
                const isFeriado = cols[5] && cols[5].trim().toLowerCase() === 'sim';
                appData[date] = { 
                    ent: cols[1].trim(), sai1: cols[2].trim(), 
                    ret2: cols[3].trim(), sai2: cols[4].trim(), feriado: isFeriado
                };
            }
        });
        window.renderTable();
        const docRef = doc(db, "empresas", currentUser.uid, "funcionarios", employeeName);
        await setDoc(docRef, { horas: appData }, { merge: true });
        alert('Dados importados com sucesso para a Nuvem!');
        input.value = ''; 
    };
    reader.readAsText(file);
};