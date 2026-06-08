# Loi's — The Joy of Phở

A restaurant menu website for **Loi's — The Joy of Phở**, a Vietnamese restaurant in Newmarket, ON.

## Features

- **Hero** with the restaurant logo, tagline and a click-to-call ordering button.
- **Best Sellers** — featured dishes with real photos, descriptions and prices.
- **Full Menu** — every dish organized by category (list only), with a sticky category navigation.
- **Customer Feedback page** (`feedback.html`) — guests can read reviews and leave their own rating and comment.
- Fully responsive, Vietnamese-inspired design (deep navy + gold + lacquer red).

## Tech

Pure static site — HTML, CSS and vanilla JavaScript. No build step required.

```
.
├─ index.html          # Home (hero, best sellers, full menu)
├─ feedback.html       # Customer feedback / reviews page
├─ css/styles.css
├─ js/
│  ├─ menu-data.js      # Menu items, best sellers, seed reviews
│  └─ app.js            # Rendering + feedback logic
├─ assets/
│  ├─ brand/            # Logo
│  └─ dishes/           # Dish photos
└─ server.js            # Optional local dev server (Node)
```

## Run locally

```bash
node server.js
# then open http://localhost:5173
```

Or simply open `index.html` in a browser.

## Deploy

Deployed as a static site on **Vercel** — no configuration needed; Vercel serves the files directly.

## Restaurant

- 16640 Yonge St #5B, Newmarket, ON L3X 2N8 (RioCentre Newmarket)
- (905) 235-8999 · [loijoyofpho.ca](https://loijoyofpho.ca)
- Open daily until 9:30 PM · Dine-in · Takeout · Delivery

---

> Note: customer reviews are currently stored in the visitor's browser (`localStorage`) for the MVP. To share reviews across all visitors, connect a backend or form service.
