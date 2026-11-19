(function () {
  "use strict";

  var STATE_KEY = "pp27.study.v2";
  var LEGACY_STATE_KEY = "pp27.study.v1";
  var THEME_KEY = "pp27.theme.v1";
  var areaInfo = [
    { id: "mat", name: "Matemática", icon: "∑", desc: "números, funções, geometria e dados" },
    { id: "ling", name: "Linguagens", icon: "Aa", desc: "leitura, literatura e comunicação" },
    { id: "hum", name: "Humanas", icon: "◎", desc: "história, geografia e sociedade" },
    { id: "nat", name: "Natureza", icon: "✦", desc: "física, química, biologia e ambiente" },
    { id: "red", name: "Redação", icon: "✎", desc: "tese, argumentação e escrita" }
  ];
  var state = loadState();
  var courses = [];
  var currentLesson = null;
  var practiceIndex = 0;
  var practiceAnswered = false;
  var dailyQuestions = [];
  var dailyKey = "";
  var sprintIndex = 0;
  var sprintAnswered = false;
  var sprintCorrect = 0;
  var toastTimer;

  function $(id) { return document.getElementById(id); }
  function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
  function numberOrZero(value) { return Number.isSafeInteger(value) && value >= 0 ? value : 0; }
  function areaById(id) { return areaInfo.find(function (area) { return area.id === id; }) || areaInfo[0]; }
  function gradeLabel(grade) { return grade + "ª série"; }
  function areaGradeKey() { return state.series + ":" + state.selected; }

  function loadState() {
    var empty = { series: "1", selected: "mat", lessonDone: {}, lessonSelection: {}, sprints: 0, correct: 0, answered: 0 };
    try {
      var raw = localStorage.getItem(STATE_KEY) || localStorage.getItem(LEGACY_STATE_KEY) || "{}";
      var saved = JSON.parse(raw);
      if (!isObject(saved)) return empty;
      var series = ["1", "2", "3"].indexOf(String(saved.series)) !== -1 ? String(saved.series) : "1";
      var selected = areaInfo.some(function (area) { return area.id === saved.selected; }) ? saved.selected : "mat";
      return {
        series: series,
        selected: selected,
        lessonDone: isObject(saved.lessonDone) ? saved.lessonDone : {},
        lessonSelection: isObject(saved.lessonSelection) ? saved.lessonSelection : {},
        sprints: numberOrZero(saved.sprints),
        correct: numberOrZero(saved.correct),
        answered: numberOrZero(saved.answered)
      };
    } catch (error) {
      return empty;
    }
  }

  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (error) { /* O estudo continua disponível nesta sessão. */ }
  }

  function isLessonDone(id) {
    return Object.prototype.hasOwnProperty.call(state.lessonDone, id) && state.lessonDone[id] === true;
  }

  function courseFor(grade, areaId) {
    return courses.find(function (course) { return String(course.grade) === String(grade) && course.areaId === areaId; }) || null;
  }

  function allLessons() {
    return courses.reduce(function (all, course) { return all.concat(course.lessons); }, []);
  }

  function completedLessonCount() {
    return allLessons().filter(function (lesson) { return isLessonDone(lesson.id); }).length;
  }

  function updateProgress() {
    var lessons = allLessons();
    var done = completedLessonCount();
    var percent = lessons.length ? Math.round(done / lessons.length * 100) : 0;
    $("progress-percent").textContent = percent + "%";
    $("progress-bar").style.width = percent + "%";
    $("stat-done").textContent = String(done);
    $("stat-sprints").textContent = String(state.sprints);
    $("stat-accuracy").textContent = state.answered ? Math.round(state.correct / state.answered * 100) + "%" : "—";
  }

  function renderSeries() { $("series-select").value = state.series; }

  function renderTracks() {
    var holder = $("tracks");
    holder.replaceChildren();
    areaInfo.forEach(function (area) {
      var course = courseFor(state.series, area.id);
      var lessons = course ? course.lessons : [];
      var completed = lessons.filter(function (lesson) { return isLessonDone(lesson.id); }).length;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "track" + (state.selected === area.id ? " selected" : "");
      button.dataset.area = area.id;
      button.setAttribute("aria-pressed", String(state.selected === area.id));
      var icon = document.createElement("span");
      icon.className = "track-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = area.icon;
      var heading = document.createElement("h3");
      heading.textContent = area.name;
      var description = document.createElement("p");
      description.textContent = area.desc;
      var count = document.createElement("span");
      count.className = "track-count";
      count.textContent = completed + "/" + lessons.length + " aulas concluídas";
      button.append(icon, heading, description, count);
      button.addEventListener("click", function () {
        state.selected = area.id;
        currentLesson = null;
        saveState();
        renderTracks();
        renderCourse();
        renderFocus();
        toast("Trilha aberta: " + area.name + " · " + gradeLabel(state.series));
      });
      holder.appendChild(button);
    });
  }

  function renderFocus() {
    var area = areaById(state.selected);
    var course = courseFor(state.series, state.selected);
    var lessons = course ? course.lessons : [];
    var done = lessons.filter(function (lesson) { return isLessonDone(lesson.id); }).length;
    var next = lessons.find(function (lesson) { return !isLessonDone(lesson.id); });
    var percent = lessons.length ? Math.round(done / lessons.length * 100) : 0;
    $("focus-number").textContent = String(Math.min(done + 1, Math.max(lessons.length, 1))).padStart(2, "0");
    $("focus-title").textContent = area.name + " · " + gradeLabel(state.series);
    $("focus-topic").textContent = next ? next.title : (lessons.length ? "Trilha concluída. Você pode rever as aulas quando quiser." : "Preparando suas aulas...");
    $("focus-text").textContent = next ? "Miniaula, exemplo resolvido e duas questões para praticar." : (lessons.length ? "Excelente constância. Escolha uma trilha para continuar." : "Conteúdo carregando.");
    $("focus-meta").textContent = done + " de " + lessons.length + " aulas concluídas";
    $("focus-bar").style.width = percent + "%";
    $("focus-bar").parentElement.setAttribute("aria-valuenow", String(percent));
    $("btn-go-lesson").disabled = !next;
    $("btn-go-lesson").textContent = next ? "Ir para próxima aula" : (lessons.length ? "Trilha concluída" : "Carregando...");
    updateProgress();
  }

  function selectLesson(lesson) {
    currentLesson = lesson;
    practiceIndex = 0;
    practiceAnswered = false;
    state.lessonSelection[areaGradeKey()] = lesson.id;
    saveState();
    renderCourse();
    $("lesson-title").focus({ preventScroll: true });
  }

  function renderCourse() {
    var area = areaById(state.selected);
    var course = courseFor(state.series, state.selected);
    var list = $("lesson-list");
    list.replaceChildren();
    $("course-list-title").textContent = area.name + " · " + gradeLabel(state.series);
    if (!course || !course.lessons.length) {
      $("lesson-title").textContent = "Aulas indisponíveis";
      $("lesson-objective").textContent = "";
      $("lesson-copy").textContent = "Não foi possível carregar o conteúdo desta trilha. Atualize a página para tentar novamente.";
      $("lesson-example").textContent = "";
      $("practice-prompt").textContent = "";
      $("lesson-answers").replaceChildren();
      $("btn-lesson-next").disabled = true;
      $("btn-lesson-done").disabled = true;
      return;
    }
    course.lessons.forEach(function (lesson, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "lesson-link";
      button.dataset.lessonId = lesson.id;
      button.setAttribute("aria-current", String(currentLesson && currentLesson.id === lesson.id));
      var number = document.createElement("span");
      number.className = "lesson-index";
      number.textContent = String(index + 1).padStart(2, "0");
      var title = document.createElement("span");
      title.className = "lesson-link-title";
      title.textContent = lesson.title;
      var check = document.createElement("span");
      check.className = "lesson-check";
      check.setAttribute("aria-label", isLessonDone(lesson.id) ? "Concluída" : "");
      check.textContent = isLessonDone(lesson.id) ? "✓" : "";
      button.append(number, title, check);
      button.addEventListener("click", function () { selectLesson(lesson); });
      list.appendChild(button);
    });

    if (!currentLesson || course.lessons.indexOf(currentLesson) === -1) {
      var selectedId = state.lessonSelection[areaGradeKey()];
      currentLesson = course.lessons.find(function (lesson) { return lesson.id === selectedId; }) ||
        course.lessons.find(function (lesson) { return !isLessonDone(lesson.id); }) || course.lessons[0];
      practiceIndex = 0;
      practiceAnswered = false;
    }
    renderLessonContent();
  }

  function renderLessonContent() {
    if (!currentLesson) return;
    var course = courseFor(state.series, state.selected);
    var position = course.lessons.indexOf(currentLesson) + 1;
    $("lesson-position").textContent = "Aula " + position + " de " + course.lessons.length;
    $("lesson-objective").textContent = currentLesson.objective;
    $("lesson-title").textContent = currentLesson.title;
    $("lesson-copy").textContent = currentLesson.lesson;
    $("lesson-example").textContent = currentLesson.example;
    renderLessonPractice();
  }

  function renderLessonPractice() {
    var questions = currentLesson && Array.isArray(currentLesson.questions) ? currentLesson.questions : [];
    if (!questions.length) {
      $("practice-count").textContent = "sem questões";
      $("practice-prompt").textContent = "Esta aula não tem exercícios disponíveis ainda.";
      $("lesson-answers").replaceChildren();
      $("lesson-feedback").textContent = "";
      $("btn-lesson-next").disabled = true;
      $("btn-lesson-done").disabled = true;
      return;
    }
    var question = questions[practiceIndex];
    $("practice-count").textContent = (practiceIndex + 1) + " de " + questions.length;
    $("practice-prompt").textContent = question.prompt;
    $("lesson-feedback").textContent = "";
    $("lesson-feedback").className = "feedback";
    $("btn-lesson-next").disabled = true;
    $("btn-lesson-next").textContent = practiceIndex < questions.length - 1 ? "Próxima questão →" : "Questões respondidas";
    $("btn-lesson-next").hidden = practiceIndex >= questions.length - 1;
    var complete = isLessonDone(currentLesson.id);
    $("btn-lesson-done").disabled = complete || practiceIndex !== questions.length - 1 || !practiceAnswered;
    $("btn-lesson-done").textContent = complete ? "Aula concluída ✓" : "Concluir aula";
    var holder = $("lesson-answers");
    holder.replaceChildren();
    question.options.forEach(function (option, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "answer";
      button.dataset.answer = String(index);
      button.textContent = option;
      button.addEventListener("click", function () { submitLessonAnswer(index); });
      holder.appendChild(button);
    });
  }

  function submitLessonAnswer(index) {
    if (practiceAnswered || !currentLesson) return;
    var question = currentLesson.questions[practiceIndex];
    practiceAnswered = true;
    var buttons = $("lesson-answers").querySelectorAll(".answer");
    buttons.forEach(function (button, buttonIndex) {
      button.disabled = true;
      if (buttonIndex === question.correct) button.classList.add("correct");
      if (buttonIndex === index && index !== question.correct) button.classList.add("wrong");
    });
    var correct = index === question.correct;
    state.answered += 1;
    if (correct) state.correct += 1;
    saveState();
    $("lesson-feedback").textContent = (correct ? "Resposta certa. " : "Vamos revisar. ") + question.explanation;
    $("lesson-feedback").className = "feedback " + (correct ? "good" : "bad");
    $("btn-lesson-next").disabled = practiceIndex >= currentLesson.questions.length - 1;
    $("btn-lesson-done").disabled = isLessonDone(currentLesson.id) || practiceIndex !== currentLesson.questions.length - 1;
    updateProgress();
  }

  function nextLessonQuestion() {
    if (!practiceAnswered || !currentLesson || practiceIndex >= currentLesson.questions.length - 1) return;
    practiceIndex += 1;
    practiceAnswered = false;
    renderLessonPractice();
  }

  function completeLesson() {
    if (!currentLesson || practiceIndex !== currentLesson.questions.length - 1 || !practiceAnswered || isLessonDone(currentLesson.id)) return;
    state.lessonDone[currentLesson.id] = true;
    saveState();
    $("lesson-list").querySelectorAll(".lesson-link").forEach(function (button) {
      if (button.dataset.lessonId !== currentLesson.id) return;
      var check = button.querySelector(".lesson-check");
      check.textContent = "✓";
      check.setAttribute("aria-label", "Concluída");
    });
    $("btn-lesson-done").textContent = "Aula concluída ✓";
    $("btn-lesson-done").disabled = true;
    renderTracks();
    renderFocus();
    toast("Aula concluída: " + currentLesson.title);
  }

  function focusNextLesson() {
    var course = courseFor(state.series, state.selected);
    if (!course) return;
    var next = course.lessons.find(function (lesson) { return !isLessonDone(lesson.id); });
    if (!next) return;
    selectLesson(next);
    $("course-shell").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function todayKey() {
    var now = new Date();
    return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  }

  function todayOrdinal() {
    var now = new Date();
    return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  }

  function startDailySprint() {
    dailyKey = todayKey();
    var pool = [];
    courses.filter(function (course) { return String(course.grade) === state.series; }).forEach(function (course) {
      course.lessons.forEach(function (lesson) {
        lesson.questions.forEach(function (question) {
          pool.push({ id: question.id, area: areaById(course.areaId).name, prompt: question.prompt, options: question.options, correct: question.correct, explanation: question.explanation });
        });
      });
    });
    var start = pool.length ? ((todayOrdinal() % pool.length) * 7) % pool.length : 0;
    dailyQuestions = [];
    for (var offset = 0; offset < Math.min(5, pool.length); offset += 1) {
      dailyQuestions.push(pool[(start + offset) % pool.length]);
    }
    sprintIndex = 0;
    sprintCorrect = 0;
    sprintAnswered = false;
    var dateLabel = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
    $("sprint-intro").textContent = dailyQuestions.length + " questões da " + gradeLabel(state.series) + " · desafio de " + dateLabel + ". Amanhã, outra seleção da base.";
  }

  function refreshSprintIfNewDay() {
    if (!courses.length || todayKey() === dailyKey) return false;
    startDailySprint();
    renderSprintQuestion();
    toast("Novo dia, novo sprint!");
    return true;
  }

  function renderSprintQuestion() {
    var holder = $("answers");
    holder.replaceChildren();
    $("feedback").textContent = "";
    $("feedback").className = "feedback";
    sprintAnswered = false;
    if (!dailyQuestions.length) {
      $("question-count").textContent = "0 questões";
      $("question-area").textContent = "Conteúdo carregando";
      $("question-text").textContent = "As questões do sprint aparecerão assim que o curso carregar.";
      $("btn-next").disabled = true;
      return;
    }
    if (sprintIndex >= dailyQuestions.length) {
      $("question-count").textContent = dailyQuestions.length + " de " + dailyQuestions.length + " · concluído";
      $("question-area").textContent = "Sprint do dia completo";
      $("question-text").textContent = "Você acertou " + sprintCorrect + " de " + dailyQuestions.length + ". Volte amanhã para um novo conjunto de questões.";
      $("feedback").textContent = "Progresso salvo. Revisão da última questão: " + dailyQuestions[dailyQuestions.length - 1].explanation;
      $("feedback").className = "feedback good";
      $("btn-next").textContent = "Refazer sprint de hoje ↻";
      $("btn-next").disabled = false;
      return;
    }
    var question = dailyQuestions[sprintIndex];
    $("question-count").textContent = (sprintIndex + 1) + " de " + dailyQuestions.length;
    $("question-area").textContent = question.area;
    $("question-text").textContent = question.prompt;
    $("btn-next").textContent = sprintIndex === dailyQuestions.length - 1 ? "Concluir sprint ✓" : "Próxima questão →";
    $("btn-next").disabled = true;
    question.options.forEach(function (option, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "answer";
      button.dataset.answer = String(index);
      button.textContent = option;
      button.addEventListener("click", function () { submitSprintAnswer(index); });
      holder.appendChild(button);
    });
  }

  function submitSprintAnswer(index) {
    if (refreshSprintIfNewDay() || sprintAnswered || sprintIndex >= dailyQuestions.length) return;
    sprintAnswered = true;
    var question = dailyQuestions[sprintIndex];
    $("answers").querySelectorAll(".answer").forEach(function (button, buttonIndex) {
      button.disabled = true;
      if (buttonIndex === question.correct) button.classList.add("correct");
      if (buttonIndex === index && index !== question.correct) button.classList.add("wrong");
    });
    var correct = index === question.correct;
    state.answered += 1;
    if (correct) {
      state.correct += 1;
      sprintCorrect += 1;
    }
    saveState();
    $("feedback").textContent = (correct ? "Acertou. " : "Resposta: ") + question.explanation;
    $("feedback").className = "feedback " + (correct ? "good" : "bad");
    $("btn-next").disabled = false;
    updateProgress();
  }

  function nextSprintQuestion() {
    if (refreshSprintIfNewDay()) return;
    if (sprintIndex >= dailyQuestions.length) {
      sprintIndex = 0;
      sprintCorrect = 0;
      renderSprintQuestion();
      toast("Sprint de hoje reiniciado");
      return;
    }
    if (!sprintAnswered) return;
    sprintIndex += 1;
    sprintAnswered = false;
    if (sprintIndex >= dailyQuestions.length) {
      state.sprints += 1;
      saveState();
      updateProgress();
    }
    renderSprintQuestion();
  }

  function clearProgress() {
    if (!window.confirm("Zerar o progresso das aulas e questões neste navegador?")) return;
    state = { series: "1", selected: "mat", lessonDone: {}, lessonSelection: {}, sprints: 0, correct: 0, answered: 0 };
    currentLesson = null;
    practiceIndex = 0;
    practiceAnswered = false;
    saveState();
    renderSeries();
    renderTracks();
    renderCourse();
    renderFocus();
    startDailySprint();
    renderSprintQuestion();
    toast("Progresso zerado");
  }

  function toast(message) {
    var element = $("toast");
    element.textContent = message;
    element.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { element.classList.remove("show"); }, 2400);
  }

  function setTheme(dark, announce) {
    document.body.classList.toggle("dark-theme", dark);
    $("btn-theme").setAttribute("aria-pressed", String(dark));
    $("btn-theme").setAttribute("aria-label", dark ? "Ativar tema claro" : "Ativar tema escuro");
    $("btn-theme").title = dark ? "Ativar tema claro" : "Ativar tema escuro";
    $("btn-theme").textContent = dark ? "☀" : "☾";
    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", dark ? "#111a22" : "#f5efe5");
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch (error) { /* Tema opcional. */ }
    if (announce) toast(dark ? "Tema escuro ativado" : "Tema claro ativado");
  }

  function validateCourses(payload) {
    if (!payload || !Array.isArray(payload.courses)) throw new Error("Arquivo de cursos inválido.");
    var found = Object.create(null);
    payload.courses.forEach(function (course) {
      var key = String(course.grade) + ":" + course.areaId;
      if (!["1", "2", "3"].includes(String(course.grade)) || !areaInfo.some(function (area) { return area.id === course.areaId; })) throw new Error("Série ou matéria inválida.");
      if (found[key]) throw new Error("Há uma matéria duplicada no curso.");
      if (!Array.isArray(course.lessons) || course.lessons.length !== 3) throw new Error("Cada matéria deve ter três aulas.");
      course.lessons.forEach(function (lesson) {
        if (!lesson.id || !lesson.title || !lesson.objective || !lesson.lesson || !lesson.example || !Array.isArray(lesson.questions) || lesson.questions.length !== 2) throw new Error("A aula está incompleta.");
        lesson.questions.forEach(function (question) {
          if (!question.id || question.lessonId !== lesson.id || !question.prompt || !Array.isArray(question.options) || question.options.length !== 4 || !Number.isInteger(question.correct) || question.correct < 0 || question.correct > 3 || !question.explanation) throw new Error("Uma questão está incompleta.");
        });
      });
      found[key] = true;
    });
    if (Object.keys(found).length !== 15) throw new Error("O curso precisa conter conteúdo para as 3 séries e 5 matérias.");
    return payload.courses;
  }

  async function loadCourses() {
    try {
      var response = await fetch("data/courses.json", { cache: "no-cache" });
      if (!response.ok) throw new Error("Não foi possível buscar o arquivo de aulas.");
      var payload = await response.json();
      courses = validateCourses(payload);
      var gradeOrder = { "1": 1, "2": 2, "3": 3 };
      var areaOrder = { mat: 1, ling: 2, hum: 3, nat: 4, red: 5 };
      courses.sort(function (a, b) { return gradeOrder[String(a.grade)] - gradeOrder[String(b.grade)] || areaOrder[a.areaId] - areaOrder[b.areaId]; });
      renderSeries();
      renderTracks();
      renderCourse();
      renderFocus();
      startDailySprint();
      renderSprintQuestion();
    } catch (error) {
      $("course-list-title").textContent = "Aulas indisponíveis";
      $("lesson-title").textContent = "Não foi possível carregar o curso";
      $("lesson-copy").textContent = error.message || "Confira sua conexão e atualize a página.";
      $("lesson-copy").classList.add("course-error");
      $("question-text").textContent = "O banco de questões não carregou. Atualize a página para tentar novamente.";
      $("tracks").textContent = "Não foi possível abrir as trilhas agora.";
    }
  }

  $("series-select").addEventListener("change", function (event) {
    state.series = event.target.value;
    currentLesson = null;
    saveState();
    renderTracks();
    renderCourse();
    renderFocus();
    startDailySprint();
    renderSprintQuestion();
    toast("Conteúdo atualizado para a " + event.target.value + "ª série");
  });
  $("btn-go-lesson").addEventListener("click", focusNextLesson);
  $("btn-lesson-next").addEventListener("click", nextLessonQuestion);
  $("btn-lesson-done").addEventListener("click", completeLesson);
  $("btn-next").addEventListener("click", nextSprintQuestion);
  $("btn-reset-sprint").addEventListener("click", function () {
    if (refreshSprintIfNewDay()) return;
    sprintIndex = 0;
    sprintCorrect = 0;
    renderSprintQuestion();
    toast("Sprint de hoje reiniciado");
  });
  $("btn-clear").addEventListener("click", clearProgress);
  $("btn-theme").addEventListener("click", function () { setTheme(!document.body.classList.contains("dark-theme"), true); });
  window.addEventListener("focus", refreshSprintIfNewDay);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) refreshSprintIfNewDay(); });

  renderSeries();
  renderTracks();
  renderFocus();
  renderSprintQuestion();
  try {
    var savedTheme = localStorage.getItem(THEME_KEY);
    setTheme(savedTheme === "dark" || savedTheme === "high-contrast", false);
  } catch (error) {
    setTheme(false, false);
  }
  loadCourses();
})();
