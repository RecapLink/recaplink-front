'use strict';

const FB_API = 'https://api.recaplink.tn/api';
const FB_KEY = 'recaplink_fb_done';

let fbLang = 'fr';
let fbStep = 0;
const TOTAL_STEPS = 6;

const fbData = {
  language: 'fr',
  satisfaction: null,
  profile: null,
  features: [],
  wouldUse: null,
  heardFrom: null,
  comment: '',
};

// ─── Translations ─────────────────────────────────────────────────────────────
const FB_I18N = {
  ar: {
    dir: 'rtl',
    prompt_title: 'رأيك يهمّنا!',
    prompt_text: 'هل تودّ مشاركتنا رأيك حول مشروع RecapLink؟',
    prompt_yes: 'نعم، بكل سرور',
    prompt_no: 'ليس الآن',
    form_title: 'شاركنا رأيك',
    prev: 'السابق',
    next: 'التالي',
    submit: 'إرسال',
    thankyou_title: 'شكراً جزيلاً!',
    thankyou_text: 'تم تسجيل ملاحظاتك بنجاح. ستساعدنا في تحسين RecapLink.',
    close: 'إغلاق',
    step_of: (n, t) => `السؤال ${n} من ${t}`,
    required_hint: 'يرجى الإجابة على هذا السؤال قبل المتابعة.',
    questions: [
      {
        key: 'satisfaction', type: 'stars',
        label: 'ما مدى رضاك عن مفهوم RecapLink؟',
      },
      {
        key: 'profile', type: 'radio',
        label: 'ما الذي يصف ملفك الشخصي بشكل أفضل؟',
        options: [
          { v: 'collector', l: 'جامع النفايات' },
          { v: 'recycler', l: 'مُعيد التدوير' },
          { v: 'business', l: 'شركة / مؤسسة' },
          { v: 'individual', l: 'فرد' },
          { v: 'other', l: 'أخرى' },
        ],
      },
      {
        key: 'features', type: 'multi',
        label: 'ما الميزات التي تهمك أكثر؟ (اختر كل ما ينطبق)',
        options: [
          { v: 'collection', l: 'إدارة الجمع' },
          { v: 'matching', l: 'التواصل مع مُعيدي التدوير' },
          { v: 'chatbot', l: 'روبوت المحادثة الذكي' },
          { v: 'dashboard', l: 'لوحة التحكم' },
          { v: 'badges', l: 'نظام الشارات' },
        ],
      },
      {
        key: 'wouldUse', type: 'radio',
        label: 'هل ستستخدم RecapLink عند إطلاقها؟',
        options: [
          { v: 'definitely_yes', l: 'بالتأكيد نعم' },
          { v: 'probably_yes', l: 'على الأرجح نعم' },
          { v: 'unsure', l: 'غير متأكد' },
          { v: 'probably_no', l: 'على الأرجح لا' },
          { v: 'definitely_no', l: 'بالتأكيد لا' },
        ],
      },
      {
        key: 'heardFrom', type: 'radio',
        label: 'كيف سمعت عن RecapLink؟',
        options: [
          { v: 'social_media', l: 'وسائل التواصل الاجتماعي' },
          { v: 'event', l: 'حدث / مؤتمر' },
          { v: 'colleague', l: 'زميل / صديق' },
          { v: 'internet', l: 'بحث على الإنترنت' },
          { v: 'other', l: 'أخرى' },
        ],
      },
      {
        key: 'comment', type: 'textarea',
        label: 'هل لديك تعليقات أو اقتراحات إضافية؟',
        placeholder: 'اكتب أفكارك هنا... (اختياري)',
      },
    ],
  },

  fr: {
    dir: 'ltr',
    prompt_title: 'Votre avis compte !',
    prompt_text: 'Souhaitez-vous nous donner votre avis sur RecapLink ?',
    prompt_yes: 'Oui, avec plaisir',
    prompt_no: 'Pas maintenant',
    form_title: 'Partagez votre avis',
    prev: 'Précédent',
    next: 'Suivant',
    submit: 'Envoyer',
    thankyou_title: 'Merci !',
    thankyou_text: 'Votre avis a bien été enregistré. Il nous aidera à améliorer RecapLink.',
    close: 'Fermer',
    step_of: (n, t) => `Question ${n} sur ${t}`,
    required_hint: 'Veuillez répondre avant de continuer.',
    questions: [
      {
        key: 'satisfaction', type: 'stars',
        label: 'Dans quelle mesure êtes-vous satisfait(e) du concept RecapLink ?',
      },
      {
        key: 'profile', type: 'radio',
        label: 'Quel profil vous correspond le mieux ?',
        options: [
          { v: 'collector', l: 'Collecteur' },
          { v: 'recycler', l: 'Recycleur' },
          { v: 'business', l: 'Entreprise / Société' },
          { v: 'individual', l: 'Particulier' },
          { v: 'other', l: 'Autre' },
        ],
      },
      {
        key: 'features', type: 'multi',
        label: 'Quelles fonctionnalités vous intéressent le plus ? (sélectionnez tout ce qui s\'applique)',
        options: [
          { v: 'collection', l: 'Gestion des collectes' },
          { v: 'matching', l: 'Mise en relation recycleurs' },
          { v: 'chatbot', l: 'Chatbot IA' },
          { v: 'dashboard', l: 'Tableau de bord' },
          { v: 'badges', l: 'Système de badges' },
        ],
      },
      {
        key: 'wouldUse', type: 'radio',
        label: 'Utiliseriez-vous RecapLink lors de son lancement ?',
        options: [
          { v: 'definitely_yes', l: 'Oui, certainement' },
          { v: 'probably_yes', l: 'Probablement oui' },
          { v: 'unsure', l: 'Pas certain(e)' },
          { v: 'probably_no', l: 'Probablement non' },
          { v: 'definitely_no', l: 'Non, pas vraiment' },
        ],
      },
      {
        key: 'heardFrom', type: 'radio',
        label: 'Comment avez-vous entendu parler de RecapLink ?',
        options: [
          { v: 'social_media', l: 'Réseaux sociaux' },
          { v: 'event', l: 'Événement / Conférence' },
          { v: 'colleague', l: 'Collègue / Ami(e)' },
          { v: 'internet', l: 'Recherche internet' },
          { v: 'other', l: 'Autre' },
        ],
      },
      {
        key: 'comment', type: 'textarea',
        label: 'Des commentaires ou suggestions supplémentaires ?',
        placeholder: 'Écrivez vos pensées ici... (optionnel)',
      },
    ],
  },

  wo: {
    dir: 'ltr',
    prompt_title: 'Sa xalaat dafa am solo!',
    prompt_text: 'Danga bëgg yónnee sa xalaat ci RecapLink?',
    prompt_yes: 'Waaw, bëgga lool',
    prompt_no: 'Deedéet, soo naaw',
    form_title: 'Yónnee sa xalaat',
    prev: 'Ginaaw',
    next: 'Kanam',
    submit: 'Yónnee',
    thankyou_title: 'Jërëjëf!',
    thankyou_text: 'Sa xalaat dafa dëkk. Dina nu jëf ci kanam RecapLink bi.',
    close: 'Tëj',
    step_of: (n, t) => `Laaj ${n} ci ${t}`,
    required_hint: 'Tontu laaj bii ci kanam.',
    questions: [
      {
        key: 'satisfaction', type: 'stars',
        label: 'Naka nga xool projet RecapLink bi?',
      },
      {
        key: 'profile', type: 'radio',
        label: 'Ana sa rôle ci recycler plastique bi?',
        options: [
          { v: 'collector', l: 'Collecteur' },
          { v: 'recycler', l: 'Recycleur' },
          { v: 'business', l: 'Entreprise' },
          { v: 'individual', l: 'Boroom kër' },
          { v: 'other', l: 'Yeneen' },
        ],
      },
      {
        key: 'features', type: 'multi',
        label: 'Lan la ëpp bëgg ci application bi?',
        options: [
          { v: 'collection', l: 'Gérer collecte yi' },
          { v: 'matching', l: 'Yéeg recycleur yi' },
          { v: 'chatbot', l: 'Chatbot IA' },
          { v: 'dashboard', l: 'Tableau de bord' },
          { v: 'badges', l: 'Badge yi' },
        ],
      },
      {
        key: 'wouldUse', type: 'radio',
        label: 'Danga soxor jëfandikoo RecapLink?',
        options: [
          { v: 'definitely_yes', l: 'Waaw, dëgg' },
          { v: 'probably_yes', l: 'Waaw, ci kanam' },
          { v: 'unsure', l: 'Xamuma' },
          { v: 'probably_no', l: 'Pexe deedéet' },
          { v: 'definitely_no', l: 'Déedéet, dëgg' },
        ],
      },
      {
        key: 'heardFrom', type: 'radio',
        label: 'Naka ngay xam RecapLink?',
        options: [
          { v: 'social_media', l: 'Réseaux sociaux' },
          { v: 'event', l: 'Événement' },
          { v: 'colleague', l: 'Xarit / Collègue' },
          { v: 'internet', l: 'Búkki ci internet' },
          { v: 'other', l: 'Yeneen' },
        ],
      },
      {
        key: 'comment', type: 'textarea',
        label: 'Am nga yeneen xalaat walla sàggal?',
        placeholder: 'Bind sa xalaat fi... (du dëgëre)',
      },
    ],
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────
function tr() { return FB_I18N[fbLang]; }
function qDef() { return tr().questions[fbStep]; }

function openOverlay(id) {
  document.getElementById(id).classList.add('fb-active');
  document.body.style.overflow = 'hidden';
}
function closeOverlay(id) {
  document.getElementById(id).classList.remove('fb-active');
  document.body.style.overflow = '';
}

// ─── Prompt ───────────────────────────────────────────────────────────────────
function showFeedbackPrompt() {
  if (localStorage.getItem(FB_KEY)) return;
  syncPromptText();
  openOverlay('fb-prompt-overlay');
}

function syncPromptText() {
  const t = tr();
  document.getElementById('fb-prompt-title').textContent = t.prompt_title;
  document.getElementById('fb-prompt-text').textContent = t.prompt_text;
  document.getElementById('fb-prompt-yes').textContent = t.prompt_yes;
  document.getElementById('fb-prompt-no').textContent = t.prompt_no;
}

function declinePrompt() {
  closeOverlay('fb-prompt-overlay');
  localStorage.setItem(FB_KEY, 'declined');
}

function acceptPrompt() {
  closeOverlay('fb-prompt-overlay');
  fbStep = 0;
  fbData.satisfaction = null;
  fbData.profile = null;
  fbData.features = [];
  fbData.wouldUse = null;
  fbData.heardFrom = null;
  fbData.comment = '';
  openFeedbackForm();
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function openFeedbackForm() {
  renderForm();
  openOverlay('fb-form-overlay');
}

function closeFeedbackForm() {
  closeOverlay('fb-form-overlay');
}

function switchLang(lang) {
  fbLang = lang;
  fbData.language = lang;
  document.querySelectorAll('.fb-lang-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === lang)
  );
  const formEl = document.getElementById('fb-form');
  formEl.setAttribute('dir', tr().dir);
  syncFormTitle();
  renderStep();
  updateNav();
}

function renderForm() {
  const formEl = document.getElementById('fb-form');
  formEl.setAttribute('dir', tr().dir);
  document.querySelectorAll('.fb-lang-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === fbLang)
  );
  syncFormTitle();
  renderStep();
  updateNav();
  // restore nav visibility
  const nav = document.getElementById('fb-form-nav');
  const prog = document.getElementById('fb-progress-wrap');
  if (nav) nav.style.display = '';
  if (prog) prog.style.display = '';
}

function syncFormTitle() {
  document.getElementById('fb-form-title').textContent = tr().form_title;
}

function renderStep() {
  const body = document.getElementById('fb-step-body');
  const q = qDef();

  document.getElementById('fb-step-label').textContent =
    tr().step_of(fbStep + 1, TOTAL_STEPS);
  document.getElementById('fb-progress-fill').style.width =
    (((fbStep + 1) / TOTAL_STEPS) * 100) + '%';

  let html = `<div class="fb-question">
    <p class="fb-q-label">${q.label}</p>`;

  if (q.type === 'stars') {
    const emojiMap = ['', '😞', '😕', '🙂', '😊', '🤩'];
    html += `<div class="fb-stars">`;
    for (let i = 1; i <= 5; i++) {
      const active = fbData.satisfaction >= i ? 'active' : '';
      html += `<button class="fb-star ${active}" data-val="${i}"
        onclick="setStar(${i})">★</button>`;
    }
    html += `</div>`;
    if (fbData.satisfaction) {
      html += `<p class="fb-star-emoji">${emojiMap[fbData.satisfaction]}</p>`;
    }

  } else if (q.type === 'radio') {
    html += `<div class="fb-chips">`;
    q.options.forEach(opt => {
      const active = fbData[q.key] === opt.v ? 'active' : '';
      html += `<button class="fb-chip ${active}" data-val="${opt.v}"
        onclick="setRadio('${q.key}','${opt.v}')">${opt.l}</button>`;
    });
    html += `</div>`;

  } else if (q.type === 'multi') {
    html += `<div class="fb-chips fb-multi-chips">`;
    q.options.forEach(opt => {
      const active = fbData.features.includes(opt.v) ? 'active' : '';
      html += `<button class="fb-chip ${active}" data-val="${opt.v}"
        onclick="toggleFeature('${opt.v}')">${opt.l}</button>`;
    });
    html += `</div>`;

  } else if (q.type === 'textarea') {
    html += `<textarea class="fb-textarea" id="fb-textarea"
      placeholder="${q.placeholder}"
      oninput="fbData.comment=this.value">${fbData.comment}</textarea>`;
  }

  html += `<p class="fb-hint" id="fb-hint"></p></div>`;
  body.innerHTML = html;
}

function setStar(val) {
  fbData.satisfaction = val;
  renderStep();
}

function setRadio(key, val) {
  fbData[key] = val;
  renderStep();
}

function toggleFeature(val) {
  const idx = fbData.features.indexOf(val);
  if (idx === -1) fbData.features.push(val);
  else fbData.features.splice(idx, 1);
  renderStep();
}

function updateNav() {
  const t = tr();
  const prevBtn = document.getElementById('fb-prev-btn');
  const nextBtn = document.getElementById('fb-next-btn');
  if (!prevBtn || !nextBtn) return;
  prevBtn.textContent = t.prev;
  prevBtn.disabled = fbStep === 0;
  const isLast = fbStep === TOTAL_STEPS - 1;
  nextBtn.textContent = isLast ? t.submit : t.next;
  nextBtn.className = isLast ? 'fb-btn-submit' : 'fb-btn-next';
}

function prevStep() {
  if (fbStep > 0) {
    fbStep--;
    renderStep();
    updateNav();
  }
}

function nextStep() {
  if (fbStep === TOTAL_STEPS - 1) {
    submitFeedback();
    return;
  }
  const q = qDef();
  if (q.type === 'stars' && !fbData.satisfaction) { showHint(); return; }
  if (q.type === 'radio' && !fbData[q.key]) { showHint(); return; }
  fbStep++;
  renderStep();
  updateNav();
}

function showHint() {
  const hint = document.getElementById('fb-hint');
  if (hint) hint.textContent = tr().required_hint;
}

async function submitFeedback() {
  const nextBtn = document.getElementById('fb-next-btn');
  nextBtn.disabled = true;
  nextBtn.textContent = '...';

  const payload = { language: fbData.language };
  if (fbData.satisfaction) payload.satisfaction = fbData.satisfaction;
  if (fbData.profile) payload.profile = fbData.profile;
  if (fbData.features.length) payload.features = fbData.features;
  if (fbData.wouldUse) payload.wouldUse = fbData.wouldUse;
  if (fbData.heardFrom) payload.heardFrom = fbData.heardFrom;
  if (fbData.comment.trim()) payload.comment = fbData.comment.trim();

  try {
    const res = await fetch(`${FB_API}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('API error ' + res.status);
    localStorage.setItem(FB_KEY, 'submitted');
    showThankYou();
  } catch (err) {
    nextBtn.disabled = false;
    nextBtn.textContent = tr().submit;
    console.error('Feedback error:', err);
    // Still show thank you if API is unavailable (graceful degradation)
    localStorage.setItem(FB_KEY, 'submitted');
    showThankYou();
  }
}

function showThankYou() {
  const t = tr();
  document.getElementById('fb-step-body').innerHTML = `
    <div class="fb-thankyou">
      <div class="fb-ty-icon">✅</div>
      <h3>${t.thankyou_title}</h3>
      <p>${t.thankyou_text}</p>
      <button class="fb-btn-close-ty" onclick="closeFeedbackForm()">${t.close}</button>
    </div>
  `;
  const nav = document.getElementById('fb-form-nav');
  const prog = document.getElementById('fb-progress-wrap');
  if (nav) nav.style.display = 'none';
  if (prog) prog.style.display = 'none';
}

// ─── Init ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem(FB_KEY)) {
    setTimeout(showFeedbackPrompt, 30000);
  }
});
