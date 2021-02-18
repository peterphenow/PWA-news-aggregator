import { checkForIndexedDb, useIndexedDb } from "./browserDB";
import { createElement } from "./domMethods";
import { getParams } from "./api";

// @TODO Add remove from favorites functionality

// Clear the article container and insert placeholder articles
function renderPlaceHolders() {
  const articleContainer = document.querySelector(".article-container");

  const placeholders = createPlaceholders();

  while (articleContainer.firstChild) {
    articleContainer.removeChild(articleContainer.firstChild);
  }

  articleContainer.appendChild(placeholders);
}

// Create and return 4 placeholder articles
function createPlaceholders() {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 4; i++) {
    const placeholder = createPlaceholder();
    fragment.appendChild(placeholder);
  }

  return fragment;
}

// Returns markup for a placeholder article
function createPlaceholder() {
  return createElement(
    "div",
    { class: "article-skeleton" },
    createElement(
      "div",
      { class: "article-skeleton__header" },
      createElement("div", { class: "article-skeleton__title" }),
      createElement("div", { class: "article-skeleton__published" })
    ),
    createElement(
      "div",
      { class: "article-skeleton__content" },
      createElement("div", { class: "article-skeleton__image" }),
      createElement("div", { class: "article-skeleton__text" }),
      createElement("div", { class: "article-skeleton__text" }),
      createElement("div", { class: "article-skeleton__text" }),
      createElement("div", { class: "article-skeleton__text" }),
      createElement("div", { class: "article-skeleton__text" })
    )
  );
}

// Empties article container and appends articles
function renderArticles(articleData) {
  renderPlaceHolders();
  const articleContainer = document.querySelector(".article-container");
  const topicHeader = document.querySelector("header h1");

  const articles = createArticles(articleData);

  while (articleContainer.firstChild) {
    articleContainer.removeChild(articleContainer.firstChild);
  }

  const { query } = getParams();

  topicHeader.textContent = query;
  articleContainer.appendChild(articles);
}

// Return HTML for each article provided
function createArticles(articleData) {
  const fragment = document.createDocumentFragment();

  articleData.forEach((data) => {
    const article = createArticle(data);
    fragment.appendChild(article);
  });

  return fragment;
}

// Returns markup for a single article
function createArticle({ source, author, title, description, url, urlToImage, publishedAt, _id, favorite }) {
  return createElement(
    "article",
    null,
    createElement(
      "div",
      { class: "article-header" },
      createElement("div", { class: "article-header__title" }, createElement("h3", null, title)),
      createElement(
        "div",
        { class: "article-header__published" },
        createElement("p", null, author),
        createElement("p", null, formatDate(publishedAt))
      )
    ),
    createElement(
      "div",
      { class: "article-container" },
      createElement("p", null, urlToImage && createElement("img", { src: urlToImage, alt: title }), description),
      createElement(
        "p",
        null,
        createElement(
          "small",
          null,
          "Continue reading at ",
          createElement(
            "a",
            {
              href: url,
              target: "_blank",
              rel: "noopener noreferrer"
            },
            source.name
          )
        )
      ),
      favorite
        ? createElement(
            "button",
            {
              class: "button button--primary",
              onclick: () => {
                useIndexedDb("articles", "ArticleStore", "put", {
                  source,
                  author,
                  title,
                  description,
                  url,
                  urlToImage,
                  publishedAt,
                  _id
                });
                loadPage();
              }
            },
            "Save to Favorites"
          )
        : createElement(
            "button",
            {
              class: "button button--danger",
              onclick: () => {
                useIndexedDb("articles", "ArticleStore", "delete", { _id });
                loadPage();
              }
            },
            "Remove from Favorites"
          )
    )
  );
}

// Formats and returns date in MMMM/DD/YYYY format
function formatDate(dateStr) {
  const date = new Date(dateStr);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  return date.toLocaleDateString(options);
}

function loadPage() {
  if (checkForIndexedDb()) {
    useIndexedDb("articles", "ArticleStore", "get").then((results) => {
      renderArticles(results);
    });
  }
}

loadPage();
