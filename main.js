const { Plugin, Notice, PluginSettingTab, Setting } = require("obsidian");

const DEFAULT_SETTINGS = {
  cycleLength: 30,
  periodLength: 5,
  ovulationDay: 16,
  pmsLength: 5,
  language: "ru"
};

module.exports = class LunaNotesPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new LunaNotesSettingTab(this.app, this));

    this.addRibbonIcon("heart", this.t("startPeriod"), async () => await this.startPeriod());

    this.addCommand({ id: "start-period", name: this.t("startPeriod"), callback: async () => await this.startPeriod() });
    this.addCommand({ id: "finish-period", name: this.t("finishPeriod"), callback: async () => await this.finishPeriod() });
    this.addCommand({ id: "show-current-phase", name: this.t("showCurrentPhase"), callback: async () => await this.showCurrentPhase() });
    this.addCommand({ id: "create-luna-dashboard", name: this.t("createDashboard"), callback: async () => await this.createLunaDashboard() });
    this.addCommand({ id: "create-life-planner", name: this.t("createLifePlanner"), callback: async () => await this.createLifePlanner() });
    this.addCommand({ id: "create-cycle-calendar", name: this.t("createCycleCalendar"), callback: async () => await this.createCycleCalendar() });
    this.addCommand({ id: "create-cycle-analytics", name: this.t("createCycleAnalytics"), callback: async () => await this.createCycleAnalytics() });
    this.addCommand({ id: "create-pattern-tracker", name: this.t("createPatternTracker"), callback: async () => await this.createPatternTracker() });
    this.addCommand({ id: "create-phase-intelligence", name: this.t("createPhaseIntelligence"), callback: async () => await this.createPhaseIntelligence() });
  }

  t(key) {
    const ru = {
      startPeriod: "Начались месячные",
      finishPeriod: "Закончились месячные",
      showCurrentPhase: "Показать сегодняшнюю фазу",
      createDashboard: "Создать Luna Dashboard",
      createLifePlanner: "Создать Luna Life Planner",
      createCycleCalendar: "Создать Luna Cycle Calendar",
      createCycleAnalytics: "Создать аналитику циклов",
      createPatternTracker: "Создать AI Pattern Tracker",
      createPhaseIntelligence: "Создать Phase Intelligence",

      dashboardTitle: "Luna Dashboard",
      lifePlannerTitle: "Luna Life Planner",
      calendarTitle: "Luna Cycle Calendar",
      analyticsTitle: "Cycle Analytics",
      patternTitle: "AI Pattern Tracker",
      phaseTitle: "Phase Intelligence",

      today: "Сегодня",
      block: "Блок",
      value: "Значение",
      cycleDay: "День цикла",
      phase: "Фаза",
      moon: "Луна",
      mode: "Режим",
      energy: "Энергия",
      focus: "Фокус дня",
      quickAccess: "Быстрый переход",
      wellbeing: "Самочувствие",
      indicator: "Показатель",
      support: "Luna Support",
      observation: "Наблюдение дня",

      sleep: "Сон",
      pain: "Боль",
      mood: "Настроение",
      stress: "Стресс",
      appetite: "Аппетит",
      workout: "Тренировка",
      thoughts: "Мысли дня",

      periodPhase: "Менструальная",
      follicularPhase: "Фолликулярная",
      ovulationPhase: "Овуляция",
      lutealPhase: "Лютеиновая",
      pmsPhase: "ПМС",

      restMode: "Rest mode",
      createMode: "Create mode",
      socialMode: "Social mode",
      protectionMode: "Protection mode",
      structureMode: "Structure mode",

      lowEnergy: "Low / восстановление",
      highEnergy: "High / рост энергии",
      peakEnergy: "Peak / пик энергии",
      pmsEnergy: "Low-Medium / чувствительность",
      mediumEnergy: "Medium / стабильная",

      focusSelfCare: "Забота о себе",
      focusIdeas: "Новые идеи",
      focusVisible: "Проявленность",
      focusLoad: "Снижение нагрузки",
      focusStructure: "Структура",

      affirmationPeriod: "Сегодня можно двигаться мягче. Не нужно перегружать себя — маленькие шаги тоже движение.",
      affirmationFollicular: "Я открыта росту, новым возможностям и мягкому движению вперёд.",
      affirmationOvulation: "Я могу проявляться уверенно, свободно и спокойно занимать своё место.",
      affirmationPms: "Мои чувства важны. Я могу поддержать себя и не требовать от себя слишком много.",
      affirmationLuteal: "Я выбираю мягкость, границы и заботу о себе.",

      newCycleTitle: "Начало месячных",
      startDate: "Дата начала",
      status: "Статус",
      active: "Активен",
      lunarPhase: "Лунная фаза",
      forecast: "Прогноз",
      ovulationAround: "Овуляция примерно",
      pmsAround: "ПМС примерно с",
      nextPeriodAround: "Следующие месячные примерно",
      symptomTracker: "Симптом-трекер",
      finishCycleTitle: "Завершение цикла",
      endDate: "Дата окончания",
      periodDuration: "Длительность месячных",
      finished: "Завершены",

      phases: "Фазы",
      period: "Месячные",
      follicular: "Фолликулярная",
      ovulation: "Овуляция",
      luteal: "Лютеиновая",
      pms: "ПМС",
      periodDesc: "Период восстановления",
      follicularDesc: "Рост энергии и новые идеи",
      ovulationDesc: "Окно проявленности и контакта",
      lutealDesc: "Структура, завершение и бережность",
      pmsDesc: "Снижение нагрузки и забота",

      saved: "Цикл сохранён",
      finishedNotice: "Месячные завершены",
      noData: "Нет данных",
      noCycle: "Нет записей цикла",
      alreadyExists: "Запись за сегодня уже есть",
      alreadyFinished: "Этот цикл уже завершён",
      startNotFound: "Не найдена дата начала",

      updatedDashboard: "Luna Dashboard обновлён",
      updatedPlanner: "Luna Life Planner обновлён",
      updatedCalendar: "Календарь обновлён",
      updatedAnalytics: "Аналитика обновлена",
      updatedTracker: "AI Pattern Tracker обновлён",
      updatedPhase: "Phase Intelligence обновлён",

      createdDashboard: "Luna Dashboard создан",
      createdPlanner: "Luna Life Planner создан",
      createdCalendar: "Календарь создан",
      createdAnalytics: "Аналитика создана",
      createdTracker: "AI Pattern Tracker создан",
      createdPhase: "Phase Intelligence создан",

      myDay: "Мой день",
      morning: "Утро",
      day: "День",
      evening: "Вечер",
      morningItems: ["вода", "лёгкий завтрак", "проверить состояние тела", "без спешки"],
      dayItems: ["главная задача дня", "1–2 важных дела", "пауза / отдых", "прогулка"],
      eveningItems: ["замедление", "уход за собой", "растяжка / душ", "разгрузить мысли"],
      myThoughts: "Мои мысли",
      victory: "Маленькая победа дня",
      gratitude: "Благодарность",

      generalStats: "Общая статистика",
      parameter: "Параметр",
      totalCycles: "Всего циклов",
      avgCycle: "Средняя длина цикла",
      avgPeriod: "Длительность месячных",
      regularity: "Регулярность",
      lastCycle: "Последний цикл",
      notEnough: "Пока мало данных",
      cycleHistory: "История циклов",
      cycle: "Цикл",
      start: "Начало",
      end: "Конец",
      current: "Текущий",
      completed: "Завершён",
      willShow: "Что покажет со временем",
      analyticsItems: ["Среднюю длину цикла", "Регулярность", "Изменения фаз", "Повторяющиеся симптомы", "Периоды ПМС", "Общие закономерности"],
      conclusion: "Вывод",
      analyticsConclusion: "Чем больше циклов будет записано, тем точнее станет аналитика.",

      latestData: "Последние данные",
      track: "Что отслеживаю",
      trackItems: ["ПМС", "Энергия", "Настроение", "Сон", "Аппетит", "Мысли", "Стресс", "Контент / продуктивность"],
      trackerConclusion: "Пока собираю данные. Со временем появятся закономерности.",

      currentPhase: "Текущая фаза",
      pageShows: "Что показывает страница",
      phaseItems: ["Энергия по фазам", "Сон", "Настроение", "Стресс", "Аппетит", "Мысли", "Нагрузка"],
      phaseConclusion: "Когда накопится больше циклов, здесь появятся повторяющиеся паттерны.",

      q1: "Что я чувствую сегодня?",
      q2: "Где телу нужен отдых?",
      q3: "Какие мысли повторяются?",
      q4: "Что мне сейчас важно?",

      monday: "Пн", tuesday: "Вт", wednesday: "Ср", thursday: "Чт", friday: "Пт", saturday: "Сб", sunday: "Вс",

      settingsTitle: "Luna Notes — настройки",
      languageSetting: "Язык",
      languageDesc: "Выбери язык страниц Luna Notes",
      cycleLengthSetting: "Длина цикла",
      periodLengthSetting: "Длительность месячных",
      ovulationDaySetting: "День овуляции",
      pmsLengthSetting: "Длительность ПМС"
    };

    const en = {
      startPeriod: "Start period",
      finishPeriod: "Finish period",
      showCurrentPhase: "Show current phase",
      createDashboard: "Create Luna Dashboard",
      createLifePlanner: "Create Luna Life Planner",
      createCycleCalendar: "Create Luna Cycle Calendar",
      createCycleAnalytics: "Create cycle analytics",
      createPatternTracker: "Create AI Pattern Tracker",
      createPhaseIntelligence: "Create Phase Intelligence",

      dashboardTitle: "Luna Dashboard",
      lifePlannerTitle: "Luna Life Planner",
      calendarTitle: "Luna Cycle Calendar",
      analyticsTitle: "Cycle Analytics",
      patternTitle: "AI Pattern Tracker",
      phaseTitle: "Phase Intelligence",

      today: "Today",
      block: "Block",
      value: "Value",
      cycleDay: "Cycle day",
      phase: "Phase",
      moon: "Moon",
      mode: "Mode",
      energy: "Energy",
      focus: "Focus of the day",
      quickAccess: "Quick access",
      wellbeing: "Wellbeing",
      indicator: "Indicator",
      support: "Luna Support",
      observation: "Daily reflection",

      sleep: "Sleep",
      pain: "Pain",
      mood: "Mood",
      stress: "Stress",
      appetite: "Appetite",
      workout: "Workout",
      thoughts: "Daily thoughts",

      periodPhase: "Menstrual",
      follicularPhase: "Follicular",
      ovulationPhase: "Ovulation",
      lutealPhase: "Luteal",
      pmsPhase: "PMS",

      restMode: "Rest mode",
      createMode: "Create mode",
      socialMode: "Social mode",
      protectionMode: "Protection mode",
      structureMode: "Structure mode",

      lowEnergy: "Low / recovery",
      highEnergy: "High / energy rising",
      peakEnergy: "Peak energy",
      pmsEnergy: "Low-Medium / sensitive",
      mediumEnergy: "Medium / stable",

      focusSelfCare: "Self-care",
      focusIdeas: "New ideas",
      focusVisible: "Visibility",
      focusLoad: "Lower pressure",
      focusStructure: "Structure",

      affirmationPeriod: "Today, I can move softer. I do not need to push myself — small steps still count.",
      affirmationFollicular: "I am open to growth, new opportunities and gentle movement forward.",
      affirmationOvulation: "I can show up confidently, freely and take up space calmly.",
      affirmationPms: "My feelings matter. I can support myself and ask less from myself today.",
      affirmationLuteal: "I choose softness, boundaries and care for myself.",

      newCycleTitle: "Period started",
      startDate: "Start date",
      status: "Status",
      active: "Active",
      lunarPhase: "Moon phase",
      forecast: "Forecast",
      ovulationAround: "Ovulation around",
      pmsAround: "PMS around",
      nextPeriodAround: "Next period around",
      symptomTracker: "Symptom tracker",
      finishCycleTitle: "Cycle finish",
      endDate: "End date",
      periodDuration: "Period duration",
      finished: "Finished",

      phases: "Phases",
      period: "Period",
      follicular: "Follicular",
      ovulation: "Ovulation",
      luteal: "Luteal",
      pms: "PMS",
      periodDesc: "Recovery period",
      follicularDesc: "Energy growth and new ideas",
      ovulationDesc: "Visibility and connection window",
      lutealDesc: "Structure, completion and softness",
      pmsDesc: "Lower pressure and care",

      saved: "Cycle saved",
      finishedNotice: "Period finished",
      noData: "No data",
      noCycle: "No cycle records",
      alreadyExists: "Today’s record already exists",
      alreadyFinished: "This cycle is already finished",
      startNotFound: "Start date not found",

      updatedDashboard: "Luna Dashboard updated",
      updatedPlanner: "Luna Life Planner updated",
      updatedCalendar: "Calendar updated",
      updatedAnalytics: "Analytics updated",
      updatedTracker: "AI Pattern Tracker updated",
      updatedPhase: "Phase Intelligence updated",

      createdDashboard: "Luna Dashboard created",
      createdPlanner: "Luna Life Planner created",
      createdCalendar: "Calendar created",
      createdAnalytics: "Analytics created",
      createdTracker: "AI Pattern Tracker created",
      createdPhase: "Phase Intelligence created",

      myDay: "My day",
      morning: "Morning",
      day: "Day",
      evening: "Evening",
      morningItems: ["water", "light breakfast", "check in with my body", "no rush"],
      dayItems: ["main task of the day", "1–2 important things", "pause / rest", "walk"],
      eveningItems: ["slow down", "self-care", "stretch / shower", "clear my thoughts"],
      myThoughts: "My thoughts",
      victory: "Small win of the day",
      gratitude: "Gratitude",

      generalStats: "General stats",
      parameter: "Parameter",
      totalCycles: "Total cycles",
      avgCycle: "Average cycle length",
      avgPeriod: "Period duration",
      regularity: "Regularity",
      lastCycle: "Last cycle",
      notEnough: "Not enough data yet",
      cycleHistory: "Cycle history",
      cycle: "Cycle",
      start: "Start",
      end: "End",
      current: "Current",
      completed: "Completed",
      willShow: "What this will show over time",
      analyticsItems: ["Average cycle length", "Regularity", "Phase changes", "Repeating symptoms", "PMS periods", "General patterns"],
      conclusion: "Conclusion",
      analyticsConclusion: "The more cycles you record, the more accurate analytics will become.",

      latestData: "Latest data",
      track: "What I track",
      trackItems: ["PMS", "Energy", "Mood", "Sleep", "Appetite", "Thoughts", "Stress", "Content / productivity"],
      trackerConclusion: "Collecting data for now. Patterns will appear over time.",

      currentPhase: "Current phase",
      pageShows: "What this page shows",
      phaseItems: ["Energy by phase", "Sleep", "Mood", "Stress", "Appetite", "Thoughts", "Load"],
      phaseConclusion: "When more cycles are recorded, repeating phase patterns will appear.",

      q1: "What am I feeling today?",
      q2: "Where does my body need rest?",
      q3: "Which thoughts keep repeating?",
      q4: "What matters to me right now?",

      monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",

      settingsTitle: "Luna Notes — settings",
      languageSetting: "Language",
      languageDesc: "Choose Luna Notes page language",
      cycleLengthSetting: "Cycle length",
      periodLengthSetting: "Period length",
      ovulationDaySetting: "Ovulation day",
      pmsLengthSetting: "PMS length"
    };

    const lang = this.settings.language === "en" ? "en" : "ru";
    const dict = lang === "en" ? en : ru;
    return dict[key] || ru[key] || key;
  }

  async ensureFolders() {
    const folders = ["Luna Notes", "Luna Notes/Cycles", "Luna Notes/Dashboard", "Luna Notes/Planning", "Luna Notes/Calendar", "Luna Notes/Analytics"];
    for (const folder of folders) {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }
    }
  }

  formatDate(date) {
    return date.toLocaleDateString(this.settings.language === "en" ? "en-US" : "ru-RU");
  }

  parseDateFlexible(text) {
    const value = text.trim();

    if (value.includes(".")) {
      const [day, month, year] = value.split(".");
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;

    return null;
  }

  findField(content, labels) {
    for (const label of labels) {
      const regex = new RegExp(`^${label}:[ \\t]*([^\\n\\r]*)`, "m");
      const match = content.match(regex);
      if (match && match[1]) return match[1].trim();
    }
    return "";
  }

  getFieldValue(content, key) {
    const aliases = {
      sleep: ["Сон", "Sleep"],
      pain: ["Боль", "Pain"],
      energy: ["Энергия", "Energy"],
      mood: ["Настроение", "Mood"],
      stress: ["Стресс", "Stress"],
      appetite: ["Аппетит", "Appetite"],
      workout: ["Тренировка", "Workout"],
      thoughts: ["Мысли дня", "Daily thoughts"]
    };

    return this.findField(content, aliases[key] || [key]);
  }

  getStartDateFromContent(content) {
    const value = this.findField(content, ["Дата начала", "Start date"]);
    if (!value) return null;
    return this.parseDateFlexible(value);
  }

  getEndDateFromContent(content) {
    const value = this.findField(content, ["Дата окончания", "End date"]);
    if (!value) return null;
    return this.parseDateFlexible(value);
  }

  getLatestCycleFile() {
    const folder = this.app.vault.getAbstractFileByPath("Luna Notes/Cycles");
    if (!folder || !folder.children.length) return null;

    return folder.children
      .filter(file => file.path.endsWith(".md"))
      .sort((a, b) => b.path.localeCompare(a.path))[0] || null;
  }

  getPhase(day) {
    const ovulationWindow = 5;
    const ovulationStart = this.settings.ovulationDay - Math.floor(ovulationWindow / 2);
    const ovulationEnd = this.settings.ovulationDay + Math.floor(ovulationWindow / 2);
    const pmsStart = this.settings.cycleLength - this.settings.pmsLength + 1;

    if (day <= this.settings.periodLength) return "period";
    if (day >= ovulationStart && day <= ovulationEnd) return "ovulation";
    if (day >= pmsStart) return "pms";
    if (day < ovulationStart) return "follicular";
    return "luteal";
  }

  getPhaseName(phase) {
    if (phase === "period") return this.t("periodPhase");
    if (phase === "follicular") return this.t("follicularPhase");
    if (phase === "ovulation") return this.t("ovulationPhase");
    if (phase === "pms") return this.t("pmsPhase");
    return this.t("lutealPhase");
  }

  getMoonPhase(date) {
    const knownNewMoon = new Date(2000, 0, 6);
    const lunarCycle = 29.53058867;
    const daysSince = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
    const moonAge = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;

    if (this.settings.language === "en") {
      if (moonAge < 1.85) return "New Moon";
      if (moonAge < 5.54) return "Waxing Crescent";
      if (moonAge < 9.23) return "First Quarter";
      if (moonAge < 12.92) return "Waxing Gibbous";
      if (moonAge < 16.61) return "Full Moon";
      if (moonAge < 20.30) return "Waning Gibbous";
      if (moonAge < 23.99) return "Last Quarter";
      if (moonAge < 27.68) return "Waning Crescent";
      return "New Moon";
    }

    if (moonAge < 1.85) return "Новолуние";
    if (moonAge < 5.54) return "Растущая Луна";
    if (moonAge < 9.23) return "Первая четверть";
    if (moonAge < 12.92) return "Прибывающая Луна";
    if (moonAge < 16.61) return "Полнолуние";
    if (moonAge < 20.30) return "Убывающая Луна";
    if (moonAge < 23.99) return "Последняя четверть";
    if (moonAge < 27.68) return "Старая Луна";
    return "Новолуние";
  }

  getRecommendations(phase) {
    if (phase === "period") return { mode: this.t("restMode"), energy: this.t("lowEnergy"), focus: this.t("focusSelfCare"), affirmation: this.t("affirmationPeriod") };
    if (phase === "follicular") return { mode: this.t("createMode"), energy: this.t("highEnergy"), focus: this.t("focusIdeas"), affirmation: this.t("affirmationFollicular") };
    if (phase === "ovulation") return { mode: this.t("socialMode"), energy: this.t("peakEnergy"), focus: this.t("focusVisible"), affirmation: this.t("affirmationOvulation") };
    if (phase === "pms") return { mode: this.t("protectionMode"), energy: this.t("pmsEnergy"), focus: this.t("focusLoad"), affirmation: this.t("affirmationPms") };
    return { mode: this.t("structureMode"), energy: this.t("mediumEnergy"), focus: this.t("focusStructure"), affirmation: this.t("affirmationLuteal") };
  }

  async startPeriod() {
    await this.ensureFolders();

    const today = new Date();
    const date = today.toISOString().split("T")[0];
    const path = `Luna Notes/Cycles/Cycle Log ${date}.md`;

    if (this.app.vault.getAbstractFileByPath(path)) {
      new Notice(this.t("alreadyExists"));
      return;
    }

    const nextPeriod = new Date(today);
    nextPeriod.setDate(today.getDate() + this.settings.cycleLength);

    const ovulationDate = new Date(today);
    ovulationDate.setDate(today.getDate() + this.settings.ovulationDay - 1);

    const pmsDate = new Date(today);
    pmsDate.setDate(today.getDate() + this.settings.cycleLength - this.settings.pmsLength);

    const content =
`# ${this.t("newCycleTitle")}

${this.t("startDate")}: ${this.formatDate(today)}
${this.t("status")}: ${this.t("active")}
${this.t("cycleDay")}: 1
${this.t("phase")}: ${this.getPhaseName("period")}
${this.t("lunarPhase")}: ${this.getMoonPhase(today)}

## ${this.t("forecast")}
${this.t("ovulationAround")}: ${this.formatDate(ovulationDate)}
${this.t("pmsAround")}: ${this.formatDate(pmsDate)}
${this.t("nextPeriodAround")}: ${this.formatDate(nextPeriod)}

## ${this.t("symptomTracker")}

${this.t("sleep")}:
${this.t("pain")}:
${this.t("energy")}:
${this.t("mood")}:
${this.t("stress")}:
${this.t("appetite")}:
${this.t("workout")}:
${this.t("thoughts")}:
`;

    await this.app.vault.create(path, content);
    new Notice(this.t("saved"));
  }

  async finishPeriod() {
    const latestFile = this.getLatestCycleFile();

    if (!latestFile) {
      new Notice(this.t("noCycle"));
      return;
    }

    let content = await this.app.vault.read(latestFile);

    if (content.includes(this.t("finished")) || content.includes("Завершены") || content.includes("Finished")) {
      new Notice(this.t("alreadyFinished"));
      return;
    }

    const startDate = this.getStartDateFromContent(content);

    if (!startDate) {
      new Notice(this.t("startNotFound"));
      return;
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + this.settings.periodLength - 1);

    content += `

## ${this.t("finishCycleTitle")}
${this.t("endDate")}: ${this.formatDate(endDate)}
${this.t("periodDuration")}: ${this.settings.periodLength} ${this.settings.language === "en" ? "days" : "дней"}
${this.t("status")}: ${this.t("finished")}
`;

    await this.app.vault.modify(latestFile, content);
    new Notice(this.t("finishedNotice"));
  }

  async getCurrentCycleData() {
    const latestFile = this.getLatestCycleFile();
    if (!latestFile) return null;

    const content = await this.app.vault.read(latestFile);
    const startDate = this.getStartDateFromContent(content);

    if (!startDate) return null;

    const today = new Date();
    const day = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const phase = this.getPhase(day);
    const moon = this.getMoonPhase(today);
    const recommendations = this.getRecommendations(phase);

    return { day, phase, moon, recommendations, startDate, content };
  }

  async showCurrentPhase() {
    const data = await this.getCurrentCycleData();

    if (!data) {
      new Notice(this.t("noData"));
      return;
    }

    const { day, phase, moon, recommendations } = data;

    new Notice(
`${this.t("cycleDay")}: ${day}
${this.t("phase")}: ${this.getPhaseName(phase)}
${this.t("moon")}: ${moon}
${this.t("energy")}: ${recommendations.energy}
${this.t("focus")}: ${recommendations.focus}`, 12000);
  }

  async createLunaDashboard() {
    await this.ensureFolders();

    const data = await this.getCurrentCycleData();
    if (!data) {
      new Notice(this.t("noData"));
      return;
    }

    const { day, phase, recommendations, content } = data;

    const dashboard =
`---
cssclasses:
  - luna-dashboard
---

# ${this.t("dashboardTitle")}

## ${this.t("today")}

| ${this.t("block")} | ${this.t("value")} |
|---|---|
| ${this.t("cycleDay")} | ${day} |
| ${this.t("phase")} | ${this.getPhaseName(phase)} |
| ${this.t("energy")} | ${recommendations.energy} |
| ${this.t("mode")} | ${recommendations.mode} |
| ${this.t("focus")} | ${recommendations.focus} |

## ${this.t("quickAccess")}

- [[Luna Notes/Planning/Luna Life Planner]]
- [[Luna Notes/Calendar/Luna Cycle Calendar]]
- [[Luna Notes/Analytics/Cycle Analytics]]
- [[Luna Notes/Analytics/AI Pattern Tracker]]
- [[Luna Notes/Analytics/Phase Intelligence]]

## ${this.t("wellbeing")}

| ${this.t("indicator")} | ${this.t("today")} |
|---|---|
| ${this.t("sleep")} | ${this.getFieldValue(content, "sleep") || "—"} |
| ${this.t("pain")} | ${this.getFieldValue(content, "pain") || "—"} |
| ${this.t("mood")} | ${this.getFieldValue(content, "mood") || "—"} |
| ${this.t("stress")} | ${this.getFieldValue(content, "stress") || "—"} |
| ${this.t("appetite")} | ${this.getFieldValue(content, "appetite") || "—"} |
| ${this.t("workout")} | ${this.getFieldValue(content, "workout") || "—"} |

## ${this.t("support")}

${recommendations.affirmation}

## ${this.t("observation")}

- ${this.t("q1")}
- ${this.t("q2")}
- ${this.t("q3")}
- ${this.t("q4")}
`;

    const path = "Luna Notes/Dashboard/Luna Dashboard.md";
    const existingFile = this.app.vault.getAbstractFileByPath(path);

    if (existingFile) {
      await this.app.vault.modify(existingFile, dashboard);
      new Notice(this.t("updatedDashboard"));
      return;
    }

    await this.app.vault.create(path, dashboard);
    new Notice(this.t("createdDashboard"));
  }

  async createLifePlanner() {
    await this.ensureFolders();

    const data = await this.getCurrentCycleData();
    if (!data) {
      new Notice(this.t("noData"));
      return;
    }

    const { day, phase, recommendations } = data;

    const planner =
`---
cssclasses:
  - luna-page
---

# ${this.t("lifePlannerTitle")}

## ${this.t("today")}

| ${this.t("block")} | ${this.t("value")} |
|---|---|
| ${this.t("cycleDay")} | ${day} |
| ${this.t("phase")} | ${this.getPhaseName(phase)} |
| ${this.t("energy")} | ${recommendations.energy} |
| ${this.t("mode")} | ${recommendations.mode} |
| ${this.t("focus")} | ${recommendations.focus} |

## ${this.t("myDay")}

### ${this.t("morning")}
${this.t("morningItems").map(item => `- ${item}`).join("\n")}

### ${this.t("day")}
${this.t("dayItems").map(item => `- ${item}`).join("\n")}

### ${this.t("evening")}
${this.t("eveningItems").map(item => `- ${item}`).join("\n")}

## ${this.t("support")}

${recommendations.affirmation}

## ${this.t("myThoughts")}

- ${this.t("q1")}
- ${this.t("q3")}

## ${this.t("victory")}

-

## ${this.t("gratitude")}

-
`;

    const path = "Luna Notes/Planning/Luna Life Planner.md";
    const existingFile = this.app.vault.getAbstractFileByPath(path);

    if (existingFile) {
      await this.app.vault.modify(existingFile, planner);
      new Notice(this.t("updatedPlanner"));
      return;
    }

    await this.app.vault.create(path, planner);
    new Notice(this.t("createdPlanner"));
  }

  async createCycleCalendar() {
    await this.ensureFolders();

    const data = await this.getCurrentCycleData();
    if (!data) {
      new Notice(this.t("noData"));
      return;
    }

    const { startDate } = data;
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let calendar =
`---
cssclasses:
  - luna-calendar
---

# ${this.t("calendarTitle")}

<div class="luna-calendar-card">

<div class="luna-calendar-grid luna-calendar-weekdays">
<div>${this.t("monday")}</div>
<div>${this.t("tuesday")}</div>
<div>${this.t("wednesday")}</div>
<div>${this.t("thursday")}</div>
<div>${this.t("friday")}</div>
<div>${this.t("saturday")}</div>
<div>${this.t("sunday")}</div>
</div>

<div class="luna-calendar-grid">
`;

    let firstWeekDay = firstDay.getDay();
    if (firstWeekDay === 0) firstWeekDay = 7;

    for (let i = 1; i < firstWeekDay; i++) {
      calendar += `<div></div>\n`;
    }

    for (let dateNumber = 1; dateNumber <= lastDay.getDate(); dateNumber++) {
      const currentDate = new Date(year, month, dateNumber);
      const diff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
      const cycleDay = ((diff % this.settings.cycleLength) + this.settings.cycleLength) % this.settings.cycleLength + 1;
      const phase = this.getPhase(cycleDay);

      const isToday =
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getDate() === today.getDate();

      const todayClass = isToday ? " luna-today" : "";
      calendar += `<div><span class="luna-cal-day luna-${phase}${todayClass}">${dateNumber}</span></div>\n`;
    }

    calendar += `</div>

</div>

## ${this.t("phases")}

<div class="luna-legend-card">
  <div class="luna-legend-row"><span class="luna-legend-dot luna-period"></span><div class="luna-legend-text"><strong>${this.t("period")}</strong><span>${this.t("periodDesc")}</span></div></div>
  <div class="luna-legend-row"><span class="luna-legend-dot luna-follicular"></span><div class="luna-legend-text"><strong>${this.t("follicular")}</strong><span>${this.t("follicularDesc")}</span></div></div>
  <div class="luna-legend-row"><span class="luna-legend-dot luna-ovulation"></span><div class="luna-legend-text"><strong>${this.t("ovulation")}</strong><span>${this.t("ovulationDesc")}</span></div></div>
  <div class="luna-legend-row"><span class="luna-legend-dot luna-luteal"></span><div class="luna-legend-text"><strong>${this.t("luteal")}</strong><span>${this.t("lutealDesc")}</span></div></div>
  <div class="luna-legend-row"><span class="luna-legend-dot luna-pms"></span><div class="luna-legend-text"><strong>${this.t("pms")}</strong><span>${this.t("pmsDesc")}</span></div></div>
</div>
`;

    const path = "Luna Notes/Calendar/Luna Cycle Calendar.md";
    const existingFile = this.app.vault.getAbstractFileByPath(path);

    if (existingFile) {
      await this.app.vault.modify(existingFile, calendar);
      new Notice(this.t("updatedCalendar"));
      return;
    }

    await this.app.vault.create(path, calendar);
    new Notice(this.t("createdCalendar"));
  }

  async createCycleAnalytics() {
    await this.ensureFolders();

    const folder = this.app.vault.getAbstractFileByPath("Luna Notes/Cycles");
    if (!folder || !folder.children.length) {
      new Notice(this.t("noCycle"));
      return;
    }

    const files = folder.children.filter(file => file.path.endsWith(".md")).sort((a, b) => a.path.localeCompare(b.path));
    const cycles = [];

    for (const file of files) {
      const content = await this.app.vault.read(file);
      const startDate = this.getStartDateFromContent(content);
      const endDate = this.getEndDateFromContent(content);

      if (!startDate) continue;
      cycles.push({ startDate, endDate });
    }

    const periodLengths = cycles
      .filter(cycle => cycle.endDate)
      .map(cycle => Math.round((cycle.endDate - cycle.startDate) / (1000 * 60 * 60 * 24)) + 1);

    const averagePeriodLength = periodLengths.length
      ? `${(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length).toFixed(1)} ${this.settings.language === "en" ? "days" : "дней"}`
      : this.t("notEnough");

    const lastCycle = cycles.length ? this.formatDate(cycles[cycles.length - 1].startDate) : "—";

    let analytics =
`---
cssclasses:
  - luna-page
---

# ${this.t("analyticsTitle")}

## ${this.t("generalStats")}

| ${this.t("parameter")} | ${this.t("value")} |
|---|---|
| ${this.t("totalCycles")} | ${cycles.length} |
| ${this.t("avgCycle")} | ${this.t("notEnough")} |
| ${this.t("avgPeriod")} | ${averagePeriodLength} |
| ${this.t("regularity")} | ${this.t("notEnough")} |
| ${this.t("lastCycle")} | ${lastCycle} |

## ${this.t("cycleHistory")}

| ${this.t("cycle")} | ${this.t("start")} | ${this.t("end")} | ${this.t("status")} |
|---|---|---|---|
`;

    for (let i = 0; i < cycles.length; i++) {
      const cycle = cycles[i];
      analytics += `| ${i + 1} | ${this.formatDate(cycle.startDate)} | ${cycle.endDate ? this.formatDate(cycle.endDate) : "—"} | ${cycle.endDate ? this.t("completed") : this.t("current")} |\n`;
    }

    analytics += `

## ${this.t("willShow")}

${this.t("analyticsItems").map(item => `- ${item}`).join("\n")}

## ${this.t("conclusion")}

${this.t("analyticsConclusion")}
`;

    const path = "Luna Notes/Analytics/Cycle Analytics.md";
    const existingFile = this.app.vault.getAbstractFileByPath(path);

    if (existingFile) {
      await this.app.vault.modify(existingFile, analytics);
      new Notice(this.t("updatedAnalytics"));
      return;
    }

    await this.app.vault.create(path, analytics);
    new Notice(this.t("createdAnalytics"));
  }

  async createPatternTracker() {
    await this.ensureFolders();

    const latestFile = this.getLatestCycleFile();
    if (!latestFile) {
      new Notice(this.t("noCycle"));
      return;
    }

    const content = await this.app.vault.read(latestFile);

    const report =
`---
cssclasses:
  - luna-page
---

# ${this.t("patternTitle")}

## ${this.t("latestData")}

| ${this.t("parameter")} | ${this.t("value")} |
|---|---|
| ${this.t("sleep")} | ${this.getFieldValue(content, "sleep") || "—"} |
| ${this.t("pain")} | ${this.getFieldValue(content, "pain") || "—"} |
| ${this.t("energy")} | ${this.getFieldValue(content, "energy") || "—"} |
| ${this.t("appetite")} | ${this.getFieldValue(content, "appetite") || "—"} |
| ${this.t("workout")} | ${this.getFieldValue(content, "workout") || "—"} |

## ${this.t("track")}

${this.t("trackItems").map(item => `- ${item}`).join("\n")}

## ${this.t("conclusion")}

${this.t("trackerConclusion")}
`;

    const path = "Luna Notes/Analytics/AI Pattern Tracker.md";
    const existingFile = this.app.vault.getAbstractFileByPath(path);

    if (existingFile) {
      await this.app.vault.modify(existingFile, report);
      new Notice(this.t("updatedTracker"));
      return;
    }

    await this.app.vault.create(path, report);
    new Notice(this.t("createdTracker"));
  }

  async createPhaseIntelligence() {
    await this.ensureFolders();

    const data = await this.getCurrentCycleData();
    if (!data) {
      new Notice(this.t("noData"));
      return;
    }

    const { phase, content } = data;

    const report =
`---
cssclasses:
  - luna-page
---

# ${this.t("phaseTitle")}

## ${this.t("currentPhase")}

| ${this.t("parameter")} | ${this.t("value")} |
|---|---|
| ${this.t("phase")} | ${this.getPhaseName(phase)} |
| ${this.t("sleep")} | ${this.getFieldValue(content, "sleep") || "—"} |
| ${this.t("pain")} | ${this.getFieldValue(content, "pain") || "—"} |
| ${this.t("energy")} | ${this.getFieldValue(content, "energy") || "—"} |
| ${this.t("appetite")} | ${this.getFieldValue(content, "appetite") || "—"} |
| ${this.t("workout")} | ${this.getFieldValue(content, "workout") || "—"} |

## ${this.t("pageShows")}

${this.t("phaseItems").map(item => `- ${item}`).join("\n")}

## ${this.t("conclusion")}

${this.t("phaseConclusion")}
`;

    const path = "Luna Notes/Analytics/Phase Intelligence.md";
    const existingFile = this.app.vault.getAbstractFileByPath(path);

    if (existingFile) {
      await this.app.vault.modify(existingFile, report);
      new Notice(this.t("updatedPhase"));
      return;
    }

    await this.app.vault.create(path, report);
    new Notice(this.t("createdPhase"));
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
};

class LunaNotesSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: this.plugin.t("settingsTitle") });

    new Setting(containerEl)
      .setName(this.plugin.t("languageSetting"))
      .setDesc(this.plugin.t("languageDesc"))
      .addDropdown(dropdown =>
        dropdown
          .addOption("ru", "Русский")
          .addOption("en", "English")
          .setValue(this.plugin.settings.language)
          .onChange(async value => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
            new Notice("Language saved. Restart Luna Notes.");
          })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("cycleLengthSetting"))
      .addText(text =>
        text.setValue(String(this.plugin.settings.cycleLength)).onChange(async value => {
          this.plugin.settings.cycleLength = Number(value);
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("periodLengthSetting"))
      .addText(text =>
        text.setValue(String(this.plugin.settings.periodLength)).onChange(async value => {
          this.plugin.settings.periodLength = Number(value);
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("ovulationDaySetting"))
      .addText(text =>
        text.setValue(String(this.plugin.settings.ovulationDay)).onChange(async value => {
          this.plugin.settings.ovulationDay = Number(value);
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(this.plugin.t("pmsLengthSetting"))
      .addText(text =>
        text.setValue(String(this.plugin.settings.pmsLength)).onChange(async value => {
          this.plugin.settings.pmsLength = Number(value);
          await this.plugin.saveSettings();
        })
      );
  }
}