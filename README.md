# Provão Paulista 2027

Um site estático de estudo, em português, para organizar a revisão do Provão Paulista em sprints curtos. A experiência foi inspirada no ritmo direto do Matemática Blitz, com identidade própria e foco em mobile.

> O mapa de temas é uma base inicial de estudos alinhada ao Currículo Paulista e a referências públicas. Ele não substitui o edital, as matrizes ou as orientações oficiais da edição 2027.

## O que existe

- Trilhas de Matemática, Linguagens, Humanas, Natureza e Redação.
- Seleção da série do Ensino Médio.
- Sprint com questões rápidas e explicação após a resposta.
- Progresso e desempenho salvos no `localStorage` do navegador.
- Layout responsivo e confortável para celular.
- Publicação automática da pasta `public/` no GitHub Pages.

## Rodar localmente

```bash
python3 -m http.server 8080 --directory public
```

Abra `http://localhost:8080`.

## Estrutura

```text
public/index.html       estrutura da interface
public/style.css        identidade visual e responsividade
public/script.js        trilhas, questões e progresso local
public/manus-routes.json rotas declaradas do site
.github/workflows/      publicação no GitHub Pages
```

## Referências

- [Portal oficial do Provão Paulista Seriado](https://provaopaulistaseriado.vunesp.com.br/)
- [Secretaria da Educação de São Paulo](https://www.educacao.sp.gov.br/)
- [Resolução SEDUC nº 109/2025](https://atendimento.educacao.sp.gov.br/knowledgebase/article/SED-08378/DownloadKbAttachmentFile/a8b1b82c-f456-461e-8ee3-30984b147df2?kbAttachmentId=111c9cc0-f96d-f011-b4cb-002248384a78)

## Licença

Uso livre para estudo e portfólio. Criado por [Gabriel Araújo](https://github.com/gabrielaraujo-eng).
