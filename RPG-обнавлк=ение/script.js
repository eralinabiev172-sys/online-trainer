// === Глобальные переменные ===
let userData = {};
let currentQuestions = [];
let progressChart = null;

// === Показ страниц ===
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// === Инициализация пользователя ===
function initUser() {
  userData = {
    height: +document.getElementById("heightInput").value,
    weight: +document.getElementById("weightInput").value,
    fat: +document.getElementById("fatInput").value,
    runSec: +document.getElementById("runInput").value,
    pushups: +document.getElementById("pushupsInput").value,
    plankMin: +document.getElementById("plankInput").value,
    sleep: +document.getElementById("sleepInput").value,
    phone: +document.getElementById("phoneInput").value,
    mathLevel: +document.getElementById("mathLevelInput").value,
    confidence: +document.getElementById("confidenceInput").value,
    charisma: +document.getElementById("charismaInput").value,
    reading: +document.getElementById("readingInput").value,

    // болезни
    curseBack: document.getElementById("curseBackInput").checked,
    curseFoot: document.getElementById("curseFootInput").checked,
    curseCough: document.getElementById("curseCoughInput").checked,
    curseHeart: document.getElementById("curseHeartInput").checked,
    curseVision: document.getElementById("curseVisionInput").checked,
    curseAsthma: document.getElementById("curseAsthmaInput").checked,
    curseStomach: document.getElementById("curseStomachInput").checked,

    // недельная прокачка
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

  let strength = clamp(userData.pushups / 20 * 10 + Math.floor(userData.weekly.pushups / 30), 1, 10);
  let agility = clamp(userData.runSec < 15 ? 10 : 5 + Math.floor(userData.weekly.run / 10), 1, 10);
  let endurance = clamp(userData.plankMin / 5 * 10 + Math.floor(userData.weekly.plank / 5), 1, 10);
  let intellect = clamp(userData.mathLevel / 11 * 10 + Math.floor(userData.weekly.math / 5), 1, 10);
  let confidence = clamp(userData.confidence + Math.floor(userData.weekly.confidence / 3), 1, 10);
  let charisma = clamp(userData.charisma + Math.floor(userData.weekly.reading / 10), 1, 10);

  return { strength, agility, endurance, intellect, confidence, charisma };
}

function updateStats() {
  let stats = calculateStats();
  for (let key in stats) {
    document.getElementById(key).innerText = stats[key];
  }
}

// === Задания и рекомендации ===
function generateTasks() {
  const tasks = [];
  const recs = [];

  if (!userData.curseBack) tasks.push("Сделать 10 отжиманий");
  if (!userData.curseBack) tasks.push("Планка 2 минуты");
  if (userData.mathLevel < 6) tasks.push("Решить 5 задач по математике");
  if (userData.reading < 10) tasks.push("Прочитать 10 страниц книги");
  if (userData.confidence < 5) tasks.push("Поздороваться с 3 незнакомыми людьми");

  if (userData.curseBack) recs.push("Не поднимать тяжести, делать лёгкую зарядку");
  if (userData.curseFoot) recs.push("Избегать долгой ходьбы, отдыхать");
  if (userData.curseCough) recs.push("Больше отдыхать, пить тёплое");
  if (userData.curseHeart) recs.push("Не делать тяжёлое кардио, лучше лёгкая йога");
  if (userData.curseVision) recs.push("Гимнастика для глаз, отдых от экрана");
  if (userData.curseAsthma) recs.push("Избегать бега на холоде, полезно плавание");
  if (userData.curseStomach) recs.push("Не переедать, лёгкие прогулки и растяжка");

  document.getElementById("tasks").innerHTML = tasks.map(t => `<li>${t}</li>`).join("");
  document.getElementById("recommendations").innerHTML = recs.map(r => `<li>${r}</li>`).join("");
}

// === Прогресс ===
function drawProgress() {
  let stats = calculateStats();
  let ctx = document.getElementById("progressChart").getContext("2d");

  if (progressChart) progressChart.destroy();

  progressChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Сила", "Ловкость", "Выносливость", "Интеллект", "Уверенность", "Харизма"],
      datasets: [{
        label: "Характеристики",
        data: Object.values(stats),
        fill: true,
        backgroundColor: "rgba(0,123,255,0.2)",
        borderColor: "rgba(0,123,255,1)"
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// === Тестирование (4 класс + англо-русский) ===
const vocabularies = {
  english: {
    hello: "привет",
    world: "мир",
    book: "книга",
    school: "школа",
    water: "вода",
    food: "еда",
    friend: "друг",
    family: "семья",
    love: "любовь",
    day: "день"
  }
};

function startTest() {
  const lang = document.getElementById("languageSelect").value;
  document.getElementById("testArea").style.display = "block";
  document.getElementById("questions").innerHTML = "";

  let mathQ = [];
  for (let i = 0; i < 10; i++) {
    let a = Math.floor(Math.random() * 10 * (userData.mathLevel || 1)) + 1;
    let b = Math.floor(Math.random() * 10 * (userData.mathLevel || 1)) + 1;
    let type = ["+", "-", "*", "/"][Math.floor(Math.random() * 4)];
    let qText, ans;
    if (type === "+") { qText = `${a}+${b}=?`; ans = a + b; }
    else if (type === "-") { qText = `${a}-${b}=?`; ans = a - b; }
    else if (type === "*") { qText = `${a}*${b}=?`; ans = a * b; }
    else { qText = `${a* b}/${b}=?`; ans = a; } // деление нацело
    mathQ.push({ q: qText, answer: ans });
  }

  let vocabQ = [];
  if (lang === "english") {
    for (let key in vocabularies.english) {
      vocabQ.push({ q: `Переведи на русский: ${key}`, answer: vocabularies.english[key] });
    }
  }

  currentQuestions = [...mathQ, ...vocabQ].slice(0, 20);

  currentQuestions.forEach((q, i) => {
    let div = document.createElement("div");
    div.innerHTML = `<p>${i + 1}. ${q.q}</p><input type="text" id="ans${i}">`;
    document.getElementById("questions").appendChild(div);
  });
}

function checkAnswers() {
  let score = 0;
  currentQuestions.forEach((q, i) => {
    let val = document.getElementById(`ans${i}`).value.trim().toLowerCase();
    if (val == String(q.answer).toLowerCase()) score++;
  });
  document.getElementById("result").innerText = `Результат: ${score}/${currentQuestions.length}`;
}

// === Бизнес ===
function evaluateBusiness() {
  let input = document.getElementById("sellInput").value.toLowerCase();
  let res = document.getElementById("businessResult");
  if (input.includes("нужен") || input.includes("почему") || input.includes("лучший")) {
    res.innerText = "ИИ: Отлично, убедил! Твоя харизма +1";
  } else {
    res.innerText = "ИИ: Слабовато, попробуй объяснить выгоду.";
  }
}

// === Инициализация языков ===
window.onload = function() {
  let sel = document.getElementById("languageSelect");
  for (let key in vocabularies) {
    let opt = document.createElement("option");
    opt.value = key;
    opt.textContent = key;
    sel.appendChild(opt);
  }
};
