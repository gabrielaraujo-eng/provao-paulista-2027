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

- `public/index.html`: conteúdo e componentes da página.
- `public/style.css`: design responsivo e modo de alto contraste.
- `public/script.js`: dados das trilhas, sprint e `localStorage`.
- `.github/workflows/pages.yml`: publicação da pasta `public`.

## Conteúdo

Os tópicos iniciais são um mapa de revisão geral baseado no Currículo Paulista e em referências oficiais disponíveis. O site deve deixar explícito que a edição 2027 pode atualizar edital, matriz e calendário.
