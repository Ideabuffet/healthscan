import { computeResults } from './scoring.js'

// Builds the full passport view-model the result page renders.
// Returns: { bio, summary, modules:[...], lifestyle:[...], redFlag }

const LEVEL_LABEL = { low: 'Низкий', mod: 'Умеренный', high: 'Высокий', info: 'Информация' }

export function buildPassport(answers) {
  const { derived: d, raw, bio } = computeResults(answers)
  const modules = []

  // ---------- SCORE2 (cardiovascular) ----------
  if (raw.score2) {
    if (raw.score2.insufficient) {
      modules.push({
        key: 'score2', category: 'Сердце, сосуды и обмен веществ',
        name: 'Сердечно-сосудистый риск', full: 'SCORE2 / SCORE2-OP · ESC',
        level: 'info', levelLabel: 'Нужны данные',
        metric: '—', metricNote: 'Нужны давление и липидограмма', barPct: 0,
        recs: [
          'Для точной оценки сердечно-сосудистого риска полезно знать систолическое давление, общий холестерин и HDL.',
          'Эти показатели можно уточнить на профилактическом визите к врачу или при плановом анализе крови.',
        ],
      })
    } else {
      const { pct, level } = raw.score2
      const recs = level === 'low'
        ? ['Сохраняйте здоровые привычки: не курить, быть активным, питаться сбалансированно.',
           'Периодическая профилактическая оценка у врача остаётся важной.']
        : level === 'mod'
        ? ['Умеренный риск означает, что есть факторы, на которые можно повлиять.',
           'Уделите внимание движению, питанию и контролю давления; обсудите результат с врачом.']
        : ['Высокий сердечно-сосудистый риск требует очной оценки врачом.',
           'Полезно прийти на приём с записями давления и результатами анализов.']
      modules.push({
        key: 'score2', category: 'Сердце, сосуды и обмен веществ',
        name: 'Сердечно-сосудистый риск', full: 'SCORE2 / SCORE2-OP · ESC',
        level, levelLabel: LEVEL_LABEL[level],
        metric: `${pct}%`, metricNote: '10-летний риск инфаркта и инсульта',
        barPct: Math.min(100, pct * 5), barColor: barColor(level),
        recs,
      })
    }
  }

  // ---------- FINDRISC (diabetes) ----------
  if (raw.findrisc) {
    const { score, level, label } = raw.findrisc
    const recs = level === 'low'
      ? ['Поддерживайте текущие привычки: активность, овощи и фрукты ежедневно, контроль веса.']
      : level === 'mod'
      ? ['Усильте физическую активность и питание, обсудите профилактику с врачом.',
         'Полезно при случае проверить глюкозу натощак или HbA1c.']
      : ['Рекомендуется очная оценка и лабораторный контроль (глюкоза / HbA1c) по назначению врача.',
         'Структурированная программа питания и активности заметно снижает риск.']
    if (a(answers, 'O72') === 'no') recs.push('Ежедневные овощи и фрукты связаны с меньшим риском диабета 2 типа.')
    modules.push({
      key: 'findrisc', category: 'Сердце, сосуды и обмен веществ',
      name: 'Риск диабета 2 типа', full: 'FINDRISC · 10-летний прогноз',
      level, levelLabel: label,
      metric: `${score}`, metricNote: 'баллов из 26',
      barPct: Math.min(100, (score / 26) * 100), barColor: barColor(level),
      recs,
    })
  }

  // ---------- Metabolic profile ----------
  if (raw.metabolic && raw.metabolic.count > 0) {
    const { factors, count, level, label } = raw.metabolic
    const recs = ['Метаболические факторы усиливают друг друга — работа даже над одним снижает общий риск.']
    if (a(answers, 'O51') === '1-2wk' || a(answers, 'O51') === '3+wk')
      recs.push('Сокращение сладких напитков и фастфуда снижает нагрузку на обмен веществ.')
    if (level === 'high') recs.push('При высоком профиле — плановые анализы (АД, липиды, HbA1c) и визит к врачу.')
    modules.push({
      key: 'metabolic', category: 'Сердце, сосуды и обмен веществ',
      name: 'Метаболический профиль', full: `Факторы риска: ${factors.join(', ')}`,
      level, levelLabel: label,
      metric: `${count}`, metricNote: 'фактора риска', barPct: Math.min(100, count * 16.6),
      barColor: barColor(level), recs,
    })
  }

  // ---------- Nicotine ----------
  if (raw.ftnd) {
    const { score, level, label } = raw.ftnd
    const recs = level === 'low'
      ? ['Часто помогает план «избегание триггеров + замена привычки»: не совмещать курение с кофе/алкоголем, менять рутину после еды.']
      : level === 'mod'
      ? ['Выберите конкретную «дату отказа» и план действий при сильной тяге.',
         'В первые недели избегайте мест, где курят, и ситуаций-триггеров.']
      : ['При высокой зависимости эффективнее поддержка врача — есть клинические методы, повышающие шанс отказа.']
    const py = raw.packYears
    if (py) recs.push(`Накопленная нагрузка ≈ ${py.py} пачко-лет (${py.cat}) — учитывается в онко- и СС-настороженности.`)
    modules.push({
      key: 'nicotine', category: 'Образ жизни и зависимости',
      name: 'Никотиновая зависимость', full: 'FTND · Fagerström',
      level, levelLabel: label,
      metric: `${score}`, metricNote: 'из 10', barPct: score * 10, barColor: barColor(level),
      recs,
    })
  } else if (d.smokerCurrent || a(answers, 'B7') === 'quit') {
    const quit = a(answers, 'B7') === 'quit'
    modules.push({
      key: 'nicotine', category: 'Образ жизни и зависимости',
      name: quit ? 'Отказ от курения' : 'Курение',
      full: quit ? 'Закрепление результата' : 'Лёгкая зависимость',
      level: quit ? 'low' : 'mod', levelLabel: quit ? 'Под контролем' : 'Есть риск',
      metric: quit ? '✓' : '!', metricNote: quit ? 'вы уже бросили' : 'эпизодическое курение',
      barPct: quit ? 12 : 45, barColor: quit ? barColor('low') : barColor('mod'),
      recs: quit
        ? ['Отлично. При редкой тяге используйте короткие стратегии: вода, прогулка, дыхание — обычно проходит за 2–5 минут.']
        : ['Самый полезный шаг — полностью отказаться от табака; польза начинается сразу.',
           'Избегайте ситуаций-триггеров (кофе, алкоголь, после еды) и держите под рукой воду или жвачку без сахара.'],
    })
  }

  // ---------- Alcohol ----------
  if (raw.audit) {
    const { auditC, total } = raw.audit
    const positive = d.sex === 'female' ? auditC >= 3 : auditC >= 4
    let level, label, recs
    if (!positive) {
      level = 'low'; label = 'Низкий риск'
      recs = ['Даже при невысоких значениях полезно избегать эпизодов интенсивного употребления («много за раз»).',
              'Если алкоголь ухудшает сон или самочувствие — имеет смысл сократить частоту или дозу.']
    } else if (total <= 15) {
      level = 'mod'; label = 'Повышенный риск'
      recs = ['Снизьте количество за один раз, ограничьте частоту и планируйте дни без алкоголя.',
              'Краткое обсуждение с семейным врачом реально помогает снизить риск.']
    } else if (total <= 19) {
      level = 'high'; label = 'Высокий риск'
      recs = ['Результат указывает на высокий риск вреда — рекомендуется очная оценка у врача.']
    } else {
      level = 'high'; label = 'Вероятная зависимость'
      recs = ['Результат может соответствовать зависимости — стоит обратиться за профессиональной помощью для полноценной оценки.']
    }
    if (a(answers, 'O34') === 'weekly' || a(answers, 'O34') === 'daily' || a(answers, 'O37') === 'year' || a(answers, 'O38') === 'year')
      recs.push('Есть признаки, что алкоголь уже влияет на здоровье или безопасность — лучше не откладывать консультацию.')
    modules.push({
      key: 'audit', category: 'Образ жизни и зависимости',
      name: 'Алкоголь', full: positive ? 'AUDIT (полный)' : 'AUDIT-C (скрининг)',
      level, levelLabel: label,
      metric: positive ? `${total}` : `${auditC}`,
      metricNote: positive ? 'из 40' : 'из 12 (AUDIT-C)',
      barPct: positive ? Math.min(100, (total / 40) * 100) : Math.min(100, (auditC / 12) * 100),
      barColor: barColor(level), recs,
    })
  }

  // ---------- Substances (DAST) ----------
  if (raw.dast && raw.dast.score >= 0) {
    const { score, max, level, label, redFlags, full } = raw.dast
    const recs = score === 0
      ? ['Явных признаков проблемного употребления не выявлено. При сомнениях — обсудите с врачом первичной помощи.']
      : level === 'low'
      ? ['Даже эпизодическое употребление может нести риски. При вопросах стоит обсудить это с врачом.']
      : level === 'mod'
      ? ['Результат указывает на возможное влияние на жизнь или здоровье — рекомендуется обсудить с врачом.']
      : ['Есть признаки серьёзного риска — рекомендуется обратиться за профессиональной помощью.']
    if (redFlags) recs.push('Проблемы с безопасностью, работой или здоровьем из-за употребления требуют очной оценки.')
    modules.push({
      key: 'dast', category: 'Образ жизни и зависимости',
      name: 'Психоактивные вещества', full: full ? 'DAST-10' : 'DAST · краткий скрининг',
      level, levelLabel: label,
      metric: `${score}`, metricNote: `из ${max}`, barPct: (score / max) * 100,
      barColor: barColor(level), recs,
    })
  }

  // ---------- Sleep apnea (STOP-Bang) ----------
  if (raw.stopBang) {
    const { score, level } = raw.stopBang
    const label = level === 'low' ? 'Низкий риск' : level === 'mod' ? 'Промежуточный' : 'Высокий риск'
    const recs = level === 'low'
      ? ['Соблюдайте гигиену сна и контролируйте вес.']
      : level === 'mod'
      ? ['Оцените симптомы; при гипертонии или ожирении обсудите ситуацию с врачом.']
      : ['Рекомендуется очная оценка и, возможно, направление на диагностику сна.']
    modules.push({
      key: 'stopbang', category: 'Образ жизни и зависимости',
      name: 'Риск апноэ сна', full: 'STOP-Bang',
      level, levelLabel: label,
      metric: `${score}`, metricNote: 'из 8', barPct: (score / 8) * 100, barColor: barColor(level),
      recs,
    })
  }

  // ---------- Falls (STEADI, 65+) ----------
  if (raw.steadi) {
    const { level, label } = raw.steadi
    const recs = level === 'low'
      ? ['Профилактика: упражнения на силу и баланс, хорошее освещение дома, удобная обувь.']
      : level === 'mod'
      ? ['Обсудите устойчивость с врачом; полезны упражнения на баланс, проверка зрения и пересмотр лекарств.']
      : ['Рекомендуется очная оценка (врач/физиотерапевт) и коррекция факторов риска падений.']
    if (a(answers, 'O64') === 'no' || a(answers, 'O64') === 'forgot')
      recs.push('Людям 65+ в Испании рекомендуется ежегодная вакцинация против гриппа — она снижает риск осложнений.')
    modules.push({
      key: 'steadi', category: 'Возраст и онко-настороженность',
      name: 'Риск падений', full: 'STEADI · CDC',
      level, levelLabel: label,
      metric: level === 'low' ? '✓' : '!', metricNote: 'скрининг равновесия',
      barPct: level === 'low' ? 15 : level === 'mod' ? 55 : 90, barColor: barColor(level),
      recs,
    })
  }

  // ---------- Cancer red flags ----------
  let redFlag = null
  if (raw.cancer) {
    const { any, severe } = raw.cancer
    redFlag = { any, severe }
    const recs = any
      ? ['Обнаружены симптомы, которые важно обсудить с врачом в ближайшее время — без паники, но не откладывая.',
         'Приложение не ставит диагнозы; цель — не пропустить то, что требует оценки специалистом.']
      : ['Тревожных симптомов не выявлено. Продолжайте профилактику и скрининги по возрасту.']
    modules.push({
      key: 'cancer', category: 'Возраст и онко-настороженность',
      name: 'Онко-настороженность', full: 'Red flags · триггерный скрининг',
      level: any ? 'high' : 'low', levelLabel: any ? 'Есть симптомы' : 'Без тревожных признаков',
      metric: any ? '!' : '✓', metricNote: any ? 'требуется внимание' : 'красных флагов нет',
      barPct: any ? (severe ? 95 : 70) : 12, barColor: barColor(any ? 'high' : 'low'),
      recs,
    })
  }

  // ---------- General lifestyle recommendations ----------
  const lifestyle = buildLifestyle(answers, d, raw)

  // ---------- summary ----------
  const counts = modules.reduce((acc, m) => { acc[m.level] = (acc[m.level] || 0) + 1; return acc }, {})
  const summary = {
    reviewed: modules.length,
    attention: (counts.mod || 0) + (counts.high || 0),
    priority: counts.high || 0,
  }

  return { bio, summary, modules, lifestyle, redFlag }
}

