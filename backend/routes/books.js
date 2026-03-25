const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";

function buildUrl(endpoint, params) {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const qs = new URLSearchParams(params);
  if (key) qs.set("key", key);
  return GOOGLE_BOOKS_URL + endpoint + "?" + qs.toString();
}

// Spoof a browser referer so HTTP-referrer-restricted keys work from server
function getHeaders() {
  const origin = process.env.APP_URL || "http://localhost:5000";
  return {
    "Referer": origin + "/",
    "Origin": origin,
    "User-Agent": "Mozilla/5.0 (compatible; DreamWave/1.0)"
  };
}

function goalToQuery(goal) {
  if (!goal) return "programming books";
  const g = goal.toLowerCase().replace(/-/g, " ");
  const map = {
    "web development": "web development javascript html css",
    "data science": "data science python machine learning",
    "android": "android development kotlin java",
    "ios": "ios swift apple development",
    "machine learning": "machine learning deep learning AI",
    "ui ux": "ui ux design figma user experience",
    "devops": "devops docker kubernetes cloud",
    "cybersecurity": "cybersecurity ethical hacking",
    "blockchain": "blockchain web3 cryptocurrency",
    "game development": "game development unity unreal",
    "finance": "personal finance investing money",
    "business": "business entrepreneurship startup",
    "design": "graphic design visual communication",
    "marketing": "digital marketing seo social media"
  };
  for (const [k, v] of Object.entries(map)) {
    if (g.includes(k)) return v + " books";
  }
  return goal + " books learning";
}

function formatBook(item) {
  const info = item.volumeInfo || {};
  const access = item.accessInfo || {};
  const img = info.imageLinks || {};
  return {
    id: item.id,
    title: info.title || "Untitled",
    authors: info.authors || ["Unknown Author"],
    description: (info.description || "").replace(/<[^>]+>/g, "").slice(0, 300),
    thumbnail: (img.thumbnail || img.smallThumbnail || "").replace("http://", "https://"),
    previewLink: info.previewLink || "",
    infoLink: info.infoLink || "",
    categories: info.categories || [],
    publishedDate: (info.publishedDate || "").slice(0, 4),
    pageCount: info.pageCount || 0,
    rating: info.averageRating || 0,
    ratingsCount: info.ratingsCount || 0,
    embeddable: access.embeddable || false,
    viewability: access.viewability || "NO_PAGES"
  };
}

// GET /api/books/search?q=...&goal=...&startIndex=0&maxResults=20
router.get("/search", auth, async (req, res) => {
  try {
    const q = req.query.q;
    const goal = req.query.goal;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const maxResults = Math.min(parseInt(req.query.maxResults) || 20, 40);
    const query = (q && q.trim()) ? q.trim() : goalToQuery(goal);

    const url = buildUrl("", {
      q: query,
      maxResults,
      startIndex,
      printType: "books",
      langRestrict: "en",
      orderBy: "relevance"
    });

    const r = await fetch(url, { headers: getHeaders() });
    const data = await r.json();

    if (data.error) {
      console.error("Google Books API error:", data.error.message);
      // If key is restricted, fall back without key
      if (data.error.status === "PERMISSION_DENIED") {
        const fallbackUrl = buildUrl("", { q: query, maxResults, startIndex, printType: "books", langRestrict: "en", orderBy: "relevance" });
        const fallbackParams = new URLSearchParams({ q: query, maxResults, startIndex, printType: "books", langRestrict: "en", orderBy: "relevance" });
        const noKeyUrl = GOOGLE_BOOKS_URL + "?" + fallbackParams.toString();
        const r2 = await fetch(noKeyUrl, { headers: getHeaders() });
        const data2 = await r2.json();
        if (data2.error) return res.status(403).json({ message: "Google Books API key error: " + data2.error.message });
        const books2 = (data2.items || []).map(formatBook);
        return res.json({ books: books2, totalItems: data2.totalItems || 0, query, keyUsed: false });
      }
      return res.status(r.status).json({ message: data.error.message });
    }

    const books = (data.items || []).map(formatBook);
    res.json({ books, totalItems: data.totalItems || 0, query, keyUsed: true });

  } catch (err) {
    console.error("Books search error:", err.message);
    res.status(500).json({ message: "Failed to fetch books: " + err.message });
  }
});

// GET /api/books/volume/:id
router.get("/volume/:id", auth, async (req, res) => {
  try {
    const url = buildUrl("/" + req.params.id, {});
    const r = await fetch(url, { headers: getHeaders() });
    if (!r.ok) return res.status(404).json({ message: "Book not found" });
    const data = await r.json();
    if (data.error) return res.status(404).json({ message: data.error.message });
    res.json(formatBook(data));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch book" });
  }
});

module.exports = router;