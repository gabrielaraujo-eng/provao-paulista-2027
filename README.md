# Provão Paulista 2027

Um site estático de estudo, em português, para aprender e praticar conteúdos do Ensino Médio em trilhas, miniaulas e sprints curtos. A experiência mantém a identidade própria e o foco em mobile.

> As aulas e questões são originais e formam um ponto de partida para estudar por série. Não são material oficial nem substituem o edital, a matriz ou as orientações da edição 2027.

## O que existe

- Cinco trilhas com conteúdos diferentes para a 1ª, 2ª e 3ª séries.
- 45 miniaulas com explicações, exemplos resolvidos e exercícios de múltipla escolha comentados.
- Banco de 90 questões originais; sprint diário de cinco questões escolhido conforme série e data local.
- Aulas concluídas, desempenho e preferência de tema salvos no `localStorage` do navegador.
- Alternância persistente entre tema claro e escuro, estados acessíveis dos controles e foco de teclado visível.
- Questões e aulas criadas para prática: não são questões oficiais nem substituem edital ou matriz oficial.
- Layout responsivo e confortável para celular.
- SEO inicial completo: canonical, Open Graph, Twitter Card, JSON-LD, favicon, `robots.txt` e `sitemap.xml`.
- Publicação automática da pasta `public/` no GitHub Pages.

## Rodar localmente

```bash
python3 -m http.server 8080 --directory public
```

Abra `http://localhost:8080`.

## Estrutura

```text
index.html               entrada da raiz; encaminha para public/
public/index.html       estrutura da interface
public/style.css        identidade visual e responsividade
public/script.js        trilhas, questões e progresso local
public/data/courses.json aulas e banco original de questões por série
public/manus-routes.json rotas declaradas do site
public/assets/          favicon e imagens de compartilhamento
public/robots.txt       regras para rastreadores
public/sitemap.xml      URL canônica do site
.github/workflows/      publicação do site no GitHub Pages
```

O workflow publica diretamente `public/`. Se o GitHub Pages estiver configurado para servir a raiz da branch, o `index.html` da raiz encaminha o visitante para `public/`.

## Referências

- [Portal oficial do Provão Paulista Seriado](https://provaopaulistaseriado.vunesp.com.br/)
- [Secretaria da Educação de São Paulo](https://www.educacao.sp.gov.br/)
- [Resolução SEDUC nº 109/2025](https://atendimento.educacao.sp.gov.br/knowledgebase/article/SED-08378/DownloadKbAttachmentFile/a8b1b82c-f456-461e-8ee3-30984b147df2?kbAttachmentId=111c9cc0-f96d-f011-b4cb-002248384a78)

## Licença

Uso livre para estudo e portfólio. Criado por [Gabriel Araújo](https://github.com/gabrielaraujo-eng).
