const grid = document.querySelector("#posts-grid");
const postCount = document.querySelector("#post-count");
const cardTemplate = document.querySelector("#post-card-template");
const modal = document.querySelector("#post-modal");
const modalPanel = modal.querySelector(".post-modal__panel");
const modalClose = document.querySelector("#modal-close");
const postDetail = document.querySelector("#post-detail");

let lastFocusedElement = null;

const fallbackImage = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200">
    <rect width="1600" height="1200" fill="#1c1d1a"/>
    <path d="M0 180h980v260H430v310h1170v270H0z" fill="#f1efe7"/>
    <circle cx="1250" cy="280" r="170" fill="#dfff00"/>
    <path d="M170 0v1200M1430 0v1200M0 600h1600" stroke="#64655f" stroke-width="2"/>
  </svg>
`)}`;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: "UTC"
});

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? dateString : dateFormatter.format(date);
}

function createImage(src, alt = "") {
  const image = document.createElement("img");
  image.src = src || fallbackImage;
  image.alt = alt;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.src = fallbackImage;
  }, { once: true });
  return image;
}

function createCaption(text) {
  if (!text) return null;
  const caption = document.createElement("figcaption");
  caption.textContent = text;
  return caption;
}

function isSafeUrl(value, allowLocal = false) {
  if (typeof value !== "string") return false;
  if (allowLocal && !value.includes(":")) return true;

  try {
    return ["http:", "https:"].includes(new URL(value, window.location.href).protocol);
  } catch {
    return false;
  }
}

function renderContentBlock(block) {
  if (!block || typeof block !== "object") return null;

  switch (block.type) {
    case "paragraph": {
      const paragraph = document.createElement("p");
      paragraph.textContent = block.text || "";
      return paragraph;
    }

    case "heading": {
      const heading = document.createElement("h3");
      heading.textContent = block.text || "";
      return heading;
    }

    case "image": {
      if (!isSafeUrl(block.src, true)) return null;
      const figure = document.createElement("figure");
      figure.append(createImage(block.src, block.alt || block.caption || "Blog post image"));
      const caption = createCaption(block.caption);
      if (caption) figure.append(caption);
      return figure;
    }

    case "quote": {
      const quote = document.createElement("blockquote");
      const paragraph = document.createElement("p");
      paragraph.textContent = block.text || "";
      quote.append(paragraph);
      return quote;
    }

    case "video": {
      if (!isSafeUrl(block.src, true)) return null;
      const figure = document.createElement("figure");
      const video = document.createElement("video");
      video.src = block.src;
      video.controls = true;
      video.preload = "metadata";
      if (block.poster && isSafeUrl(block.poster, true)) video.poster = block.poster;
      video.setAttribute("aria-label", block.caption || "Blog post video");
      figure.append(video);
      const caption = createCaption(block.caption);
      if (caption) figure.append(caption);
      return figure;
    }

    case "link": {
      if (!isSafeUrl(block.url)) return null;
      const link = document.createElement("a");
      link.className = "post-content__link";
      link.href = block.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = block.text || block.url;
      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      link.append(arrow);
      return link;
    }

    default:
      return null;
  }
}

function renderPost(post) {
  postDetail.replaceChildren();

  const header = document.createElement("header");
  header.className = "post-detail__header";

  const label = document.createElement("p");
  label.className = "post-detail__label";
  label.textContent = "Blog post";

  const date = document.createElement("time");
  date.className = "post-detail__date";
  date.dateTime = post.date;
  date.textContent = formatDate(post.date);

  const title = document.createElement("h2");
  title.className = "post-detail__title";
  title.id = "modal-title";
  title.textContent = post.title;

  header.append(label, date, title);

  const cover = createImage(post.coverImage, post.title);
  cover.className = "post-detail__cover";
  cover.loading = "eager";

  const content = document.createElement("div");
  content.className = "post-content";
  const blocks = Array.isArray(post.content) ? post.content : [];
  blocks.forEach((block) => {
    const element = renderContentBlock(block);
    if (element) content.append(element);
  });

  postDetail.append(header, cover, content);
}

function openPost(post, trigger) {
  lastFocusedElement = trigger;
  renderPost(post);
  document.body.classList.add("modal-open");
  modal.showModal();
  modalPanel.scrollTop = 0;
  modalClose.focus();
}

function closePost() {
  if (!modal.open) return;
  modal.close();
  document.body.classList.remove("modal-open");
  postDetail.replaceChildren();
  lastFocusedElement?.focus();
}

function renderCard(post, index) {
  const fragment = cardTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".post-card");
  const button = fragment.querySelector(".post-card__button");
  const image = fragment.querySelector(".post-card__image");
  const date = fragment.querySelector(".post-card__date");

  image.src = post.coverImage || fallbackImage;
  image.alt = post.title;
  image.addEventListener("error", () => {
    image.src = fallbackImage;
  }, { once: true });

  date.dateTime = post.date;
  date.textContent = formatDate(post.date);
  fragment.querySelector(".post-card__number").textContent = String(index + 1).padStart(2, "0");
  fragment.querySelector(".post-card__title").textContent = post.title;
  fragment.querySelector(".post-card__preview").textContent = post.preview || "";
  button.setAttribute("aria-label", `Read ${post.title}`);
  button.addEventListener("click", () => openPost(post, button));

  return card;
}

async function loadPosts() {
  try {
    const response = await fetch("posts.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const posts = Array.isArray(data.posts) ? data.posts : [];
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    grid.replaceChildren();
    postCount.textContent = posts.length;

    if (!posts.length) {
      grid.innerHTML = '<p class="status-message">No blog posts yet. Add your first entry to posts.json.</p>';
      return;
    }

    posts.forEach((post, index) => grid.append(renderCard(post, index)));
  } catch (error) {
    console.error("Could not load posts:", error);
    grid.innerHTML = '<p class="status-message">The blog posts could not be loaded. Run the site from a local server or publish it to GitHub Pages.</p>';
  }
}

modalClose.addEventListener("click", closePost);
modal.addEventListener("cancel", (event) => {
  event.preventDefault();
  closePost();
});
modal.addEventListener("click", (event) => {
  if (event.target === modal) closePost();
});

loadPosts();
