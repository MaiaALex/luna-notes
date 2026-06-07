const { Plugin, Notice, PluginSettingTab, Setting, Modal } = require("obsidian");

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

    this.registerDomEvent(document, "click", async (event) => await this.handleTrackerDocumentClick(event));

    this.addRibbonIcon("heart", this.t("startPeriod"), async () => await this.startPeriod());

    this.addCommand({ id: "start-period", name: this.t("startPeriod"), callback: async () => await this.startPeriod() });
    this.addCommand({ id: "add-past-cycle", name: this.t("addPastCycle"), callback: async () => await this.addPastCycle() });
    this.addCommand({ id: "finish-period", name: this.t("finishPeriod"), callback: async () => await this.finishPeriod() });
    this.addCommand({ id: "show-current-phase", name: this.t("showCurrentPhase"), callback: async () => await this.showCurrentPhase() });
    this.addCommand({ id: "create-luna-dashboard", name: this.t("createDashboard"), callback: async () => await this.createDashboard() });
    this.addCommand({ id: "create-cycle-calendar", name: this.t("createCalendar"), callback: async () => await this.createCalendar() });

  }

  t(key) {
    const ru = {
      startPeriod: "Начались месячные",
      addPastCycle: "Добавить прошлый цикл",
      finishPeriod: "Закончились месячные",
      showCurrentPhase: "Показать сегодняшнюю фазу",
      createDashboard: "Создать Luna Dashboard",
      createCalendar: "Создать Luna Cycle Calendar",
      saved: "Сохранено",
      cycleSaved: "Цикл сохранён",
      pastCycleSaved: "Прошлый цикл сохранён",
      finishedNotice: "Месячные завершены",
      invalidDate: "Проверь даты",
      alreadyExists: "Такая запись уже есть",
      noCycle: "Нет записи цикла",
      trackerSaved: "Трекер сохранён",
      newCycleTitle: "Начало месячных",
      startDate: "Дата начала",
      endDate: "Дата окончания",
      status: "Статус",
      active: "Активен",
      finished: "Завершены",
      cycleDay: "День цикла",
      phase: "Фаза",
      lunarPhase: "Лунная фаза",
      actualDates: "Фактические даты",
      periodDuration: "Длительность месячных",
      actualOvulation: "Овуляция фактически",
      forecast: "Прогноз",
      ovulationAround: "Овуляция примерно",
      pmsAround: "ПМС примерно с",
      nextPeriodAround: "Следующие месячные примерно",
      symptomTracker: "Симптом-трекер",
      finishCycleTitle: "Завершение цикла",
      sleep: "Сон",
      pain: "Боль",
      energy: "Энергия",
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
      dashboardTitle: "Luna Dashboard",
      calendarTitle: "Luna Cycle Calendar",
      today: "Сегодня",
      supportPms: "Больше заботы и отдыха. Не требуй от себя многого.",
      supportPeriod: "Тело просит мягкости. Можно замедлиться.",
      supportDefault: "Отмечай состояние коротко, без лишней писанины.",
      settingsTitle: "Luna Notes — настройки",
      languageSetting: "Язык",
      cycleLengthSetting: "Длина цикла",
      periodLengthSetting: "Длительность месячных",
      ovulationDaySetting: "День овуляции",
      pmsLengthSetting: "Длительность ПМС"
    };

    const en = {
      startPeriod: "Start period",
      addPastCycle: "Add past cycle",
      finishPeriod: "Finish period",
      showCurrentPhase: "Show current phase",
      createDashboard: "Create Luna Dashboard",
      createCalendar: "Create Luna Cycle Calendar",
      saved: "Saved",
      cycleSaved: "Cycle saved",
      pastCycleSaved: "Past cycle saved",
      finishedNotice: "Period finished",
      invalidDate: "Check dates",
      alreadyExists: "This record already exists",
      noCycle: "No cycle record",
      trackerSaved: "Tracker saved",
      newCycleTitle: "Period started",
      startDate: "Start date",
      endDate: "End date",
      status: "Status",
      active: "Active",
      finished: "Finished",
      cycleDay: "Cycle day",
      phase: "Phase",
      lunarPhase: "Moon phase",
      actualDates: "Actual dates",
      periodDuration: "Period length",
      actualOvulation: "Actual ovulation",
      forecast: "Forecast",
      ovulationAround: "Ovulation around",
      pmsAround: "PMS around",
      nextPeriodAround: "Next period around",
      symptomTracker: "Symptom tracker",
      finishCycleTitle: "Cycle finish",
      sleep: "Sleep",
      pain: "Pain",
      energy: "Energy",
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
      dashboardTitle: "Luna Dashboard",
      calendarTitle: "Luna Cycle Calendar",
      today: "Today",
      supportPms: "More care and rest. Do not demand too much from yourself.",
      supportPeriod: "Your body asks for softness. You can slow down.",
      supportDefault: "Track gently, without over-writing.",
      settingsTitle: "Luna Notes settings",
      languageSetting: "Language",
      cycleLengthSetting: "Cycle length",
      periodLengthSetting: "Period length",
      ovulationDaySetting: "Ovulation day",
      pmsLengthSetting: "PMS length"
    };

    return (this.settings.language === "en" ? en : ru)[key] || key;
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async ensureFolders() {
    const folders = [
      "Luna Notes",
      "Luna Notes/Cycles",
      "Luna Notes/Dashboard",
      "Luna Notes/Calendar"
    ];

    for (const folder of folders) {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }
    }
  }

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  toFileDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  parseDate(value) {
    if (!value) return null;
    const trimmed = String(value).trim();
    const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

    const ru = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (ru) return new Date(Number(ru[3]), Number(ru[2]) - 1, Number(ru[1]));

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  daysBetween(startDate, endDate) {
    return Math.floor((endDate - startDate) / 86400000) + 1;
  }

  formatDays(count) {
    if (this.settings.language === "en") return `${count} ${count === 1 ? "day" : "days"}`;
    const mod10 = count % 10;
    const mod100 = count % 100;
    const word = mod10 === 1 && mod100 !== 11
      ? "день"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? "дня"
        : "дней";
    return `${count} ${word}`;
  }

  findField(content, labels) {
    for (const label of labels) {
      const match = content.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
      if (match) return match[1].trim();
    }
    return "";
  }

  getStartDateFromContent(content) {
    return this.parseDate(this.findField(content, ["Дата начала", "Start date"]));
  }

  getEndDateFromContent(content) {
    return this.parseDate(this.findField(content, ["Дата окончания", "End date"]));
  }

  getActualOvulationFromContent(content) {
    return this.findField(content, ["Овуляция фактически", "Actual ovulation"]);
  }

  getLatestCycleFile() {
    const folder = this.app.vault.getAbstractFileByPath("Luna Notes/Cycles");
    if (!folder || !folder.children?.length) return null;
    return folder.children
      .filter(file => file.path.endsWith(".md"))
      .sort((a, b) => b.path.localeCompare(a.path))[0] || null;
  }

  getTargetCycleFile() {
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile && activeFile.path.startsWith("Luna Notes/Cycles/") && activeFile.path.endsWith(".md")) {
      return activeFile;
    }
    return this.getLatestCycleFile();
  }

  async getCycleHistory() {
    const folder = this.app.vault.getAbstractFileByPath("Luna Notes/Cycles");
    if (!folder || !folder.children?.length) return [];
    const cycles = [];

    for (const file of folder.children.filter(file => file.path.endsWith(".md"))) {
      const content = await this.app.vault.read(file);
      const startDate = this.getStartDateFromContent(content);
      if (!startDate) continue;
      cycles.push({
        file,
        content,
        startDate,
        endDate: this.getEndDateFromContent(content),
        ovulation: this.getActualOvulationFromContent(content)
      });
    }

    return cycles.sort((a, b) => a.startDate - b.startDate);
  }

  getPhase(day) {
    const ovulationStart = this.settings.ovulationDay - 3;
    const ovulationEnd = this.settings.ovulationDay + 3;
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

  getMoonPhaseData(date) {
    const knownNewMoon = new Date(2000, 0, 6);
    const lunarCycle = 29.53058867;
    const daysSince = (date - knownNewMoon) / 86400000;
    const moonAge = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;

    if (this.settings.language === "en") {
      if (moonAge < 1.85) return { icon: "🌑", name: "New Moon" };
      if (moonAge < 5.54) return { icon: "🌒", name: "Waxing Crescent" };
      if (moonAge < 9.23) return { icon: "🌓", name: "First Quarter" };
      if (moonAge < 12.92) return { icon: "🌔", name: "Waxing Gibbous" };
      if (moonAge < 16.61) return { icon: "🌕", name: "Full Moon" };
      if (moonAge < 20.30) return { icon: "🌖", name: "Waning Gibbous" };
      if (moonAge < 23.99) return { icon: "🌗", name: "Last Quarter" };
      if (moonAge < 27.68) return { icon: "🌘", name: "Waning Crescent" };
      return { icon: "🌑", name: "New Moon" };
    }

    if (moonAge < 1.85) return { icon: "🌑", name: "Новолуние" };
    if (moonAge < 5.54) return { icon: "🌒", name: "Растущая Луна" };
    if (moonAge < 9.23) return { icon: "🌓", name: "Первая четверть" };
    if (moonAge < 12.92) return { icon: "🌔", name: "Прибывающая Луна" };
    if (moonAge < 16.61) return { icon: "🌕", name: "Полнолуние" };
    if (moonAge < 20.30) return { icon: "🌖", name: "Убывающая Луна" };
    if (moonAge < 23.99) return { icon: "🌗", name: "Последняя четверть" };
    if (moonAge < 27.68) return { icon: "🌘", name: "Старая Луна" };
    return { icon: "🌑", name: "Новолуние" };
  }

  getTrackerFields() {
    return [
      { key: "sleep", label: this.t("sleep") },
      { key: "pain", label: this.t("pain") },
      { key: "energy", label: this.t("energy") },
      { key: "mood", label: this.t("mood") },
      { key: "stress", label: this.t("stress") },
      { key: "appetite", label: this.t("appetite") },
      { key: "workout", label: this.t("workout") }
    ];
  }

  formatTrackerValue(value) {
    const rating = Number(String(value || "").match(/[1-5]/)?.[0] || 0);
    if (!rating) return "○ ○ ○ ○ ○";
    const dots = Array.from({ length: 5 }, (_, index) => index < rating ? "●" : "○").join(" ");
    return `${dots} ${rating}/5`;
  }

  readTrackerValue(value) {
    const rating = Number(String(value || "").match(/[1-5]/)?.[0] || 0);
    return rating ? `${rating}/5` : "";
  }

  buildSymptomTrackerContent(values = {}) {
    const rows = this.getTrackerFields().map(field => {
      const selected = Number(String(values[field.key] || "").match(/[1-5]/)?.[0] || 0);
      const dots = Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const activeClass = selected >= value ? " is-selected" : "";
        return `<button type="button" class="luna-note-dot${activeClass}" data-luna-field="${field.key}" data-luna-value="${value}" aria-label="${field.label}: ${value}/5"><span>${value}</span></button>`;
      }).join("");
      return `<div class="luna-note-tracker-row" data-luna-row="${field.key}"><strong>${field.label}</strong><div class="luna-note-scale">${dots}</div></div>`;
    }).join("\n");
    const thoughts = this.escapeHtml(values.thoughts || "");
    return `<div class="luna-note-tracker" data-luna-tracker="true">
  <div class="luna-note-tracker-head">
    <strong>Отметь мышью</strong>
    <span>Сохранится в этот цикл</span>
  </div>
  <div class="luna-note-tracker-grid">
${rows}
  </div>
  <label class="luna-note-thoughts">
    <strong>${this.t("thoughts")}</strong>
    <textarea data-luna-thoughts placeholder="чувствую...">${thoughts}</textarea>
  </label>
  <button type="button" class="luna-note-save" data-luna-save-thoughts="true">Сохранить мысли</button>
</div>`;
  }

  parseSymptomTracker(content) {
    const values = {};
    for (const field of this.getTrackerFields()) {
      const htmlMatch = content.match(new RegExp(`data-luna-field="${field.key}" data-luna-value="([1-5])"[^>]*class="[^"]*is-selected`, "m"))
        || content.match(new RegExp(`class="[^"]*is-selected[^"]*"[^>]*data-luna-field="${field.key}"[^>]*data-luna-value="([1-5])"`, "m"));
      const textMatch = content.match(new RegExp(`^${field.label}:[ \\t]*(.+)$`, "m"));
      const value = htmlMatch ? `${htmlMatch[1]}/5` : textMatch ? textMatch[1].trim() : "";
      values[field.key] = this.readTrackerValue(value);
    }
    const htmlThoughts = content.match(/<textarea[^>]*data-luna-thoughts[^>]*>([\s\S]*?)<\/textarea>/m);
    const textThoughts = content.match(new RegExp(`^${this.t("thoughts")}:[ \\t]*(.*)$`, "m"));
    values.thoughts = htmlThoughts ? this.unescapeHtml(htmlThoughts[1].trim()) : textThoughts ? textThoughts[1].trim() : "";
    return values;
  }

  replaceSymptomTracker(content, values) {
    const tracker = this.buildSymptomTrackerContent(values);
    const header = `## ${this.t("symptomTracker")}`;
    const finishHeader = `\n## ${this.t("finishCycleTitle")}`;
    const startIndex = content.indexOf(header);
    if (startIndex === -1) return `${content.trim()}\n\n${header}\n\n${tracker}\n`;
    const trackerStart = startIndex + header.length;
    const finishIndex = content.indexOf(finishHeader, trackerStart);
    if (finishIndex === -1) return `${content.slice(0, trackerStart).trimEnd()}\n\n${tracker}\n`;
    return `${content.slice(0, trackerStart).trimEnd()}\n\n${tracker}\n${content.slice(finishIndex)}`;
  }

  async saveSymptomTracker(file, values) {
    const content = await this.app.vault.read(file);
    await this.app.vault.modify(file, this.replaceSymptomTracker(content, values));
  }

  async handleTrackerDocumentClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const dot = target.closest(".luna-note-dot");
    const saveThoughts = target.closest("[data-luna-save-thoughts]");
    if (!dot && !saveThoughts) return;

    const tracker = target.closest(".luna-note-tracker");
    const file = this.app.workspace.getActiveFile();
    if (!tracker || !file || !file.path.startsWith("Luna Notes/")) return;

    event.preventDefault();
    event.stopPropagation();

    const content = await this.app.vault.read(file);
    const values = this.parseSymptomTracker(content);

    if (dot) {
      const field = dot.getAttribute("data-luna-field");
      const value = dot.getAttribute("data-luna-value");
      if (!field || !value) return;
      values[field] = values[field] === `${value}/5` ? "" : `${value}/5`;
    }

    const thoughts = tracker.querySelector("[data-luna-thoughts]");
    if (thoughts instanceof HTMLTextAreaElement) values.thoughts = thoughts.value.trim();

    await this.saveSymptomTracker(file, values);
    new Notice(this.t("trackerSaved"));
  }

  escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  unescapeHtml(value) {
    return String(value || "")
      .replaceAll("&quot;", '"')
      .replaceAll("&gt;", ">")
      .replaceAll("&lt;", "<")
      .replaceAll("&amp;", "&");
  }

  getSupportText(phase) {
    if (phase === "period") return this.t("supportPeriod");
    if (phase === "pms") return this.t("supportPms");
    return this.t("supportDefault");
  }

  buildPhaseStrip(periodLength, ovulationStart, ovulationEnd, cycleLength) {
    let strip = "";
    for (let day = 1; day <= 35; day++) {
      let phase = "waiting";
      if (day <= cycleLength) {
        if (day <= periodLength) phase = "period";
        else if (day >= ovulationStart && day <= ovulationEnd) phase = "ovulation";
        else if (day >= cycleLength - this.settings.pmsLength + 1) phase = "pms";
        else if (day < ovulationStart) phase = "follicular";
        else phase = "luteal";
      }
      strip += `<span class="luna-strip-day luna-${phase}"></span>`;
    }
    return `<div class="luna-cycle-strip">${strip}</div>`;
  }

  buildCycleLogContent(startDate, endDate = null, actualOvulation = "") {
    const periodLength = endDate ? this.daysBetween(startDate, endDate) : this.settings.periodLength;
    const nextPeriod = new Date(startDate);
    nextPeriod.setDate(startDate.getDate() + this.settings.cycleLength);
    const ovulationStart = new Date(startDate);
    ovulationStart.setDate(startDate.getDate() + this.settings.ovulationDay - 3);
    const ovulationEnd = new Date(startDate);
    ovulationEnd.setDate(startDate.getDate() + this.settings.ovulationDay + 3);
    const pmsStart = new Date(startDate);
    pmsStart.setDate(startDate.getDate() + this.settings.cycleLength - this.settings.pmsLength);
    const moon = this.getMoonPhaseData(startDate);

    return `---
cssclasses:
  - luna-page
---

# ${this.t("newCycleTitle")}

<div class="luna-hero-card">
  <div>
    <p class="luna-kicker">${this.t("phase")}</p>
    <h2>${this.getPhaseName("period")}</h2>
    <p>${this.t("lunarPhase")}: ${moon.icon}</p>
  </div>
  <div class="luna-hero-orbit">
    <span>1</span>
    <small>${this.t("cycleDay")}</small>
  </div>
</div>

%%
${this.t("startDate")}: ${this.formatDate(startDate)}
${this.t("status")}: ${endDate ? this.t("finished") : this.t("active")}
${this.t("cycleDay")}: 1
${this.t("phase")}: ${this.getPhaseName("period")}
${this.t("lunarPhase")}: ${moon.name}
${endDate ? `${this.t("endDate")}: ${this.formatDate(endDate)}` : ""}
${actualOvulation ? `${this.t("actualOvulation")}: ${actualOvulation}` : ""}
%%

${this.buildPhaseStrip(periodLength, this.settings.ovulationDay - 3, this.settings.ovulationDay + 3, this.settings.cycleLength)}

<div class="luna-metric-grid">
  <div class="luna-metric-card"><strong>${this.formatDate(startDate)}</strong><span>${this.t("startDate")}</span></div>
  <div class="luna-metric-card"><strong>${endDate ? this.formatDate(endDate) : "—"}</strong><span>${this.t("endDate")}</span></div>
  <div class="luna-metric-card"><strong>${moon.icon}</strong><span>${this.t("lunarPhase")}</span></div>
</div>

## ${this.t("actualDates")}

<div class="luna-metric-grid">
  <div class="luna-metric-card"><strong>${endDate ? this.formatDate(endDate) : "—"}</strong><span>${this.t("endDate")}</span></div>
  <div class="luna-metric-card"><strong>${this.formatDays(periodLength)}</strong><span>${this.t("periodDuration")}</span></div>
  <div class="luna-metric-card"><strong>${actualOvulation || "—"}</strong><span>${this.t("actualOvulation")}</span></div>
</div>

## ${this.t("forecast")}

<div class="luna-metric-grid">
  <div class="luna-metric-card"><strong>${this.formatDate(ovulationStart)} - ${this.formatDate(ovulationEnd)}</strong><span>${this.t("ovulationAround")}</span></div>
  <div class="luna-metric-card"><strong>${this.formatDate(pmsStart)}</strong><span>${this.t("pmsAround")}</span></div>
  <div class="luna-metric-card"><strong>${this.formatDate(nextPeriod)}</strong><span>${this.t("nextPeriodAround")}</span></div>
</div>

## ${this.t("symptomTracker")}

${this.buildSymptomTrackerContent()}

${endDate ? `## ${this.t("finishCycleTitle")}

<div class="luna-metric-grid">
  <div class="luna-metric-card"><strong>${this.formatDate(endDate)}</strong><span>${this.t("endDate")}</span></div>
  <div class="luna-metric-card"><strong>${this.formatDays(periodLength)}</strong><span>${this.t("periodDuration")}</span></div>
  <div class="luna-metric-card"><strong>${this.t("finished")}</strong><span>${this.t("status")}</span></div>
</div>
` : ""}`;
  }

  async startPeriod() {
    await this.ensureFolders();
    const today = new Date();
    const path = `Luna Notes/Cycles/Cycle Log ${this.toFileDate(today)}.md`;
    if (this.app.vault.getAbstractFileByPath(path)) {
      new Notice(this.t("alreadyExists"));
      return;
    }
    await this.app.vault.create(path, this.buildCycleLogContent(today));
    new Notice(this.t("cycleSaved"));
  }

  async addPastCycle() {
    await this.ensureFolders();
    new AddPastCycleModal(this.app, this).open();
  }

  async savePastCycle(startValue, endValue) {
    const startDate = this.parseDate(startValue);
    const endDate = this.parseDate(endValue);
    if (!startDate || !endDate || endDate < startDate) {
      new Notice(this.t("invalidDate"));
      return;
    }
    const path = `Luna Notes/Cycles/Cycle Log ${this.toFileDate(startDate)}.md`;
    if (this.app.vault.getAbstractFileByPath(path)) {
      new Notice(this.t("alreadyExists"));
      return;
    }
    await this.app.vault.create(path, this.buildCycleLogContent(startDate, endDate));
    new Notice(this.t("pastCycleSaved"));
  }

  async finishPeriod() {
    const file = this.getTargetCycleFile();
    if (!file) {
      new Notice(this.t("noCycle"));
      return;
    }
    const content = await this.app.vault.read(file);
    if (this.getEndDateFromContent(content)) {
      new Notice(this.t("finishedNotice"));
      return;
    }
    const today = new Date();
    let updated = content.replace(new RegExp(`^${this.t("status")}:.*$`, "m"), `${this.t("status")}: ${this.t("finished")}`);
    updated = updated.replace(/(%%[\s\S]*?)(\n%%)/, `$1\n${this.t("endDate")}: ${this.formatDate(today)}$2`);
    updated = updated.trimEnd() + `\n\n## ${this.t("finishCycleTitle")}\n\n${this.t("endDate")}: ${this.formatDate(today)}\n${this.t("status")}: ${this.t("finished")}\n`;
    await this.app.vault.modify(file, updated);
    new Notice(this.t("finishedNotice"));
  }

  async showCurrentPhase() {
    const file = this.getTargetCycleFile();
    if (!file) {
      new Notice(this.t("noCycle"));
      return;
    }
    const content = await this.app.vault.read(file);
    const startDate = this.getStartDateFromContent(content);
    if (!startDate) {
      new Notice(this.t("noCycle"));
      return;
    }
    const day = Math.max(1, this.daysBetween(startDate, new Date()));
    const phase = this.getPhase(day);
    new Notice(`${this.t("cycleDay")}: ${day}\n${this.t("phase")}: ${this.getPhaseName(phase)}\n${this.getSupportText(phase)}`, 9000);
  }

  async createDashboard() {
    await this.ensureFolders();
    const cycles = await this.getCycleHistory();
    const latest = cycles[cycles.length - 1];
    const text = latest
      ? `Последний цикл: ${this.formatDate(latest.startDate)}${latest.endDate ? ` - ${this.formatDate(latest.endDate)}` : ""}`
      : "Пока нет циклов";
    const content = `---\ncssclasses:\n  - luna-dashboard\n---\n\n# ${this.t("dashboardTitle")}\n\n<div class="luna-hero-card"><div><p class="luna-kicker">${this.t("today")}</p><h2>Luna Notes</h2><p>${text}</p></div><div class="luna-hero-orbit"><span>${cycles.length}</span><small>циклов</small></div></div>\n\n[[Luna Notes/Calendar/Luna Cycle Calendar]]\n`;
    await this.upsertFile("Luna Notes/Dashboard/Luna Dashboard.md", content);
    new Notice(this.t("saved"));
  }

  async createCalendar() {
    await this.ensureFolders();
    const cycles = await this.getCycleHistory();
    const rows = cycles
      .map(cycle => `- ${this.formatDate(cycle.startDate)}${cycle.endDate ? ` - ${this.formatDate(cycle.endDate)}` : ""}${cycle.ovulation ? `, овуляция: ${cycle.ovulation}` : ""}`)
      .join("\n") || "- Пока нет циклов";
    const content = `---\ncssclasses:\n  - luna-calendar\n---\n\n# ${this.t("calendarTitle")}\n\n${rows}\n`;
    await this.upsertFile("Luna Notes/Calendar/Luna Cycle Calendar.md", content);
    new Notice(this.t("saved"));
  }

  async upsertFile(path, content) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file) await this.app.vault.modify(file, content);
    else await this.app.vault.create(path, content);
  }
};

class AddPastCycleModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.startValue = "";
    this.endValue = "";
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("luna-modal");
    contentEl.createEl("h2", { text: this.plugin.t("addPastCycle") });
    contentEl.createEl("p", { text: "Можно писать 2026-03-07 или 07.03.2026." });

    new Setting(contentEl)
      .setName(this.plugin.t("startDate"))
      .addText(text => text.setPlaceholder("07.03.2026").onChange(value => { this.startValue = value; }));
    new Setting(contentEl)
      .setName(this.plugin.t("endDate"))
      .addText(text => text.setPlaceholder("10.03.2026").onChange(value => { this.endValue = value; }));
    new Setting(contentEl)
      .addButton(button => button.setButtonText(this.plugin.t("saved")).setCta().onClick(async () => {
        await this.plugin.savePastCycle(this.startValue, this.endValue);
        this.close();
      }));
  }

  onClose() {
    this.contentEl.empty();
  }
}

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
      .addDropdown(dropdown => dropdown
        .addOptions({ ru: "Русский", en: "English" })
        .setValue(this.plugin.settings.language)
        .onChange(async value => {
          this.plugin.settings.language = value;
          await this.plugin.saveSettings();
          this.display();
        }));

    new Setting(containerEl)
      .setName(this.plugin.t("cycleLengthSetting"))
      .addText(text => text.setValue(String(this.plugin.settings.cycleLength)).onChange(async value => {
        this.plugin.settings.cycleLength = Number(value) || DEFAULT_SETTINGS.cycleLength;
        await this.plugin.saveSettings();
      }));

    new Setting(containerEl)
      .setName(this.plugin.t("periodLengthSetting"))
      .addText(text => text.setValue(String(this.plugin.settings.periodLength)).onChange(async value => {
        this.plugin.settings.periodLength = Number(value) || DEFAULT_SETTINGS.periodLength;
        await this.plugin.saveSettings();
      }));

    new Setting(containerEl)
      .setName(this.plugin.t("ovulationDaySetting"))
      .addText(text => text.setValue(String(this.plugin.settings.ovulationDay)).onChange(async value => {
        this.plugin.settings.ovulationDay = Number(value) || DEFAULT_SETTINGS.ovulationDay;
        await this.plugin.saveSettings();
      }));

    new Setting(containerEl)
      .setName(this.plugin.t("pmsLengthSetting"))
      .addText(text => text.setValue(String(this.plugin.settings.pmsLength)).onChange(async value => {
        this.plugin.settings.pmsLength = Number(value) || DEFAULT_SETTINGS.pmsLength;
        await this.plugin.saveSettings();
      }));
  }
}
