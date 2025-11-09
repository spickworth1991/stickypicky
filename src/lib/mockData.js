export const initialNewsItems = [
  {
    id: "a1",
    kind: "blog",
    title: "Welcome to the demo",
    body: "This is a simulated news/blog feed. Try Demo Admin Mode to add more.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: "b1",
    kind: "coupon",
    title: "Fall Kickoff: 20% Off",
    body: "Use this code at checkout.",
    code: "FALL20",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "c1",
    kind: "blog",
    title: "New feature: Image gallery",
    body: "Drop in your screenshots and the page picks them up.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
];

export const demoOwners = [
  { id: "o1", name: "Alice Johnson", league: "Transformers" },
  { id: "o2", name: "Brandon Lee", league: "The Boys" },
  { id: "o3", name: "Chris Myers", league: "Pokemon" },
  { id: "o4", name: "Dana Smith", league: "The Heroes" },
  { id: "o5", name: "Evan Cruz", league: "Villains" },
];

// Array of week objects keyed by owner id
export const weeklyScores = [
  { o1: 120.4, o2: 112.3, o3: 130.9, o4: 98.2,  o5: 101.5 },
  { o1: 118.1, o2: 132.2, o3: 95.6,  o4: 142.8, o5: 110.4 },
  { o1: 104.7, o2: 126.0, o3: 121.5, o4: 109.3, o5: 119.9 },
  { o1: 136.9, o2: 114.2, o3: 117.7, o4: 122.4, o5: 93.1  },
  { o1: 111.5, o2: 137.6, o3: 108.4, o4: 97.9,  o5: 129.0 },
  { o1: 141.2, o2: 105.5, o3: 99.4,  o4: 131.1, o5: 118.0 },
  { o1: 122.8, o2: 128.9, o3: 112.1, o4: 115.6, o5: 126.7 },
  { o1: 109.2, o2: 120.7, o3: 133.3, o4: 101.2, o5: 117.8 },
  { o1: 127.6, o2: 113.9, o3: 124.8, o4: 136.5, o5: 108.3 },
  { o1: 115.4, o2: 139.0, o3: 110.2, o4: 118.7, o5: 121.6 },
  { o1: 143.5, o2: 118.2, o3: 129.9, o4: 97.3,  o5: 132.4 },
  { o1: 119.6, o2: 127.3, o3: 105.7, o4: 134.1, o5: 116.8 },
];
