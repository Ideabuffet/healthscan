import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export const LANGS = [
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'RU', name: 'Русский' },
]

function detect() {
  try {
    const saved = localStorage.getItem('hs_lang')
    if (saved && LANGS.some((l) => l.code === saved)) return saved
    const nav = (navigator.language || 'es').slice(0, 2).toLowerCase()
    if (nav === 'ru') return 'ru'
    if (nav === 'en') return 'en'
    return 'es' // clinical content targets Spain
  } catch { return 'es' }
}

const I18nCtx = createContext({ lang: 'es', setLang: () => {}, t: (k) => k })

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detect)
  const setLang = useCallback((l) => {
    setLangState(l)
    try { localStorage.setItem('hs_lang', l) } catch {}
  }, [])
  useEffect(() => { try { document.documentElement.lang = lang } catch {} }, [lang])

  // t('a.b.c') -> dict[lang].a.b.c, falling back to ru, then the key itself
  const t = useCallback((key) => {
    const get = (obj) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), obj)
    const v = get(DICT[lang]) ?? get(DICT.ru)
    return v == null ? key : v
  }, [lang])

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>
}

export const useI18n = () => useContext(I18nCtx)

// ============================================================
// Dictionary — landing + global UI chrome (ES / EN / RU).
// Quiz + results data fall back to RU until translated.
// ============================================================
export const DICT = {
  es: {
    nav: { anon: 'Anónimo', time: '10–15 min', cta: 'Empezar gratis' },
    hero: {
      badge: 'Radiografía digital de salud · gratis',
      h1a: 'Mira cómo se ven', h1em: 'tus órganos', h1b: '— sin un solo corte',
      lead: 'Haz un test científico y obtén una imagen realista de tu cuerpo según tus respuestas: dónde está todo bien y qué ya está bajo presión. Y pasos concretos para mejorar cada órgano, basados en métodos validados de la OMS, los CDC y la SEMFYC.',
      cta: 'Hacer la radiografía', pill: '10–15 min · anónimo',
      s1: 'módulos de evaluación', s2: 'escalas validadas', s3: 'confidencial',
      r1: 'Escalas como las médicas', r2: 'Sin compartir datos', r3: 'Sin diagnósticos',
      scan: 'Escaneando órganos',
      fc1t: 'Corazón y vasos', fc1v: 'Riesgo bajo',
      fc2t: 'Índice de salud', fc3t: 'Pronóstico', fc3v: '−5 años', fc3s: 'a tu edad',
    },
    trust: {
      stat1: 'casos clínicos en la base de la metodología',
      stat2n: '2+ años', stat2: 'de desarrollo científico',
      stat3: 'escalas clínicas validadas',
      label: 'Metodología basada en instrumentos y datos validados',
    },
    why: {
      eyebrow: '¿Por qué importa?',
      h2: 'Es más barato y fácil prevenir las enfermedades que tratarlas',
      lead: 'Las enfermedades cardiovasculares, la diabetes tipo 2 y muchos cánceres se desarrollan en silencio durante décadas. Cuando aparecen los síntomas, tratarlas es más difícil. HealthScan muestra tus factores de riesgo a tiempo, cuando aún es fácil influir en ellos.',
      badT: 'Enfoque habitual', goodT: 'Enfoque HealthScan',
      bad1: 'Se va al médico cuando la enfermedad ya llegó',
      bad2: 'Los factores de riesgo pasan años sin detectarse',
      bad3: 'Tratar en vez de prevenir: más largo y más caro',
      bad4: 'Sin una imagen clara de la propia salud',
      good1: 'Detección temprana de factores de riesgo',
      good2: 'Un Pasaporte de salud claro con pasos concretos',
      good3: 'Recomendaciones preventivas gratuitas',
      good4: 'Sabes cuándo acudir al médico — y cuándo no',
    },
    steps: {
      eyebrow: 'Cómo funciona', h2: 'Tres pasos hasta tu Pasaporte de salud',
      s1t: 'Responde el test', s1d: 'Preguntas breves y adaptativas sobre tu estilo de vida y tu salud. Anónimo, sin registro.',
      s2t: 'Analizamos tus respuestas', s2d: 'Las convertimos al estado de tus órganos con escalas clínicas validadas.',
      s3t: 'Recibe tu Pasaporte', s3d: 'Una imagen de tu cuerpo y pasos concretos para mejorar cada órgano.',
    },
    mods: { eyebrow: 'Qué evaluamos', h2: 'Una imagen completa de tu salud', label: 'Metodología basada en instrumentos validados',
      list: [
        { t: 'Corazón y vasos', p: 'Riesgo a 10 años de infarto e ictus (SCORE2, ESC)' },
        { t: 'Diabetes tipo 2', p: 'Riesgo de desarrollar diabetes (FINDRISC)' },
        { t: 'Metabolismo y peso', p: 'Perfil de riesgo metabólico: tensión, azúcar, cintura' },
        { t: 'Tabaco', p: 'Grado de dependencia a la nicotina y carga acumulada' },
        { t: 'Alcohol', p: 'Cribado AUDIT (OMS) y reducción de riesgos' },
        { t: 'Sueño y apnea', p: 'Riesgo de apnea obstructiva del sueño (STOP-Bang)' },
        { t: 'Alerta oncológica', p: 'Cribado de «señales de alarma»' },
        { t: 'Caídas 65+', p: 'Evaluación del equilibrio y riesgo de caídas (STEADI)' },
        { t: 'Estrés y estilo de vida', p: 'Alimentación, actividad, sueño y recuperación' },
      ] },
    feature: {
      eyebrow: 'La métrica clave', h2: 'Tu edad biológica frente a la del DNI',
      lead: 'Convertimos tus factores de riesgo en un único indicador claro: cuántos años «mayor» o «menor» es tu cuerpo respecto a tu edad real. Muestra qué influye en tu salud y qué puedes cambiar hoy mismo.',
      l1: 'Ves qué hábitos te «envejecen» y cuáles te «rejuvenecen»',
      l2: 'Te motiva a empezar por el factor más importante',
      l3: 'Puedes repetirlo y ver tu progreso',
      cta: 'Conocer mi edad', gaugeLbl: 'edad biológica', gaugeCmp: 'edad real 39 · ',
    },
    tag: 'Chequeo preventivo de salud. Ayudamos a detectar factores de riesgo a tiempo con pasos sencillos y basados en la ciencia.',
    finalCta: {
      eyebrow: 'Te llevará 10–15 minutos',
      h2: 'Da hoy un paso hacia tu salud',
      p: 'Gratis, anónimo y basado en la ciencia. Tu Pasaporte de salud personal te espera.',
      cta: 'Hacer el test gratis',
    },
    get: { eyebrow: 'Qué recibes', h2: 'Tu resultado, en 3 partes',
      i1t: 'Una imagen de tu cuerpo', i1d: 'Una visualización realista de tus órganos según tus respuestas.',
      i2t: 'Qué está bajo presión', i2d: 'Qué órganos y sistemas necesitan atención, y por qué.',
      i3t: 'Qué hacer', i3d: 'Pasos concretos para cada órgano, según métodos validados.' },
    faq: { eyebrow: 'Preguntas frecuentes', h2: 'Lo que la gente pregunta',
      q1: '¿Es realmente gratis?', a1: 'Sí. El test y tu Pasaporte de salud son totalmente gratuitos: sin tarjeta ni registro.',
      q2: '¿Mis datos están seguros?', a2: 'Es anónimo: no pedimos tu identidad y no compartimos tus datos con terceros.',
      q3: '¿Es un diagnóstico médico?', a3: 'No. Es una herramienta preventiva orientativa; no sustituye la consulta con un profesional.',
      q4: '¿Qué precisión tiene?', a4: 'Usamos escalas clínicas validadas (SCORE2, FINDRISC, AUDIT, STOP-Bang…), las mismas que usan los médicos.' },
    outcome: 'En 15 minutos: tu cuerpo en una imagen + lo primero que conviene mejorar.',
    exampleTag: 'ejemplo',
    footer: { method: 'Metodología', privacy: 'Privacidad', priv1: 'Anónimo', priv2: 'Sin compartir datos', priv3: 'Sin registro',
      disclaimer: 'HealthScan no emite diagnósticos médicos ni sustituye la consulta con un profesional. Resultados orientativos con fines preventivos.' },
    lang: 'Idioma',
  },

  en: {
    nav: { anon: 'Anonymous', time: '10–15 min', cta: 'Start free' },
    hero: {
      badge: 'Digital health X-ray · free',
      h1a: 'See what', h1em: 'your organs', h1b: 'look like — without a single cut',
      lead: 'Take a science-based test and get a realistic image of your body from your answers: where everything’s fine and what’s already under strain. Plus concrete steps to improve each organ, based on validated WHO, CDC and SEMFYC methods.',
      cta: 'Run the X-ray', pill: '10–15 min · anonymous',
      s1: 'assessment modules', s2: 'validated scales', s3: 'confidential',
      r1: 'Clinician-grade scales', r2: 'No data sharing', r3: 'No diagnoses',
      scan: 'Scanning organs',
      fc1t: 'Heart & vessels', fc1v: 'Low risk',
      fc2t: 'Health index', fc3t: 'Forecast', fc3v: '−5 years', fc3s: 'to your age',
    },
    trust: {
      stat1: 'clinical cases behind the methodology',
      stat2n: '2+ years', stat2: 'of scientific development',
      stat3: 'validated clinical scales',
      label: 'Methodology built on validated instruments and data',
    },
    why: {
      eyebrow: 'Why it matters',
      h2: 'Diseases are cheaper and easier to prevent than to treat',
      lead: 'Cardiovascular disease, type 2 diabetes and many cancers develop silently for decades. By the time symptoms appear, treatment is harder. HealthScan shows your risk factors early — while they’re still easy to influence.',
      badT: 'The usual way', goodT: 'The HealthScan way',
      bad1: 'People see a doctor once the disease has arrived',
      bad2: 'Risk factors stay unnoticed for years',
      bad3: 'Treatment instead of prevention — longer and costlier',
      bad4: 'No clear picture of your own health',
      good1: 'Early detection of risk factors',
      good2: 'A clear Health Passport with concrete steps',
      good3: 'Free preventive recommendations',
      good4: 'You know when to see a doctor — and when not to',
    },
    steps: {
      eyebrow: 'How it works', h2: 'Three steps to your Health Passport',
      s1t: 'Take the test', s1d: 'Short, adaptive questions about your lifestyle and health. Anonymous, no sign-up.',
      s2t: 'We analyse your answers', s2d: 'We translate them into the state of your organs using validated clinical scales.',
      s3t: 'Get your Passport', s3d: 'An image of your body and concrete steps to improve each organ.',
    },
    mods: { eyebrow: 'What we assess', h2: 'A complete picture of your health', label: 'Methodology based on validated instruments',
      list: [
        { t: 'Heart & vessels', p: '10-year risk of heart attack and stroke (SCORE2, ESC)' },
        { t: 'Type 2 diabetes', p: 'Risk of developing diabetes (FINDRISC)' },
        { t: 'Metabolism & weight', p: 'Metabolic risk profile: blood pressure, sugar, waist' },
        { t: 'Smoking', p: 'Degree of nicotine dependence and accumulated load' },
        { t: 'Alcohol', p: 'AUDIT screening (WHO) and risk reduction' },
        { t: 'Sleep & apnea', p: 'Risk of obstructive sleep apnea (STOP-Bang)' },
        { t: 'Cancer alertness', p: '“Red flag” trigger screening' },
        { t: 'Falls 65+', p: 'Balance and fall-risk assessment (STEADI)' },
        { t: 'Stress & lifestyle', p: 'Nutrition, activity, sleep and recovery' },
      ] },
    feature: {
      eyebrow: 'The key metric', h2: 'Your biological age vs. your real age',
      lead: 'We turn your risk factors into one clear number: how many years “older” or “younger” your body is than your actual age. It shows what affects your health and what you can change today.',
      l1: 'See which habits “age” you and which keep you young',
      l2: 'Motivates you to start with the factor that matters most',
      l3: 'Retake it and watch your progress',
      cta: 'Find my age', gaugeLbl: 'biological age', gaugeCmp: 'real age 39 · ',
    },
    tag: 'Preventive health check-up. We help spot risk factors early through simple, science-based steps.',
    finalCta: {
      eyebrow: 'It takes 10–15 minutes',
      h2: 'Take a step toward your health today',
      p: 'Free, anonymous and science-based. Your personal Health Passport is waiting.',
      cta: 'Take the test free',
    },
    get: { eyebrow: 'What you get', h2: 'Your result, in 3 parts',
      i1t: 'A picture of your body', i1d: 'A realistic visualization of your organs from your answers.',
      i2t: 'What’s under strain', i2d: 'Which organs and systems need attention, and why.',
      i3t: 'What to do', i3d: 'Concrete steps for each organ, based on validated methods.' },
    faq: { eyebrow: 'Frequently asked', h2: 'What people ask',
      q1: 'Is it really free?', a1: 'Yes. The test and your Health Passport are completely free — no card, no sign-up.',
      q2: 'Is my data safe?', a2: 'It’s anonymous: we don’t ask who you are and we don’t share your data with anyone.',
      q3: 'Is this a medical diagnosis?', a3: 'No. It’s an indicative preventive tool; it doesn’t replace a doctor’s consultation.',
      q4: 'How accurate is it?', a4: 'We use validated clinical scales (SCORE2, FINDRISC, AUDIT, STOP-Bang…) — the same ones doctors use.' },
    outcome: 'In 15 minutes: your body in a picture + the first thing worth fixing.',
    exampleTag: 'example',
    footer: { method: 'Methodology', privacy: 'Privacy', priv1: 'Anonymous', priv2: 'No data sharing', priv3: 'No sign-up',
      disclaimer: 'HealthScan does not provide medical diagnoses and does not replace a doctor’s consultation. Results are indicative and preventive in nature.' },
    lang: 'Language',
  },

  ru: {
    nav: { anon: 'Анонимно', time: '10–15 минут', cta: 'Пройти бесплатно' },
    hero: {
      badge: 'Цифровой рентген здоровья · бесплатно',
      h1a: 'Посмотрите, как выглядят', h1em: 'ваши органы', h1b: '— без единого разреза',
      lead: 'Пройдите научный тест — и получите реалистичное изображение своего организма по вашим ответам: где всё в норме, а что уже под нагрузкой. И — конкретные шаги, как улучшить каждый орган, на основе валидированных методик ВОЗ, CDC и SEMFYC.',
      cta: 'Сделать рентген', pill: '10–15 минут · анонимно',
      s1: 'модулей оценки', s2: 'валидированных шкал', s3: 'конфиденциально',
      r1: 'Шкалы как у врачей', r2: 'Без передачи данных', r3: 'Без диагнозов',
      scan: 'Сканирование органов',
      fc1t: 'Сердце и сосуды', fc1v: 'Низкий риск',
      fc2t: 'Индекс здоровья', fc3t: 'Прогноз', fc3v: '−5 лет', fc3s: 'к возрасту',
    },
    trust: {
      stat1: 'клинических случаев в основе методологии',
      stat2n: '2+ года', stat2: 'научной разработки',
      stat3: 'валидированных клинических шкал',
      label: 'Методология построена на валидированных инструментах и данных',
    },
    why: {
      eyebrow: 'Зачем это нужно',
      h2: 'Болезни дешевле и проще предупредить, чем лечить',
      lead: 'Сердечно-сосудистые заболевания, диабет 2 типа и многие виды рака десятилетиями развиваются бессимптомно. Когда появляются жалобы — лечить уже сложнее. HealthScan показывает ваши факторы риска заранее, пока на них ещё легко повлиять.',
      badT: 'Обычный подход', goodT: 'Подход HealthScan',
      bad1: 'К врачу идут, когда болезнь уже наступила',
      bad2: 'Факторы риска остаются незамеченными годами',
      bad3: 'Лечение вместо профилактики — дольше и дороже',
      bad4: 'Нет понятной картины собственного здоровья',
      good1: 'Раннее выявление факторов риска',
      good2: 'Понятный Паспорт здоровья с конкретными шагами',
      good3: 'Бесплатные превентивные рекомендации',
      good4: 'Знаете, когда стоит обратиться к врачу — а когда нет',
    },
    steps: {
      eyebrow: 'Как это работает', h2: 'Три шага до вашего Паспорта здоровья',
      s1t: 'Пройдите тест', s1d: 'Короткие адаптивные вопросы о вашем образе жизни и здоровье. Анонимно, без регистрации.',
      s2t: 'Анализируем ответы', s2d: 'Переводим их в состояние ваших органов по валидированным клиническим шкалам.',
      s3t: 'Получите Паспорт', s3d: 'Изображение вашего тела и конкретные шаги, как улучшить каждый орган.',
    },
    mods: { eyebrow: 'Что мы оцениваем', h2: 'Комплексная картина вашего здоровья', label: 'Методология основана на валидированных инструментах',
      list: [
        { t: 'Сердце и сосуды', p: '10-летний риск инфаркта и инсульта по шкале SCORE2 (ESC)' },
        { t: 'Диабет 2 типа', p: 'Риск развития диабета по шкале FINDRISC' },
        { t: 'Метаболизм и вес', p: 'Профиль метаболического риска: давление, сахар, талия' },
        { t: 'Курение', p: 'Степень никотиновой зависимости и нагрузка' },
        { t: 'Алкоголь', p: 'Скрининг AUDIT (ВОЗ) и снижение рисков' },
        { t: 'Сон и апноэ', p: 'Риск обструктивного апноэ сна (STOP-Bang)' },
        { t: 'Онко-настороженность', p: 'Триггерный скрининг «красных флагов»' },
        { t: 'Падения 65+', p: 'Оценка равновесия и риска падений (STEADI)' },
        { t: 'Стресс и образ жизни', p: 'Питание, активность, сон и восстановление' },
      ] },
    feature: {
      eyebrow: 'Главная метрика', h2: 'Ваш биологический возраст — против паспортного',
      lead: 'Мы переводим ваши факторы риска в один понятный показатель: на сколько лет ваш организм «старше» или «моложе» вашего реального возраста. Это наглядно показывает, что влияет на здоровье — и что можно изменить уже сегодня.',
      l1: 'Видно, какие привычки «состаривают», а какие «омолаживают»',
      l2: 'Мотивирует начать с самого важного фактора',
      l3: 'Можно пройти повторно и увидеть прогресс',
      cta: 'Узнать свой возраст', gaugeLbl: 'биологический возраст', gaugeCmp: 'реальный возраст 39 · ',
    },
    tag: 'Превентивный чек-ап здоровья. Помогаем выявлять факторы риска заранее через простые, научно обоснованные шаги.',
    finalCta: {
      eyebrow: 'Это займёт 10–15 минут',
      h2: 'Сделайте шаг к здоровью сегодня',
      p: 'Бесплатно, анонимно и на основе науки. Ваш персональный Паспорт здоровья уже ждёт.',
      cta: 'Пройти тест бесплатно',
    },
    get: { eyebrow: 'Что вы получите', h2: 'Ваш результат — из 3 частей',
      i1t: 'Картина вашего тела', i1d: 'Реалистичная визуализация ваших органов по вашим ответам.',
      i2t: 'Что под нагрузкой', i2d: 'Какие органы и системы требуют внимания — и почему.',
      i3t: 'Что делать', i3d: 'Конкретные шаги для каждого органа на основе валидированных методик.' },
    faq: { eyebrow: 'Частые вопросы', h2: 'О чём обычно спрашивают',
      q1: 'Это действительно бесплатно?', a1: 'Да. Тест и ваш Паспорт здоровья полностью бесплатны — без карты и регистрации.',
      q2: 'Мои данные в безопасности?', a2: 'Это анонимно: мы не спрашиваем, кто вы, и не передаём данные третьим лицам.',
      q3: 'Это медицинский диагноз?', a3: 'Нет. Это ориентировочный профилактический инструмент; он не заменяет консультацию врача.',
      q4: 'Насколько это точно?', a4: 'Мы используем валидированные клинические шкалы (SCORE2, FINDRISC, AUDIT, STOP-Bang…) — те же, что и врачи.' },
    outcome: 'За 15 минут: ваше тело на картинке + что в первую очередь стоит улучшить.',
    exampleTag: 'пример',
    footer: { method: 'Методология', privacy: 'Приватность', priv1: 'Анонимно', priv2: 'Без передачи данных', priv3: 'Без регистрации',
      disclaimer: 'HealthScan не ставит медицинских диагнозов и не заменяет консультацию врача. Результаты носят ориентировочный профилактический характер.' },
    lang: 'Язык',
  },
}
