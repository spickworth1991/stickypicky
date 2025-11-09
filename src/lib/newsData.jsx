// Consistent, template-style data source for the demo.
// Swap this with a DB/CMS later; the UI won’t change.

export const NEWS_POSTS = [
  {
    slug: "grand-opening-special",
    title: "Grand Opening Special: 20% Off New Client Evaluation",
    excerpt:
      "To celebrate our launch, we’re offering 20% off for new clients. Limited time only.",
    cover: "/og/home.jpg", // optional; reuse an existing image if you like
    category: "Announcements",
    tags: ["coupon", "new-clients"],
    publishedAt: "2025-10-10T09:00:00Z",
    // If draft, it only shows with ?preview=1
    draft: false,
    content: `
**Welcome!** We're thrilled to open our doors.

- 20% off your first evaluation
- Flexible scheduling
- One-on-one personalized care

> Tip: Mention this post at check-in.

### Fine Print
Valid for 30 days from publication. Cannot be combined with other offers.
`,
    coupon: {
      code: "MOTION20",
      expiresAt: "2025-11-30T23:59:59Z",
      cta: "Book Evaluation",
      link: "/contact" // can be any internal link
    }
  },
  {
    slug: "desk-posture-fixes",
    title: "Desk Posture Fixes: 5-Minute Routine",
    excerpt:
      "Neck tightness from desk work? Try this 5-minute micro-routine you can do anywhere.",
    cover: null,
    category: "Education",
    tags: ["posture", "workplace"],
    publishedAt: "2025-10-22T09:00:00Z",
    draft: false,
    content: `
Long sessions at a desk add up. Here's a quick routine:

1. **Chin tucks** (10 reps)
2. **Thoracic rotations** (10 reps/side)
3. **Pec doorway stretch** (30 sec/side)
4. **Hip flexor stretch** (30 sec/side)

Stay consistent for best results.
`,
    coupon: null
  },
  {
    slug: "holiday-schedule",
    title: "Holiday Schedule & Gift Cards",
    excerpt:
      "Check our adjusted hours and grab a gift card for a friend or family member.",
    cover: null,
    category: "Updates",
    tags: ["hours", "gift-cards"],
    publishedAt: "2025-12-01T09:00:00Z",
    draft: true, // hidden unless ?preview=1
    content: `
We'll run a limited schedule over the holidays. Gift cards available at the front desk.

**Hours** will be posted on our Google Business Profile as well.
`,
    coupon: { code: "GIFT10", expiresAt: "2026-01-10T23:59:59Z", cta: "Get Gift Card", link: "/contact" }
  }
];

export function listNews({ query = "", category = "all", tag = "all", preview = false } = {}) {
  let rows = [...NEWS_POSTS];

  if (!preview) rows = rows.filter(p => !p.draft);

  if (category && category !== "all") rows = rows.filter(p => p.category === category);
  if (tag && tag !== "all") rows = rows.filter(p => p.tags.includes(tag));

  if (query.trim()) {
    const q = query.toLowerCase();
    rows = rows.filter(p =>
      [p.title, p.excerpt, p.category, ...(p.tags || [])].join(" ").toLowerCase().includes(q)
    );
  }

  // newest first
  rows.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return rows;
}

export function getNews(slug, { preview = false } = {}) {
  const p = NEWS_POSTS.find(x => x.slug === slug);
  if (!p) return null;
  if (p.draft && !preview) return null;
  return p;
}

export function getFilters() {
  const cats = Array.from(new Set(NEWS_POSTS.map(p => p.category))).sort();
  const tags = Array.from(new Set(NEWS_POSTS.flatMap(p => p.tags))).sort();
  return { categories: cats, tags };
}