function buildLifestyle(answers, d, raw) {
  const out = []
  const push = (topic, text) => out.push({ topic, text })

  if (d.bmi !== null && d.bmi >= 25)
    push('Вес', 'Фокус на питании и регулярном движении без экстремальных диет — цель в постепенных устойчивых изменениях.')
  if (a(answers, 'B5') === 'elevated' || a(answers, 'B5') === 'high')
    push('Давление', 'Измеряйте давление дома в спокойной обстановке, записывайте значения и обсуждайте их с врачом.')
  if (a(answers, 'B5') === 'unknown')
    push('Давление', 'Стоит измерить давление (дома, в аптеке или у врача) — это базовый показатель здоровья.')
  if (a(answers, 'B6') === 'yes' || a(answers, 'B6') === 'unknown')
    push('Холестерин', 'Обсудите контроль липидов с врачом в рамках профилактики; в поведении — питание и активность.')
  if (a(answers, 'B9') === 'lt30' || a(answers, 'B9') === '30-149')
    push('Активность', 'Цель — минимум 150 минут умеренной активности в неделю; сокращайте время сидения.')
  if (a(answers, 'B10') === 'sweets_fat' || a(answers, 'B10') === 'irregular')
    push('Питание', 'Больше овощей и фруктов и воды ежедневно; сладкое и выпечка — изредка; регулярные приёмы пищи.')
  if (a(answers, 'B11') === 'lt6')
    push('Сон', 'Гигиена сна: стабильный режим, без экранов и кофеина вечером, кровать — только для сна.')
  if (a(answers, 'B12') === 'sometimes' || a(answers, 'B12') === 'often')
    push('Стресс', 'Регулярное движение, сон, ограничение алкоголя и кофеина; 15–20 минут релаксации в день.')
  if (a(answers, 'B14') === 'yes')
    push('Наблюдение', 'Регулярное наблюдение у врача и контроль факторов риска. Не отменяйте и не меняйте лекарства самостоятельно.')
  if (a(answers, 'B15') === 'yes')
    push('Наследственность', 'Семейный анамнез усиливает важность модифицируемых факторов: не курить, активность, контроль АД, липидов и сахара.')

  // age/sex screening reminders
  const age = d.age
  if (age !== null) {
    if (d.sex === 'female' && age >= 45 && age <= 69)
      push('Скрининг', 'Участвуйте в скрининге рака молочной железы: маммография каждые 2 года (по программе вашего региона).')
    if (d.sex === 'female' && age >= 30 && age <= 65)
      push('Скрининг', 'Скрининг рака шейки матки: тест на ВПЧ высокого риска примерно каждые 5 лет.')
    if (age >= 50 && age <= 69)
      push('Скрининг', 'Скрининг колоректального рака: тест на скрытую кровь в кале каждые 2 года.')
  }
  return out
}

function a(answers, id) { return answers[id] }
function barColor(level) {
  return level === 'low' ? 'var(--risk-low)' : level === 'mod' ? 'var(--risk-mod)' : level === 'high' ? 'var(--risk-high)' : 'var(--emerald-600)'
}
