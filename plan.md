# Plano — Provão Paulista 2027

## Objetivo

Criar um site estático, simples e mobile-first para ajudar estudantes a organizar a revisão do Provão Paulista 2027. A linguagem visual deve dialogar com o Matemática Blitz: direta, acolhedora, com sprints curtos, progresso visível e pouca distração.

## Design escolhido

**Movimento:** papel editorial contemporâneo com energia de cursinho independente.

**Princípios:** clareza antes de decoração; blocos curtos; feedback imediato; sensação de progresso.

**Paleta:** fundo papel para reduzir fadiga, azul para orientação e confiança, laranja para ação e energia, violeta para avisos e revisão.

**Layout:** hero assimétrico, trilhas em cartões, sprint em foco e método em painel escuro; no celular tudo vira fluxo vertical com alvos de toque amplos.

**Assinaturas:** marca P inclinada, etiquetas em caixa alta e barras de progresso discretas.

**Interação:** escolher uma trilha, responder uma questão, receber explicação e registrar avanço sem cadastro.

**Tom:** direto, encorajador e sem prometer que o mapa substitui o edital oficial.

## Estrutura

- `public/index.html`: componentes da página, seleção de série, trilhas, aulas e prática.
- `public/style.css`: identidade responsiva, estados acessíveis e temas claro/escuro.
- `public/script.js`: carregamento do curso, exercícios, sprint diário e progresso no `localStorage`.
- `public/data/courses.json`: aulas e questões originais agrupadas por série e matéria.
- `.github/workflows/pages.yml`: publicação da pasta `public`.

## Conteúdo

As aulas e questões são uma seleção original de prática organizada por série, não conteúdo oficial nem uma reprodução de prova. O aviso no site deve orientar estudantes a consultar o edital, a matriz e as instruções oficiais da edição 2027 quando publicados.
