export const SAMPLE_ROWS = [
  { Date: "2025-01-01", Category: "Direct", Visitors: 120, Sales: 9,  Revenue: 540 },
  { Date: "2025-01-02", Category: "Email",  Visitors:  90, Sales: 7,  Revenue: 420 },
  { Date: "2025-01-03", Category: "Social", Visitors: 150, Sales: 11, Revenue: 660 },
  { Date: "2025-01-04", Category: "Ads",    Visitors: 210, Sales: 15, Revenue: 900 },
  { Date: "2025-01-05", Category: "Direct", Visitors: 175, Sales: 13, Revenue: 780 },
  { Date: "2025-01-06", Category: "Email",  Visitors: 110, Sales: 9,  Revenue: 510 },
  { Date: "2025-01-07", Category: "Social", Visitors: 195, Sales: 14, Revenue: 860 },
  { Date: "2025-01-08", Category: "Ads",    Visitors: 230, Sales: 17, Revenue: 1020 },
  { Date: "2025-01-09", Category: "Direct", Visitors: 160, Sales: 12, Revenue: 720 },
  { Date: "2025-01-10", Category: "Email",  Visitors: 105, Sales: 8,  Revenue: 480 },
];

export const SAMPLE_JSON = JSON.stringify(SAMPLE_ROWS, null, 2);

export const SAMPLE_CSV =
  "Date,Category,Visitors,Sales,Revenue\n" +
  SAMPLE_ROWS.map(r => [r.Date, r.Category, r.Visitors, r.Sales, r.Revenue].join(",")).join("\n");
