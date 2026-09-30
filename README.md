# Multisensory VR — Weekly Process Blog

A framework-free, single-page class blog built for static hosting on GitHub Pages. Posts are rendered from `posts.json` and open in an on-page modal.

## Preview locally

Because browsers do not allow `fetch()` to read local JSON from a `file://` URL, run a small local server from this folder:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Add a weekly post

1. Add media to a week-specific folder inside `assets/`, such as `assets/week3/`.
2. Open `posts.json` and add a new object inside the `posts` array.
3. Give every post a unique `id` and use a date in `YYYY-MM-DD` format.
4. Commit and push. The newest dated post appears first automatically.

Each post follows this shape:

```json
{
  "id": "week-03",
  "title": "Week 3 — Your Title",
  "date": "2026-09-16",
  "coverImage": "assets/week3/week-03-cover.jpg",
  "preview": "A short description for the home page.",
  "content": [
    { "type": "heading", "text": "Section title" },
    { "type": "paragraph", "text": "Your writing." },
    {
      "type": "image",
      "src": "assets/week3/week-03-test.jpg",
      "alt": "Description of the image",
      "caption": "An optional caption."
    },
    { "type": "quote", "text": "A highlighted observation." },
    {
      "type": "video",
      "src": "assets/week3/week-03-demo.mp4",
      "caption": "Playable prototype"
    },
    {
      "type": "link",
      "text": "View the project on GitHub",
      "url": "https://github.com/example/project"
    }
  ]
}
```

Supported content block types are `paragraph`, `heading`, `image`, `gallery`, `quote`, `video`, and `link`. Unknown types are safely ignored.

Animated GIFs use the `image` content type. They autoplay without controls when loaded, and images are lazy-loaded as they approach the viewport.

Use a `gallery` block for related secondary views. It takes an `images` array with the same `src`, `alt`, and `caption` fields as an image block. Galleries have two columns on desktop and one on mobile, preserving each image's aspect ratio. Image entries can also include `width` and `height` to reserve space while loading.

Post images and gallery images open in an image viewer, with an **Open original** link. Set `originalSrc` when `src` is an optimized copy. Close the viewer with its button or Escape to return to the same place in the post. For an uncropped, expandable cover, add `coverAlt`, with optional `coverCaption`, `coverWidth`, and `coverHeight`, to the post.

Week 3 uses animated web copies in `assets/week3/web/`; the original images and GIFs remain in `assets/week3/`. The screen recording is intentionally excluded from the post.

## Publish on GitHub Pages

Push the repository to GitHub, then open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select your main branch and the `/ (root)` folder, then save.
