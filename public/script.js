(function(){"use strict";
var KEY="pp27.study.v1";
var areas=[
  {id:"mat",icon:"∑",name:"Matemática",desc:"álgebra, funções, geometria e leitura de dados",topics:["Porcentagem e razão","Funções e gráficos","Geometria plana","Probabilidade e estatística"]},
  {id:"ling",icon:"Aa",name:"Linguagens",desc:"leitura, literatura, gramática e comunicação",topics:["Interpretação de texto","Gêneros e argumentação","Literatura brasileira","Variação linguística"]},
  {id:"hum",icon:"◎",name:"Humanas",desc:"história, geografia, filosofia e sociologia",topics:["Brasil República","Urbanização e território","Cidadania e democracia","Trabalho e tecnologia"]},
  {id:"nat",icon:"✦",name:"Natureza",desc:"física, química, biologia e ambiente",topics:["Energia e movimento","Química e transformações","Ecologia","Saúde e tecnologia"]},
  {id:"red",icon:"✎",name:"Redação",desc:"repertório, tese, desenvolvimento e proposta",topics:["Tese e projeto de texto","Coesão e coerência","Repertório sociocultural","Proposta de intervenção"]}
];
var questions=[
 {area:"Matemática",text:"Uma loja oferece 20% de desconto em um produto de R$ 150. Qual é o preço final?",answers:["R$ 110","R$ 120","R$ 125","R$ 130"],correct:1,why:"20% de 150 = 30. Então, 150 − 30 = R$ 120."},
 {area:"Linguagens",text:"Em um texto argumentativo, a tese é principalmente...",answers:["o título do texto","a opinião central defendida","uma citação longa","a lista de fontes"],correct:1,why:"A tese apresenta a ideia central que será defendida ao longo do texto."},
 {area:"Humanas",text:"A urbanização brasileira se intensificou principalmente a partir de...",answers:["1950, com a industrialização","1500, com a colonização","1888, com a abolição","2000, com a internet"],correct:0,why:"A industrialização, sobretudo a partir de 1950, acelerou o êxodo rural e o crescimento das cidades."},
 {area:"Natureza",text:"Em uma cadeia alimentar, a energia disponível...",answers:["aumenta a cada nível","é totalmente reciclada","diminui a cada nível trófico","não depende do Sol"],correct:2,why:"Parte da energia é dissipada como calor em cada transferência entre níveis tróficos."},
 {area:"Redação",text:"Uma boa proposta de intervenção deve apresentar, entre outros elementos...",answers:["apenas uma opinião","agente, ação e finalidade","um novo título","palavras difíceis"],correct:1,why:"Agente, ação, meio e finalidade tornam a intervenção concreta e relacionada ao problema."},
 {area:"Matemática",text:"Se f(x)=2x+3, qual é o valor de f(4)?",answers:["8","10","11","12"],correct:2,why:"Substituindo x por 4: 2·4 + 3 = 11."},
 {area:"Linguagens",text:"A função principal de um conectivo como “portanto” é indicar...",answers:["oposição","conclusão","causa","exemplificação"],correct:1,why:"“Portanto” introduz uma conclusão ou consequência lógica."}
];
var state=load();var current=0;var answered=false;var sprintCorrect=0;
function $(id){return document.getElementById(id)}
function load(){try{return Object.assign({series:"1",done:{},sprints:0,correct:0,answered:0,selected:"mat"},JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){return {series:"1",done:{},sprints:0,correct:0,answered:0,selected:"mat"}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function totalTopics(){return areas.reduce(function(n,a){return n+a.topics.length},0)}
function doneCount(){return Object.keys(state.done).filter(function(k){return state.done[k]}).length}
function renderTracks(){
 var el=$("tracks");el.innerHTML=areas.map(function(a){var done=a.topics.filter(function(t){return state.done[a.id+":"+t]}).length;return '<button class="track '+(state.selected===a.id?'selected':'')+'" data-area="'+a.id+'"><span class="track-icon">'+a.icon+'</span><h3>'+a.name+'</h3><p>'+a.desc+'</p><span class="track-count">'+done+'/'+a.topics.length+' tópicos</span></button>'}).join("");
 el.querySelectorAll(".track").forEach(function(b){b.addEventListener("click",function(){state.selected=b.dataset.area;save();renderTracks();renderFocus();toast("Trilha selecionada");})});
}
function renderFocus(){var a=areas.find(function(x){return x.id===state.selected})||areas[0],done=a.topics.filter(function(t){return state.done[a.id+":"+t]}).length;$("focus-number").textContent=String(done+1).padStart(2,"0");$("focus-title").textContent=a.name;$("focus-text").textContent=done<a.topics.length?"Revise um tópico desta trilha e marque seu avanço.":"Trilha concluída. Escolha outra para continuar.";$("focus-meta").textContent=done+" de "+a.topics.length+" tópicos concluídos";$("focus-bar").style.width=(done/a.topics.length*100)+"%";updateProgress()}
function updateProgress(){var total=totalTopics(),done=doneCount(),pct=Math.round(done/total*100);$("progress-percent").textContent=pct+"%";$("progress-bar").style.width=pct+"%";$("stat-done").textContent=done;$("stat-sprints").textContent=state.sprints;$("stat-accuracy").textContent=state.answered?Math.round(state.correct/state.answered*100)+"%":"—"}
function renderSeries(){ $("series-select").value=state.series }
function question(){return questions[current%questions.length]}
function renderQuestion(){var q=question();answered=false;$("question-count").textContent=(current%5+1)+" de 5";$("question-area").textContent=q.area;$("question-text").textContent=q.text;$("feedback").textContent="";$("feedback").className="feedback";$("btn-next").disabled=true;$("answers").innerHTML=q.answers.map(function(a,i){return '<button class="answer" data-answer="'+i+'">'+a+'</button>'}).join("");$("answers").querySelectorAll(".answer").forEach(function(b){b.addEventListener("click",function(){answer(Number(b.dataset.answer))})})}
function answer(index){if(answered)return;answered=true;var q=question(),buttons=$("answers").querySelectorAll(".answer");buttons.forEach(function(b,i){b.disabled=true;if(i===q.correct)b.classList.add("correct");if(i===index&&i!==q.correct)b.classList.add("wrong")});state.answered++;if(index===q.correct){state.correct++;sprintCorrect++;$("feedback").textContent="Acertou. "+q.why;$("feedback").className="feedback good"}else{$("feedback").textContent="Ainda não. "+q.why;$("feedback").className="feedback bad"}save();updateProgress();$("btn-next").disabled=false}
function next(){if(!answered)return;current++;if(current%5===0){state.sprints++;save();updateProgress();toast("Sprint completo. Boa constância!")}renderQuestion()}
function clearProgress(){if(!confirm("Zerar o progresso deste navegador?"))return;state={series:"1",done:{},sprints:0,correct:0,answered:0,selected:"mat"};save();renderTracks();renderFocus();renderSeries();toast("Progresso zerado")}
function toast(text){var t=$("toast");t.textContent=text;t.classList.add("show");setTimeout(function(){t.classList.remove("show")},2200)}
$("series-select").addEventListener("change",function(e){state.series=e.target.value;save();toast("Trilha ajustada para a "+e.target.value+"ª série")});
$("btn-next").addEventListener("click",next);$("btn-reset-sprint").addEventListener("click",function(){current=0;sprintCorrect=0;renderQuestion();toast("Novo sprint iniciado")});$("btn-clear").addEventListener("click",clearProgress);$("btn-theme").addEventListener("click",function(){document.body.classList.toggle("high-contrast");toast("Contraste alternado")});
renderSeries();renderTracks();renderFocus();renderQuestion();
})();
