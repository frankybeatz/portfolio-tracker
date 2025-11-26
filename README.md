# Chloé Portfolio Tracker

A live portfolio tracking dashboard that pulls data from a Google Sheet.

## 🚀 Quick Setup (10 minutes)

### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "Chloe Portfolio Data"
3. Create **5 tabs** (rename the sheets at the bottom):

#### Tab 1: `Config`
| key | value |
|-----|-------|
| client_name | Chloé Caillet |
| start_date | June 20, 2025 |
| total_invested | 50069 |

#### Tab 2: `Positions`
| asset | amount | cost_basis |
|-------|--------|------------|
| BTC | 0.1744 | 86000 |
| USDC | 47000 | 1 |

#### Tab 3: `History`
| date | value | label |
|------|-------|-------|
| Jun 20 | 30069 | Initial Investment |
| Aug 11 | 45000 | +$20k capital |
| Nov 7 | 62500 | Full exit |
| Nov 21 | 62000 | BTC re-entry |
| Nov 26 | 62150 | Today |

#### Tab 4: `Trades`
| date | action | asset | amount | price |
|------|--------|-------|--------|-------|
| Nov 21 | BUY | BTC | 0.1744 | $86,000 |
| Nov 7 | SELL | BTC | 0.2215 | $103,500 |
| Nov 7 | SELL | SOL | 108.9 | $164 |
| Nov 7 | SELL | ETH | 6.43 | $3,300 |

#### Tab 5: `Targets`
| asset | current | target |
|-------|---------|--------|
| BTC | 87000 | 120000 |
| ETH | 2900 | 4750 |
| SOL | 137 | 210 |

### Step 2: Publish the Sheet

1. In Google Sheets, go to **File → Share → Publish to web**
2. Select **Entire Document** and **Web page**
3. Click **Publish**
4. Copy the Sheet ID from the URL. It's the long string between `/d/` and `/edit`

Example URL:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz789DEF/edit
                                       ^^^^^^^^^^^^^^^^
                                       This is your Sheet ID
```

### Step 3: Add Your Sheet ID

Open `src/App.jsx` and replace the placeholder on line 9:

```javascript
const SHEET_ID = '1ABC123xyz789DEF';  // ← Your actual Sheet ID
```

### Step 4: Deploy to Vercel

1. Push this project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/chloe-tracker.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in with GitHub

3. Click **"Add New Project"**

4. Import your `chloe-tracker` repository

5. Click **Deploy** (default settings are fine)

6. Done! Your tracker is live at `https://chloe-tracker.vercel.app` (or similar)

---

## 📊 How to Update the Portfolio

Just edit the Google Sheet! Changes appear on the dashboard within 5 minutes (or refresh the page).

**When Chloé buys/sells:**
1. Update the `Positions` tab with new amounts
2. Add a row to `Trades` tab
3. Add a data point to `History` tab

**The BTC price updates automatically** every 30 seconds from CoinGecko.

---

## 🛠 Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

---

## 📁 Project Structure

```
chloe-tracker/
├── src/
│   ├── App.jsx      # Main dashboard component
│   ├── main.jsx     # Entry point
│   └── index.css    # Tailwind styles
├── public/
│   └── favicon.svg  # SwissBorg-style icon
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🔒 Privacy Note

The Google Sheet must be "Published to web" to work, but this only exposes the specific data you put in. Don't include sensitive info like wallet addresses or passwords.

For more privacy, you could upgrade to use Google Sheets API with authentication instead.
