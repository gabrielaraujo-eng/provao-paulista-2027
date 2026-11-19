(function () {
  "use strict";

  var KEY = "pp27.study.v1";
  var THEME_KEY = "pp27.theme.v1";
  var areas = [
    { id: "mat", icon: "∑", name: "Matemática", desc: "álgebra, funções, geometria e leitura de dados", topics: ["Porcentagem e razão", "Funções e gráficos", "Geometria plana", "Probabilidade e estatística"] },
    { id: "ling", icon: "Aa", name: "Linguagens", desc: "leitura, literatura, gramática e comunicação", topics: ["Interpretação de texto", "Gêneros e argumentação", "Literatura brasileira", "Variação linguística"] },
    { id: "hum", icon: "◎", name: "Humanas", desc: "história, geografia, filosofia e sociologia", topics: ["Brasil República", "Urbanização e território", "Cidadania e democracia", "Trabalho e tecnologia"] },
    { id: "nat", icon: "✦", name: "Natureza", desc: "física, química, biologia e ambiente", topics: ["Energia e movimento", "Química e transformações", "Ecologia", "Saúde e tecnologia"] },
    { id: "red", icon: "✎", name: "Redação", desc: "repertório, tese, desenvolvimento e proposta", topics: ["Tese e projeto de texto", "Coesão e coerência", "Repertório sociocultural", "Proposta de intervenção"] }
  ];
  var questions = [
    { area: "Matemática", text: "Uma loja oferece 20% de desconto em um produto de R$ 150. Qual é o preço final?", answers: ["R$ 110", "R$ 120", "R$ 125", "R$ 130"], correct: 1, why: "20% de 150 = 30. Então, 150 − 30 = R$ 120." },
    { area: "Linguagens", text: "Em um texto argumentativo, a tese é principalmente...", answers: ["o título do texto", "a opinião central defendida", "uma citação longa", "a lista de fontes"], correct: 1, why: "A tese apresenta a ideia central que será defendida ao longo do texto." },
    { area: "Humanas", text: "A urbanização brasileira se intensificou principalmente a partir de...", answers: ["1950, com a industrialização", "1500, com a colonização", "1888, com a abolição", "2000, com a internet"], correct: 0, why: "A industrialização, sobretudo a partir de 1950, acelerou o êxodo rural e o crescimento das cidades." },
    { area: "Natureza", text: "Em uma cadeia alimentar, a energia disponível...", answers: ["aumenta a cada nível", "é totalmente reciclada", "diminui a cada nível trófico", "não depende do Sol"], correct: 2, why: "Parte da energia é dissipada como calor em cada transferência entre níveis tróficos." },
    { area: "Redação", text: "Uma boa proposta de intervenção deve apresentar, entre outros elementos...", answers: ["apenas uma opinião", "agente, ação e finalidade", "um novo título", "palavras difíceis"], correct: 1, why: "Agente, ação, meio e finalidade tornam a intervenção concreta e relacionada ao problema." },
    { area: "Matemática", text: "Se f(x)=2x+3, qual é o valor de f(4)?", answers: ["8", "10", "11", "12"], correct: 2, why: "Substituindo x por 4: 2·4 + 3 = 11." },
    { area: "Linguagens", text: "A função principal de um conectivo como “portanto” é indicar...", answers: ["oposição", "conclusão", "causa", "exemplificação"], correct: 1, why: "“Portanto” introduz uma conclusão ou consequência lógica." }
  ];

  var state = loadState();
  var current = 0;
  var answered = false;
  var toastTimer;

  function $(id) { return document.getElementById(id); }
  function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
  function validCount(value) { return Number.isSafeInteger(value) && value >= 0 ? value : 0; }

  function loadState() {
    var fallback = { series: "1", done: {}, sprints: 0, correct: 0, answered: 0, selected: "mat" };
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (!isObject(saved)) return fallback;
      var allowedArea = areas.some(function (area) { return area.id === saved.selected; });
      var validSeries = ["1", "2", "3"].indexOf(String(saved.series)) !== -1;
      return {
        series: validSeries ? String(saved.series) : fallback.series,
        done: isObject(saved.done) ? saved.done : {},
        sprints: validCount(saved.sprints),
        correct: validCount(saved.correct),
        answered: validCount(saved.answered),
        selected: allowedArea ? saved.selected : fallback.selected
      };
    } catch (error) {
      return fallback;
    }
  }

  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (error) { /* Armazenamento indisponível: a sessão continua funcionando. */ }
  }

  function isDone(areaId, topic) {
    return Object.prototype.hasOwnProperty.call(state.done, areaId + ":" + topic) && state.done[areaId + ":" + topic] === true;
  }

  function totalTopics() {
    return areas.reduce(function (total, area) { return total + area.topics.length; }, 0);
  }

  function doneCount() {
    return areas.reduce(function (total, area) {
      return total + area.topics.filter(function (topic) { return isDone(area.id, topic); }).length;
    }, 0);
  }

  function renderTracks() {
    var element = $("tracks");
    element.innerHTML = areas.map(function (area) {
      var done = area.topics.filter(function (topic) { return isDone(area.id, topic); }).length;
      var selected = state.selected === area.id;
      return '<button class="track' + (selected ? ' selected' : '') + '" type="button" data-area="' + area.id + '" aria-pressed="' + selected + '">' +
        '<span class="track-icon" aria-hidden="true">' + area.icon + '</span><h3>' + area.name + '</h3><p>' + area.desc + '</p>' +
        '<span class="track-count">' + done + '/' + area.topics.length + ' tópicos</span></button>';
    }).join("");

    element.querySelectorAll(".track").forEach(function (button) {
      button.addEventListener("click", function () {
        state.selected = button.dataset.area;
        saveState();
        renderTracks();
        renderFocus();
        toast("Trilha selecionada: " + (areas.find(function (area) { return area.id === state.selected; }).name));
      });
    });
  }

  function renderFocus() {
    var area = areas.find(function (item) { return item.id === state.selected; }) || areas[0];
    var completed = area.topics.filter(function (topic) { return isDone(area.id, topic); }).length;
    var nextTopic = area.topics.find(function (topic) { return !isDone(area.id, topic); });
    var percent = Math.round(completed / area.topics.length * 100);
    $("focus-number").textContent = String(Math.min(completed + 1, area.topics.length)).padStart(2, "0");
    $("focus-title").textContent = area.name;
    $("focus-topic").textContent = nextTopic || "Todos os tópicos desta trilha foram concluídos.";
    $("focus-text").textContent = nextTopic ? "Avance no seu ritmo. Você pode revisar este tema antes de marcar." : "Mandou bem: escolha outra trilha para continuar.";
    $("focus-meta").textContent = completed + " de " + area.topics.length + " tópicos concluídos";
    $("focus-bar").style.width = percent + "%";
    $("focus-bar").parentElement.setAttribute("aria-valuenow", String(percent));
    $("btn-topic-done").disabled = !nextTopic;
    $("btn-topic-done").textContent = nextTopic ? "Marcar tópico como feito" : "Trilha concluída";
    updateProgress();
  }

  function updateProgress() {
    var done = doneCount();
    var percent = Math.round(done / totalTopics() * 100);
    $("progress-percent").textContent = percent + "%";
    $("progress-bar").style.width = percent + "%";
    $("stat-done").textContent = done;
    $("stat-sprints").textContent = state.sprints;
    $("stat-accuracy").textContent = state.answered ? Math.round(state.correct / state.answered * 100) + "%" : "—";
  }

  function renderSeries() { $("series-select").value = state.series; }
  function question() { return questions[current % questions.length]; }

  function renderQuestion() {
    var item = question();
    answered = false;
    $("question-count").textContent = (current % 5 + 1) + " de 5";
    $("question-area").textContent = item.area;
    $("question-text").textContent = item.text;
    $("feedback").textContent = "";
    $("feedback").className = "feedback";
    $("btn-next").disabled = true;
    $("answers").innerHTML = item.answers.map(function (answer, index) {
      return '<button class="answer" type="button" data-answer="' + index + '">' + answer + '</button>';
    }).join("");
    $("answers").querySelectorAll(".answer").forEach(function (button) {
      button.addEventListener("click", function () { submitAnswer(Number(button.dataset.answer)); });
    });
  }

  function submitAnswer(index) {
    if (answered || !Number.isInteger(index)) return;
    answered = true;
    var item = question();
    var buttons = $("answers").querySelectorAll(".answer");
    buttons.forEach(function (button, buttonIndex) {
      button.disabled = true;
      if (buttonIndex === item.correct) button.classList.add("correct");
      if (buttonIndex === index && index !== item.correct) button.classList.add("wrong");
    });
    state.answered += 1;
    var correct = index === item.correct;
    if (correct) state.correct += 1;
    $("feedback").textContent = (correct ? "Acertou. " : "Ainda não. ") + item.why;
    $("feedback").className = "feedback " + (correct ? "good" : "bad");
    saveState();
    updateProgress();
    $("btn-next").disabled = false;
  }

  function nextQuestion() {
    if (!answered) return;
    current += 1;
    if (current % 5 === 0) {
      state.sprints += 1;
      saveState();
      updateProgress();
      toast("Sprint completo. Boa constância!");
    }
    renderQuestion();
  }

  function markTopicDone() {
    var area = areas.find(function (item) { return item.id === state.selected; }) || areas[0];
    var topic = area.topics.find(function (item) { return !isDone(area.id, item); });
    if (!topic) return;
    state.done[area.id + ":" + topic] = true;
    saveState();
    renderTracks();
    renderFocus();
    toast("Tópico concluído: " + topic);
  }

  function clearProgress() {
    if (!window.confirm("Zerar o progresso deste navegador?")) return;
    state = { series: "1", done: {}, sprints: 0, correct: 0, answered: 0, selected: "mat" };
    current = 0;
    saveState();
    renderTracks();
    renderFocus();
    renderSeries();
    renderQuestion();
    toast("Progresso zerado");
  }

  function toast(message) {
    var element = $("toast");
    element.textContent = message;
    element.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { element.classList.remove("show"); }, 2400);
  }

  function setTheme(highContrast, announce) {
    document.body.classList.toggle("high-contrast", highContrast);
    $("btn-theme").setAttribute("aria-pressed", String(highContrast));
    try { localStorage.setItem(THEME_KEY, highContrast ? "high-contrast" : "normal"); } catch (error) { /* Preferência opcional. */ }
    if (announce) toast(highContrast ? "Alto contraste ativado" : "Alto contraste desativado");
  }

  $("series-select").addEventListener("change", function (event) {
    state.series = event.target.value;
    saveState();
    toast("Série ajustada para a " + event.target.value + "ª série");
  });
  $("btn-next").addEventListener("click", nextQuestion);
  $("btn-reset-sprint").addEventListener("click", function () {
    current = 0;
    renderQuestion();
    toast("Novo sprint iniciado");
  });
  $("btn-clear").addEventListener("click", clearProgress);
  $("btn-topic-done").addEventListener("click", markTopicDone);
  $("btn-theme").addEventListener("click", function () {
    setTheme(!document.body.classList.contains("high-contrast"), true);
  });

  renderSeries();
  renderTracks();
  renderFocus();
  renderQuestion();
  try { setTheme(localStorage.getItem(THEME_KEY) === "high-contrast", false); } catch (error) { setTheme(false, false); }
})();
