import { auditCScore } from '../engine/scoring.js'

// Each question:
//   id, stage (UI eyebrow), title, help?, type: 'single' | 'number'
//   options: [{ value, label }]  (single)
//   unit, min, max, placeholder    (number)
//   visible: (a, d) => boolean     a = answers, d = derived
// Questions are filtered in array order, so every dependency is listed
// before the questions that depend on it.

const always = () => true

export const QUESTIONS = [
  // ---------------- BASE: О вас ----------------
  {
    id: 'B1', stage: 'О вас', type: 'number', unit: 'лет',
    title: 'Сколько вам полных лет?', min: 14, max: 120, visible: always,
  },
  {
    id: 'B2', stage: 'О вас', type: 'single', title: 'Ваш пол', visible: always,
    options: [
      { value: 'male', label: 'Мужчина' },
      { value: 'female', label: 'Женщина' },
      { value: 'other', label: 'Другое' },
    ],
  },
  {
    id: 'B3', stage: 'О вас', type: 'number', unit: 'см',
    title: 'Ваш рост', min: 120, max: 230, visible: always,
  },
  {
    id: 'B4', stage: 'О вас', type: 'number', unit: 'кг',
    title: 'Ваш вес', min: 30, max: 350, visible: always,
  },

  // ---------------- Давление ----------------
  {
    id: 'B5', stage: 'Сердце и сосуды', type: 'single', visible: always,
    title: 'Знаете ли вы своё артериальное давление?',
    options: [
      { value: 'normal', label: 'Нормальное' },
      { value: 'elevated', label: 'Повышенное' },
      { value: 'high', label: 'Высокое' },
      { value: 'unknown', label: 'Не знаю' },
    ],
  },
  {
    id: 'O39', stage: 'Артериальное давление', type: 'single',
    title: 'Знаете ли вы свои обычные цифры давления?',
    visible: (a, d) => d.bpHigh,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O40', stage: 'Артериальное давление', type: 'single',
    title: 'Измеряете ли вы давление дома?',
    visible: (a, d) => d.bpHigh,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O41', stage: 'Артериальное давление', type: 'single',
    title: 'Принимаете ли вы лекарства для контроля давления?',
    visible: (a, d) => d.bpHigh,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O42', stage: 'Артериальное давление', type: 'single',
    title: 'Бывает, что вы забываете принять назначенные лекарства?',
    visible: (a, d) => d.bpHigh && a.O41 === 'yes',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'B6', stage: 'Сердце и сосуды', type: 'single', visible: always,
    title: 'Говорили ли вам когда-нибудь, что у вас повышенный холестерин?',
    options: [
      { value: 'yes', label: 'Да' },
      { value: 'no', label: 'Нет' },
      { value: 'unknown', label: 'Не знаю' },
    ],
  },

  // ---------------- Курение ----------------
  {
    id: 'B7', stage: 'Курение', type: 'single', visible: always,
    title: 'Курите ли вы в настоящее время?',
    options: [
      { value: 'never', label: 'Никогда не курил' },
      { value: 'quit', label: 'Бросил' },
      { value: 'sometimes', label: 'Курю иногда' },
      { value: 'daily', label: 'Курю ежедневно' },
    ],
  },
  {
    id: 'O20', stage: 'Курение', type: 'single',
    title: 'Сколько лет вы курите (или курили до отказа)?',
    visible: (a) => a.B7 && a.B7 !== 'never',
    options: [
      { value: 'lt5', label: 'Менее 5 лет' },
      { value: '5-10', label: '5–10 лет' },
      { value: '11-20', label: '11–20 лет' },
      { value: 'gt20', label: 'Более 20 лет' },
    ],
  },
  {
    id: 'O19', stage: 'Курение', type: 'single',
    title: 'Сколько сигарет в среднем вы выкуриваете в день?',
    visible: (a, d) => d.smokerCurrent,
    options: [
      { value: 'lt5', label: 'Менее 5' },
      { value: '5-10', label: '5–10' },
      { value: '11-20', label: '11–20' },
      { value: 'gt20', label: 'Более 20' },
    ],
  },
  {
    id: 'O21', stage: 'Курение', type: 'single',
    title: 'Пробовали ли вы бросить курить ранее?',
    visible: (a, d) => d.smokerCurrent,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O22', stage: 'Курение', type: 'single',
    title: 'Используете ли вы электронные сигареты или вейпы?',
    visible: (a, d) => d.smokerCurrent,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O23', stage: 'Курение', type: 'single',
    title: 'Когда вы бросили курить?',
    visible: (a) => a.B7 === 'quit',
    options: [
      { value: 'lt1y', label: 'Менее 1 года назад' },
      { value: '1-5y', label: '1–5 лет назад' },
      { value: 'gt5y', label: 'Более 5 лет назад' },
    ],
  },
  // FTND — daily smokers
  {
    id: 'O24', stage: 'Курение · зависимость', type: 'single',
    title: 'Через сколько минут после пробуждения вы выкуриваете первую сигарету?',
    visible: (a) => a.B7 === 'daily',
    options: [
      { value: 'le5', label: 'В течение 5 минут' },
      { value: '6-30', label: '6–30 минут' },
      { value: '31-60', label: '31–60 минут' },
      { value: 'gt60', label: 'Более 60 минут' },
    ],
  },
  {
    id: 'O25', stage: 'Курение · зависимость', type: 'single',
    title: 'Трудно ли вам воздержаться от курения там, где это запрещено?',
    visible: (a) => a.B7 === 'daily',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O26', stage: 'Курение · зависимость', type: 'single',
    title: 'Какая сигарета для вас самая важная?',
    visible: (a) => a.B7 === 'daily',
    options: [
      { value: 'first', label: 'Первая утром' },
      { value: 'other', label: 'Любая другая' },
    ],
  },
  {
    id: 'O27', stage: 'Курение · зависимость', type: 'single',
    title: 'Курите ли вы больше в первые часы после пробуждения?',
    visible: (a) => a.B7 === 'daily',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O28', stage: 'Курение · зависимость', type: 'single',
    title: 'Курите ли вы, даже когда больны и вынуждены лежать в постели?',
    visible: (a) => a.B7 === 'daily',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },

  // ---------------- Алкоголь ----------------
  {
    id: 'B8', stage: 'Алкоголь', type: 'single', visible: always,
    title: 'Сколько алкогольных напитков в среднем за неделю?',
    help: 'В Испании 1 единица (UBE) ≈ 10 г чистого алкоголя: ~100 мл вина, 300 мл пива или 30 мл крепкого.',
    options: [
      { value: '0', label: '0' },
      { value: '1-7', label: '1–7' },
      { value: '8-14', label: '8–14' },
      { value: '14+', label: 'Более 14' },
    ],
  },
  {
    id: 'O29', stage: 'Алкоголь · AUDIT', type: 'single',
    title: 'Как часто вы употребляете алкоголь?',
    visible: (a) => a.B8 && a.B8 !== '0',
    options: [
      { value: 'never', label: 'Реже 1 раза в месяц' },
      { value: 'monthly', label: '1 раз в месяц' },
      { value: '2-4mo', label: '2–4 раза в месяц' },
      { value: '2-3wk', label: '2–3 раза в неделю' },
      { value: '4wk', label: '4 и более раз в неделю' },
    ],
  },
  {
    id: 'O30', stage: 'Алкоголь · AUDIT', type: 'single',
    title: 'Сколько порций вы обычно выпиваете в день, когда пьёте?',
    visible: (a) => a.B8 && a.B8 !== '0',
    options: [
      { value: '1-2', label: '1–2' },
      { value: '3-4', label: '3–4' },
      { value: '5-6', label: '5–6' },
      { value: '7-9', label: '7–9' },
      { value: '10+', label: '10 и более' },
    ],
  },
  {
    id: 'O31', stage: 'Алкоголь · AUDIT', type: 'single',
    title: 'Как часто вы выпиваете 6 и более порций за один раз?',
    visible: (a) => a.B8 && a.B8 !== '0',
    options: [
      { value: 'never', label: 'Никогда' },
      { value: 'lt-monthly', label: 'Реже 1 раза в месяц' },
      { value: 'monthly', label: 'Ежемесячно' },
      { value: 'weekly', label: 'Еженедельно' },
      { value: 'daily', label: 'Почти ежедневно' },
    ],
  },
  // Full AUDIT — gated on positive AUDIT-C
  ...['O32', 'O33', 'O34', 'O35', 'O36'].map((id, i) => ({
    id, stage: 'Алкоголь · AUDIT', type: 'single',
    title: [
      'Как часто вы не могли остановиться, начав пить?',
      'Как часто из-за алкоголя вы не выполняли ожидаемое от вас?',
      'Как часто вам нужно было выпить утром, чтобы прийти в себя?',
      'Как часто вы испытывали чувство вины после употребления алкоголя?',
      'Как часто вы не помнили события из-за алкоголя?',
    ][i],
    visible: (a, d) => a.B8 && a.B8 !== '0' && auditCPositive(a, d),
    options: [
      { value: 'never', label: 'Никогда' },
      { value: 'lt-monthly', label: 'Реже 1 раза в месяц' },
      { value: 'monthly', label: 'Ежемесячно' },
      { value: 'weekly', label: 'Еженедельно' },
      { value: 'daily', label: 'Почти ежедневно' },
    ],
  })),
  {
    id: 'O37', stage: 'Алкоголь · AUDIT', type: 'single',
    title: 'Были ли травмы из-за употребления алкоголя?',
    visible: (a, d) => a.B8 && a.B8 !== '0' && auditCPositive(a, d),
    options: [
      { value: 'no', label: 'Нет' },
      { value: 'past', label: 'Да, но не в последний год' },
      { value: 'year', label: 'Да, в последний год' },
    ],
  },
  {
    id: 'O38', stage: 'Алкоголь · AUDIT', type: 'single',
    title: 'Беспокоились ли близкие или врач о вашем употреблении алкоголя?',
    visible: (a, d) => a.B8 && a.B8 !== '0' && auditCPositive(a, d),
    options: [
      { value: 'no', label: 'Нет' },
      { value: 'past', label: 'Да, но не в последний год' },
      { value: 'year', label: 'Да, в последний год' },
    ],
  },

  // ---------------- Физическая активность ----------------
  {
    id: 'B9', stage: 'Физическая активность', type: 'single', visible: always,
    title: 'Сколько минут умеренной физической активности у вас в неделю?',
    options: [
      { value: 'lt30', label: 'Менее 30' },
      { value: '30-149', label: '30–149' },
      { value: '150+', label: '150 и более' },
      { value: 'unknown', label: 'Не знаю' },
    ],
  },
  {
    id: 'O52', stage: 'Физическая активность', type: 'single',
    title: 'Какой тип активности вам ближе?',
    visible: (a) => a.B9 !== '150+',
    options: [
      { value: 'walk', label: 'Ходьба' },
      { value: 'cardio', label: 'Кардио' },
      { value: 'strength', label: 'Силовые упражнения' },
      { value: 'none', label: 'Не занимаюсь' },
    ],
  },
  {
    id: 'O53', stage: 'Физическая активность', type: 'single',
    title: 'Что мешает вам быть активнее?',
    visible: (a) => a.B9 !== '150+',
    options: [
      { value: 'pain', label: 'Боль' },
      { value: 'fatigue', label: 'Усталость' },
      { value: 'time', label: 'Нехватка времени' },
      { value: 'habit', label: 'Отсутствие привычки' },
    ],
  },
  {
    id: 'O54', stage: 'Физическая активность', type: 'single',
    title: 'Есть ли у вас медицинские ограничения для активности?',
    visible: (a) => a.B9 !== '150+',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },

  // ---------------- Питание ----------------
  {
    id: 'B10', stage: 'Питание', type: 'single', visible: always,
    title: 'Как вы оцениваете своё питание?',
    options: [
      { value: 'balanced', label: 'Сбалансированное' },
      { value: 'sweets_fat', label: 'Слишком много сладкого/жирного' },
      { value: 'irregular', label: 'Нерегулярное' },
      { value: 'no_thought', label: 'Не задумывался' },
    ],
  },

  // ---------------- Вес / метаболизм (BMI>=25) ----------------
  {
    id: 'O48', stage: 'Вес и метаболизм', type: 'single',
    title: 'Было ли значительное увеличение веса за последние 5 лет?',
    visible: (a, d) => d.bmi !== null && d.bmi >= 25,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O49', stage: 'Вес и метаболизм', type: 'single',
    title: 'Пытались ли вы снижать вес ранее?',
    visible: (a, d) => d.bmi !== null && d.bmi >= 25,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O50', stage: 'Вес и метаболизм', type: 'single',
    title: 'Что больше всего мешает вам снизить вес?',
    visible: (a, d) => d.bmi !== null && d.bmi >= 25,
    options: [
      { value: 'time', label: 'Недостаток времени' },
      { value: 'motivation', label: 'Отсутствие мотивации' },
      { value: 'health', label: 'Проблемы со здоровьем' },
      { value: 'howto', label: 'Не знаю как' },
    ],
  },
  {
    id: 'O51', stage: 'Вес и метаболизм', type: 'single',
    title: 'Как часто вы употребляете сладкие напитки или фастфуд?',
    visible: (a, d) => d.bmi !== null && d.bmi >= 25,
    options: [
      { value: 'rare', label: 'Редко' },
      { value: '1-2wk', label: '1–2 раза в неделю' },
      { value: '3+wk', label: '3 и более раз в неделю' },
    ],
  },

  // ---------------- Сон ----------------
  {
    id: 'B11', stage: 'Сон', type: 'single', visible: always,
    title: 'Сколько часов вы спите в среднем за ночь?',
    options: [
      { value: 'lt6', label: 'Менее 6' },
      { value: '6-8', label: '6–8' },
      { value: 'gt8', label: 'Более 8' },
    ],
  },
  {
    id: 'O55', stage: 'Сон', type: 'single',
    title: 'Часто ли вы испытываете дневную сонливость?',
    visible: (a) => a.B11 === 'lt6',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O56', stage: 'Сон', type: 'single',
    title: 'Часто ли вы просыпаетесь ночью?',
    visible: (a) => a.B11 === 'lt6',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O57', stage: 'Сон', type: 'single',
    title: 'Используете ли вы снотворные препараты?',
    visible: (a) => a.B11 === 'lt6',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },

  // ---------------- Стресс ----------------
  {
    id: 'B12', stage: 'Стресс', type: 'single', visible: always,
    title: 'Испытываете ли вы частый стресс или напряжение?',
    options: [
      { value: 'no', label: 'Нет' },
      { value: 'sometimes', label: 'Иногда' },
      { value: 'often', label: 'Часто' },
    ],
  },
  {
    id: 'O58', stage: 'Стресс', type: 'single',
    title: 'Связан ли ваш стресс с работой или учёбой?',
    visible: (a) => a.B12 === 'often',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O59', stage: 'Стресс', type: 'single',
    title: 'Влияет ли стресс на ваш сон или самочувствие?',
    visible: (a) => a.B12 === 'often',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O60', stage: 'Стресс', type: 'single',
    title: 'Используете ли вы способы снижения стресса?',
    visible: (a) => a.B12 === 'often',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },

  // ---------------- Сахар / диабет ----------------
  {
    id: 'B13', stage: 'Сахар крови', type: 'single', visible: always,
    title: 'Говорили ли вам, что у вас повышен сахар крови или диабет?',
    options: [
      { value: 'yes', label: 'Да' },
      { value: 'no', label: 'Нет' },
      { value: 'unknown', label: 'Не знаю' },
    ],
  },
  {
    id: 'O43', stage: 'Сахар крови', type: 'single',
    title: 'Как давно у вас выявлен повышенный сахар или диабет?',
    visible: (a) => a.B13 === 'yes',
    options: [
      { value: 'lt1y', label: 'Менее 1 года' },
      { value: '1-5y', label: '1–5 лет' },
      { value: 'gt5y', label: 'Более 5 лет' },
    ],
  },
  {
    id: 'O44', stage: 'Сахар крови', type: 'single',
    title: 'Контролируете ли вы уровень сахара регулярно?',
    visible: (a) => a.B13 === 'yes',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O45', stage: 'Сахар крови', type: 'single',
    title: 'Соблюдаете ли вы рекомендации по питанию при повышенном сахаре?',
    visible: (a) => a.B13 === 'yes',
    options: [
      { value: 'yes', label: 'Да' },
      { value: 'partly', label: 'Частично' },
      { value: 'no', label: 'Нет' },
    ],
  },
  {
    id: 'O46', stage: 'Сахар крови', type: 'single',
    title: 'Принимаете ли вы лекарства или инсулин для контроля сахара?',
    visible: (a) => a.B13 === 'yes',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },

  // ---------------- Наследственность / анамнез ----------------
  {
    id: 'B14', stage: 'Сердечно-сосудистый анамнез', type: 'single', visible: always,
    title: 'Были ли у вас инфаркт, инсульт или другие серьёзные ССЗ?',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'B15', stage: 'Наследственность', type: 'single', visible: always,
    title: 'Были ли у близких родственников серьёзные ССЗ до 60 лет?',
    options: [
      { value: 'yes', label: 'Да' },
      { value: 'no', label: 'Нет' },
      { value: 'unknown', label: 'Не знаю' },
    ],
  },

  // ---------------- ПАВ ----------------
  {
    id: 'B16', stage: 'Психоактивные вещества', type: 'single', visible: always,
    title: 'Употребляли ли вы психоактивные вещества (кроме алкоголя) без назначения врача?',
    options: [
      { value: 'never', label: 'Никогда' },
      { value: 'prev', label: 'Да, ранее' },
      { value: 'recent12', label: 'Да, в последние 12 месяцев' },
    ],
  },
  ...['O74', 'O75', 'O76', 'O77', 'O78'].map((id, i) => ({
    id, stage: 'Психоактивные вещества', type: 'single',
    title: [
      'Употребляли ли вы вещества, отличные от назначенных врачом?',
      'Злоупотребляли ли вы более чем одним веществом одновременно?',
      'Бывали ли у вас провалы в памяти после употребления?',
      'Чувствовали ли вы вину или сожаление из-за употребления?',
      'Жалуются ли близкие на ваше употребление веществ?',
    ][i],
    visible: (a) => a.B16 === 'prev' || a.B16 === 'recent12',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  })),
  ...['O79', 'O80', 'O81', 'O82', 'O83'].map((id, i) => ({
    id, stage: 'Психоактивные вещества', type: 'single',
    title: [
      'Были ли проблемы на работе, учёбе или в семье из-за веществ?',
      'Вступали ли вы в конфликты под влиянием веществ?',
      'Были ли медицинские проблемы из-за употребления (травмы, судороги)?',
      'Пытались ли вы прекратить употребление, но не смогли?',
      'Обращались ли вы когда-либо за помощью из-за употребления?',
    ][i],
    visible: (a) => a.B16 === 'recent12',
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  })),

  // ---------------- Возраст 65+ : падения ----------------
  {
    id: 'O61', stage: 'Возраст 65+', type: 'single',
    title: 'Были ли у вас падения за последний год?',
    visible: (a, d) => d.age !== null && d.age >= 65,
    options: [
      { value: 'no', label: 'Нет' },
      { value: 'once', label: 'Один раз' },
      { value: '2+', label: 'Два раза и более' },
    ],
  },
  {
    id: 'O62', stage: 'Возраст 65+', type: 'single',
    title: 'Чувствуете ли вы неустойчивость при ходьбе?',
    visible: (a, d) => d.age !== null && d.age >= 65,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O63', stage: 'Возраст 65+', type: 'single',
    title: 'Используете ли вы вспомогательные средства для ходьбы?',
    visible: (a, d) => d.age !== null && d.age >= 65,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O64', stage: 'Возраст 65+', type: 'single',
    title: 'Делали ли вы прививку от гриппа в прошлом сезоне?',
    visible: (a, d) => d.age !== null && d.age >= 65,
    options: [
      { value: 'yes', label: 'Да' },
      { value: 'no', label: 'Нет' },
      { value: 'forgot', label: 'Не помню' },
    ],
  },
  {
    id: 'O65', stage: 'Возраст 65+', type: 'single',
    title: 'Боитесь ли вы упасть?',
    visible: (a, d) => d.age !== null && d.age >= 65,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },

  // ---------------- SCORE2 ----------------
  {
    id: 'O66', stage: 'Сердечно-сосудистый риск', type: 'single',
    title: 'Знаете ли вы своё систолическое (верхнее) давление?',
    visible: (a, d) => d.age !== null && d.age >= 40 && !d.hasCVD && !d.diabetes,
    options: [
      { value: 'yes', label: 'Да, укажу' },
      { value: 'no', label: 'Не знаю' },
    ],
  },
  {
    id: 'O67', stage: 'Сердечно-сосудистый риск', type: 'number', unit: 'мм рт.ст.',
    title: 'Введите систолическое давление', min: 70, max: 260,
    visible: (a, d) => d.age !== null && d.age >= 40 && !d.hasCVD && !d.diabetes && a.O66 === 'yes',
  },
  {
    id: 'O68', stage: 'Сердечно-сосудистый риск', type: 'single',
    title: 'Знаете ли вы свой общий холестерин?',
    visible: (a, d) => d.age !== null && d.age >= 40 && !d.hasCVD && !d.diabetes,
    options: [
      { value: 'yes', label: 'Да, укажу' },
      { value: 'no', label: 'Не знаю' },
    ],
  },
  {
    id: 'O69', stage: 'Сердечно-сосудистый риск', type: 'number', unit: 'ммоль/л',
    title: 'Введите общий холестерин', min: 2, max: 12, step: 0.1,
    visible: (a, d) => d.age !== null && d.age >= 40 && !d.hasCVD && !d.diabetes && a.O68 === 'yes',
  },
  {
    id: 'O70', stage: 'Сердечно-сосудистый риск', type: 'single',
    title: 'Знаете ли вы уровень HDL («хорошего») холестерина?',
    visible: (a, d) => d.age !== null && d.age >= 40 && !d.hasCVD && !d.diabetes,
    options: [
      { value: 'yes', label: 'Да, укажу' },
      { value: 'no', label: 'Не знаю' },
    ],
  },
  {
    id: 'O71', stage: 'Сердечно-сосудистый риск', type: 'number', unit: 'ммоль/л',
    title: 'Введите HDL-холестерин', min: 0.4, max: 4, step: 0.1,
    visible: (a, d) => d.age !== null && d.age >= 40 && !d.hasCVD && !d.diabetes && a.O70 === 'yes',
  },

  // ---------------- FINDRISC ----------------
  {
    id: 'O72', stage: 'Риск диабета', type: 'single',
    title: 'Едите ли вы овощи или фрукты ежедневно?',
    visible: (a, d) => (d.bmi !== null && d.bmi >= 25) || (d.age !== null && d.age >= 45),
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O73', stage: 'Риск диабета', type: 'single',
    title: 'Есть ли диабет у ваших родителей, братьев или сестёр?',
    visible: (a, d) => (d.bmi !== null && d.bmi >= 25) || (d.age !== null && d.age >= 45),
    options: [
      { value: 'no', label: 'Нет' },
      { value: 'second', label: 'Да, у родственников второй линии' },
      { value: 'first', label: 'Да, у родителей или родных братьев/сестёр' },
    ],
  },

  // ---------------- STOP-Bang ----------------
  {
    id: 'O92', stage: 'Качество сна', type: 'single',
    title: 'Говорили ли вам, что вы громко храпите?',
    visible: stopBangGate,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O93', stage: 'Качество сна', type: 'single',
    title: 'Бывает ли у вас выраженная дневная сонливость или усталость?',
    visible: stopBangGate,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O94', stage: 'Качество сна', type: 'single',
    title: 'Замечали ли окружающие остановки дыхания во сне?',
    visible: stopBangGate,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O95', stage: 'Качество сна', type: 'single',
    title: 'Лечитесь ли вы от повышенного артериального давления?',
    visible: (a, d) => stopBangGate(a, d) && (a.O92 === 'yes' || a.O93 === 'yes' || a.O94 === 'yes'),
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  },
  {
    id: 'O96', stage: 'Качество сна', type: 'number', unit: 'см',
    title: 'Укажите окружность шеи', min: 25, max: 70,
    visible: (a, d) => stopBangGate(a, d) && (a.O92 === 'yes' || a.O93 === 'yes' || a.O94 === 'yes'),
  },

  // ---------------- Общее самочувствие / red flags ----------------
  {
    id: 'B17', stage: 'Общее самочувствие', type: 'single', visible: always,
    title: 'Были ли за последние месяцы новые или необъяснимые симптомы, которые вас беспокоят?',
    help: 'Например: необъяснимая потеря веса, выраженная усталость, изменения стула, длительный кашель.',
    options: [{ value: 'no', label: 'Нет' }, { value: 'yes', label: 'Да' }],
  },
  {
    id: 'O84', stage: 'Общее самочувствие', type: 'single',
    title: 'Была ли непреднамеренная потеря веса за последние 3–6 месяцев?',
    visible: redFlagGate,
    options: [
      { value: 'no', label: 'Нет' },
      { value: '2-5', label: 'Да, 2–5 кг' },
      { value: '6-10', label: 'Да, 6–10 кг' },
      { value: '10+', label: 'Да, более 10 кг' },
    ],
  },
  ...[
    ['O85', 'Есть ли выраженная усталость или слабость более 4 недель?'],
    ['O86', 'Есть ли необъяснимая потеря аппетита более 2–4 недель?'],
    ['O87', 'Кашель или осиплость более 3 недель?'],
    ['O88', 'Есть ли кровь в стуле или чёрный стул?'],
    ['O89', 'Изменение характера стула более 4–6 недель?'],
    ['O90', 'Есть ли кровь в моче?'],
    ['O91', 'Трудность при глотании или ощущение застревания пищи?'],
  ].map(([id, title]) => ({
    id, stage: 'Общее самочувствие', type: 'single', title,
    visible: redFlagGate,
    options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }],
  })),
]

// ---- shared gate helpers ----

function auditCPositive(a, d) {
  const s = auditCScore(a)
  if (s === null) return false
  return d.sex === 'female' ? s >= 3 : s >= 4
}

function stopBangGate(a, d) {
  return (
    a.B11 === 'lt6' ||
    a.O55 === 'yes' ||
    (d.bmi !== null && d.bmi >= 30) ||
    d.bpHigh ||
    (d.age !== null && d.age >= 50)
  )
}

function redFlagGate(a, d) {
  if (a.B17 === 'yes') return true
  if (d.age !== null && d.age >= 50) return true
  if (d.age !== null && d.age >= 40 && (d.everSmoked || a.B8 === '14+')) return true
  return false
}

export function visibleQuestions(answers, derived) {
  return QUESTIONS.filter((q) => q.visible(answers, derived))
}
