// script.js – Final version (mobile-friendly HSP quiz logic)

let currentLang = 'en';
let quizData = null;

// Show/hide loading indicator
function showLoading(show) {
    const intro = document.getElementById('intro');
    if (show) {
        if (!document.getElementById('loading-msg')) {
            intro.innerHTML += '<p id="loading-msg" style="color: var(--accent); font-weight: 600; margin-top: 1rem; text-align: center;">جاري تحميل الأسئلة... 🌸<br>Loading questions...</p>';
        }
    } else {
        const msg = document.getElementById('loading-msg');
        if (msg) msg.remove();
    }
}

// Load questions from JSON
async function loadData() {
    showLoading(true);
    try {
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error(`Failed to load questions.json – status ${response.status}`);
        }
        quizData = await response.json();
        showLoading(false);
        renderQuiz(currentLang);  // show English by default after loading
    } catch (err) {
        console.error('Error loading questions.json:', err);
        showLoading(false);
        document.getElementById('intro').innerHTML +=
            '<p style="color: red; margin-top: 1.5rem; text-align: center; font-weight: bold;">حدث خطأ أثناء تحميل البيانات.<br>Please check if questions.json exists and you are using a local server (not file://).</p>';
    }
}

// Render quiz for selected language
function renderQuiz(lang) {
    if (!quizData || !quizData[lang]) {
        console.warn('No quiz data for language:', lang);
        return;
    }

    const d = quizData[lang];

    // Update texts
    document.getElementById('title').innerHTML = d.title;
    document.getElementById('intro').innerHTML = d.intro;
    document.getElementById('submitBtn').textContent = d.btnSubmit;

    // Set language attributes (important for RTL)
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    // Clear and rebuild form
    const form = document.getElementById('quizForm');
    form.innerHTML = '';

    d.questions.forEach((q, i) => {
        const div = document.createElement('div');
        div.className = 'question';
        div.innerHTML = `
            <p>${i + 1}. ${q}</p>
            <label><input type="radio" name="q${i}" value="2" required> ${d.options[0]}</label>
            <label><input type="radio" name="q${i}" value="1"> ${d.options[1]}</label>
            <label><input type="radio" name="q${i}" value="0"> ${d.options[2]}</label>
        `;
        form.appendChild(div);
    });

    // Reset UI state
    document.getElementById('progressBar').style.width = '0%';
    form.reset();
    document.getElementById('result').classList.add('hidden');
    document.getElementById('submitBtn').textContent = d.btnSubmit;
    document.getElementById('submitBtn').onclick = null; // reset restart handler
}

// Language toggle handlers
document.getElementById('btnEn')?.addEventListener('click', () => {
    if (currentLang === 'en') return;
    currentLang = 'en';
    document.getElementById('btnEn').classList.add('active');
    document.getElementById('btnAr').classList.remove('active');
    if (quizData) renderQuiz('en');
});

document.getElementById('btnAr')?.addEventListener('click', () => {
    if (currentLang === 'ar') return;
    currentLang = 'ar';
    document.getElementById('btnAr').classList.add('active');
    document.getElementById('btnEn').classList.remove('active');
    if (quizData) renderQuiz('ar');
});

// Progress bar update
document.getElementById('quizForm')?.addEventListener('change', () => {
    if (!quizData) return;
    const answered = document.querySelectorAll('input[type="radio"]:checked').length;
    const total = quizData[currentLang]?.questions?.length || 27;
    const percent = (answered / total) * 100;
    document.getElementById('progressBar').style.width = `${percent}%`;
});

// Submit / calculate result
document.getElementById('submitBtn')?.addEventListener('click', function handleSubmit(e) {
    e.preventDefault();

    if (!quizData) {
        alert('الأسئلة لم تُحمّل بعد. انتظر قليلاً أو أعد تحميل الصفحة.\nQuestions not loaded yet. Please wait or refresh.');
        return;
    }

    let score = 0;
    const formData = new FormData(document.getElementById('quizForm'));
    for (let val of formData.values()) {
        score += parseInt(val) || 0;
    }

    const d = quizData[currentLang];
    let message = '';
    let className = '';

    if (score >= 32) {
        // High sensitivity
        message = `
            <strong>${score} / 54</strong> 🌸<br><br>
            ${currentLang === 'en' ?
                "Hey Mary, you are likely a Highly Sensitive Person (HSP) — and that's such a beautiful gift! 💖" :
                "يا ماري، أنتِ على الأرجح شخصية حساسة جداً (HSP) — وهذه هدية رائعة جدًا! 💖"}<br><br>
            ${d.nervousSystem}<br><br>
            ${currentLang === 'en' ?
                "You feel deeply, notice subtle beauty, and have a very kind heart. Enjoy rest, calm places, and people who understand your gentleness." :
                "تشعرين بعمق، تلاحظين الجمال الدقيق، ولديكِ قلب طيب جدًا. استمتعي بالراحة والأماكن الهادئة والناس الذين يفهمون لطافتكِ."}
        `;
        className = 'score-high';
    } else if (score >= 20) {
        // Medium
        message = `
            <strong>${score} / 54</strong> ✨<br><br>
            ${currentLang === 'en' ?
                "You have some lovely sensitive traits — not full HSP, but more depth than average." :
                "لديكِ بعض السمات الحساسة الجميلة — لستِ HSP كاملة، لكنكِ أعمق من المتوسط."}<br><br>
            ${currentLang === 'en' ?
                "Rest moments and calm spaces will feel especially good for you. You're wonderfully balanced! 🌷" :
                "لحظات الراحة والمساحات الهادئة ستكون مفيدة جدًا لكِ. أنتِ متوازنة بشكل رائع! 🌷"}
        `;
        className = 'score-medium';
    } else {
        // Low
        message = `
            <strong>${score} / 54</strong> 🌼<br><br>
            ${currentLang === 'en' ?
                "You are probably not highly sensitive in the classic HSP sense — your nervous system processes the world a bit differently (and that's perfect too!)." :
                "أنتِ لستِ حساسة جداً بالمعنى الكلاسيكي — جهازك العصبي يتعامل مع العالم بطريقة مختلفة قليلاً (وهذا مثالي أيضاً!)."}<br><br>
            ${currentLang === 'en' ?
                "Everyone's magic is unique — yours might be bold and steady. 💕" :
                "سحر كل شخص فريد — سحركِ ربما يكون قوياً وثابتاً. 💕"}
        `;
        className = 'score-low';
    }

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class="${className}">${message}</div>`;
    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Change button to restart
    this.textContent = d.btnRestart;
    this.onclick = () => location.reload();
});

// Start loading data when page is ready
window.addEventListener('load', loadData);