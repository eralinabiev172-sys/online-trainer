// === Глобальные переменные ===
let userData = {};
let currentQuestions = [];
let progressChart = null;

// === Показ страниц ===
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const targetPage = document.getElementById(id);
    if (targetPage) targetPage.classList.add("active");
}

// === Инициализация пользователя ===
function initUser() {
    userData = {
        height: Number(document.getElementById("heightInput").value) || 0,
        weight: Number(document.getElementById("weightInput").value) || 0,
        fat: Number(document.getElementById("fatInput").value) || 0,
        runSec: Number(document.getElementById("runInput").value) || 0,
        pushups: Number(document.getElementById("pushupsInput").value) || 0,
        plankMin: Number(document.getElementById("plankInput").value) || 0,
        sleep: Number(document.getElementById("sleepInput").value) || 0,
        phone: Number(document.getElementById("phoneInput").value) || 0,
        mathLevel: Number(document.getElementById("mathLevelInput").value) || 1,
        confidence: Number(document.getElementById("confidenceInput").value) || 5,
        charisma: Number(document.getElementById("charismaInput").value) || 5,
        reading: Number(document.getElementById("readingInput").value) || 0,

        // болезни
        curses: {
            back: document.getElementById("curseBackInput").checked,
            foot: document.getElementById("curseFootInput").checked,
            cough: document.getElementById("curseCoughInput").checked,
            heart: document.getElementById("curseHeartInput").checked,
            vision: document.getElementById("curseVisionInput").checked,
            asthma: document.getElementById("curseAsthmaInput").checked,
            stomach: document.getElementById("curseStomachInput").checked,
        },

        // недельная прокачка (очки опыта)
        weekly: {
            pushups: 0,
            plank: 0,
            run: 0,
            reading: 0,
            math: 0,
            confidence: 0
        }
    };

    updateStats();
    generateTasks();
    drawProgress();
    showPage('statsPage');
}

// === Расчет характеристик ===
function calculateStats() {
    const clamp = (v, min, max) => Math.max(min, Math.min(max, Math.round(v)));

    // Формулы расчета (можно настраивать баланс здесь)
    let strength = clamp((userData.pushups / 5) + (userData.weekly.pushups / 10), 1, 10);
    let agility = clamp(userData.runSec <= 13 ? 10 : (25 - userData.runSec) / 1.2, 1, 10);
    let endurance = clamp(userData.plankMin * 2 + (userData.weekly.plank / 5), 1, 10);
    let intellect = clamp(userData.mathLevel + (userData.weekly.math / 5), 1, 10);
    let confidence = clamp(userData.confidence + (userData.weekly.confidence / 3), 1, 10);
    let charisma = clamp(userData.charisma + (userData.reading / 20), 1, 10);

    return { strength, agility, endurance, intellect, confidence, charisma };
}

function updateStats() {
    let stats = calculateStats();
    for (let key in stats) {
        const el = document.getElementById(key);
        if (el) el.innerText = stats[key];
    }
}

// === Задания и рекомендации ===
function generateTasks() {
    const tasks = [];
    const recs = [];

    // Квесты на основе данных
    if (!userData.curses.back) tasks.push("Сделать 2 подхода отжиманий");
    if (userData.plankMin < 3) tasks.push("Продержаться в планке на 30 сек дольше");
    if (userData.mathLevel < 11) tasks.push("Решить тест по математике");
    if (userData.reading < 20) tasks.push("Прочитать 15 страниц любой книги");

    // Рекомендации по дебаффам (болезням)
    if (userData.curses.back) recs.push("⚠️ Внимание: Спина слабая. Только растяжка и йога.");
    if (userData.curses.heart) recs.push("⚠️ Кардио под запретом. Контролируй пульс.");
    if (userData.curses.vision) recs.push("👁 Делай гимнастику для глаз каждые 2 часа.");

    document.getElementById("tasks").innerHTML = tasks.map(t => `<li>🔹 ${t}</li>`).join("");
    document.getElementById("recommendations").innerHTML = recs.map(r => `<li>${r}</li>`).join("");
}

// === Прогресс (Радарная диаграмма) ===

function drawProgress() {
    let stats = calculateStats();
    let ctx = document.getElementById("progressChart").getContext("2d");

    if (progressChart) progressChart.destroy();

    progressChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["Сила", "Ловкость", "Выносливость", "Интеллект", "Уверенность", "Харизма"],
            datasets: [{
                label: "Твои навыки",
                data: [stats.strength, stats.agility, stats.endurance, stats.intellect, stats.confidence, stats.charisma],
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                pointBackgroundColor: "rgba(255, 99, 132, 1)",
            }]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    beginAtZero: true,
                    ticks: { stepSize: 2 }
                }
            }
        }
    });
}

// === Тестирование ===
const vocabularies = {
    english: {
        hello: "привет",
        world: "мир",
        book: "книга",
        school: "школа",
        water: "вода"
    }
};

function startTest() {
    const lang = document.getElementById("languageSelect").value;
    const testArea = document.getElementById("testArea");
    const questionsDiv = document.getElementById("questions");
    
    testArea.style.display = "block";
    questionsDiv.innerHTML = "";
    currentQuestions = [];

    // Математика (адаптивная сложность)
    for (let i = 0; i < 5; i++) {
        let a = Math.floor(Math.random() * 10 * userData.mathLevel) + 2;
        let b = Math.floor(Math.random() * 10 * userData.mathLevel) + 2;
        currentQuestions.push({ q: `${a} + ${b} = ?`, answer: a + b });
    }

    // Английский
    if (lang === "english") {
        for (let word in vocabularies.english) {
            currentQuestions.push({ q: `Переведи: ${word}`, answer: vocabularies.english[word] });
        }
    }

    currentQuestions.forEach((q, i) => {
        let div = document.createElement("div");
        div.className = "test-item";
        div.innerHTML = `<label>${q.q}</label><input type="text" id="ans${i}">`;
        questionsDiv.appendChild(div);
    });
}

function checkAnswers() {
    let score = 0;
    currentQuestions.forEach((q, i) => {
        let val = document.getElementById(`ans${i}`).value.trim().toLowerCase();
        if (val == String(q.answer).toLowerCase()) score++;
    });

    // Бонус к интеллекту при хорошем результате
    if (score > currentQuestions.length / 2) {
        userData.weekly.math += 2;
        updateStats();
        drawProgress();
    }

    document.getElementById("result").innerText = `Результат: ${score} из ${currentQuestions.length}. Опыт начислен!`;
}

// === Бизнес ===
function evaluateBusiness() {
    let input = document.getElementById("sellInput").value.toLowerCase();
    let res = document.getElementById("businessResult");
    
    const triggers = ["выгода", "скидка", "решение", "поможет", "вам"];
    let success = triggers.some(t => input.includes(t));

    if (success) {
        res.innerHTML = "<span style='color:green'>ИИ: Достойный аргумент! Харизма +1</span>";
        userData.weekly.confidence += 1;
        updateStats();
        drawProgress();
    } else {
        res.innerHTML = "<span style='color:orange'>ИИ: Это просто описание. Попробуй продать выгоду.</span>";
    }
}

// Инициализация
window.onload = function() {
    // Автозаполнение селекта
    let sel = document.getElementById("languageSelect");
    if (sel) {
        sel.innerHTML = '<option value="math">Только Математика</option>';
        for (let key in vocabularies) {
            let opt = document.createElement("option");
            opt.value = key;
            opt.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            sel.appendChild(opt);
        }
    }
};