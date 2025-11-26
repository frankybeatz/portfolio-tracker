# Chloé Portfolio Tracker - Complete Setup Guide

A beautiful live portfolio dashboard that you update from a simple Google Sheet.
No coding required after initial setup!

---

## 📋 What You'll Have When Done

- A live website (like `chloe-portfolio.vercel.app`) showing the portfolio
- Real-time BTC price that updates every 30 seconds
- A Google Sheet where you just edit cells to update the dashboard
- Mobile-friendly design Chloé can view on her phone

---

## 🕐 Time Required

- First-time setup: ~20-30 minutes
- Future updates: ~2 minutes (just edit the spreadsheet)

---

## 📦 What You Need

- A Google account (for Google Sheets)
- A GitHub account (free) - we'll create this together
- A Vercel account (free) - we'll create this together

---

# PART 1: CREATE THE GOOGLE SHEET (10 minutes)

This spreadsheet is your "database" - edit it to update the dashboard.

### Step 1.1: Open Google Sheets

1. Go to https://sheets.google.com
2. Sign in with your Google account
3. Click the big **+ Blank** button to create a new spreadsheet

### Step 1.2: Name Your Spreadsheet

1. Click on "Untitled spreadsheet" at the top left
2. Type: `Chloe Portfolio Data`
3. Press Enter

### Step 1.3: Create the 5 Tabs

At the bottom of the screen, you'll see a tab called "Sheet1". We need 5 tabs total.

1. **Right-click** on "Sheet1" → Click **Rename** → Type `Config` → Press Enter
2. Click the **+** button (next to the Config tab) to add a new sheet
3. Right-click the new "Sheet2" → **Rename** → Type `Positions`
4. Repeat to create tabs named: `History`, `Trades`, `Targets`

You should now have 5 tabs at the bottom: `Config | Positions | History | Trades | Targets`

### Step 1.4: Fill In Each Tab

Click on each tab and enter the data exactly as shown:

---

#### TAB 1: Config (click the Config tab)

Type this into the cells:

|     | A | B |
|-----|---|---|
| 1 | key | value |
| 2 | client_name | Chloé Caillet |
| 3 | start_date | June 20, 2025 |
| 4 | total_invested | 50069 |

**What each row means:**
- `client_name` → Name shown on the dashboard
- `start_date` → When the portfolio started
- `total_invested` → Total money put in (used to calculate % return)

---

#### TAB 2: Positions (click the Positions tab)

|     | A | B | C |
|-----|---|---|---|
| 1 | asset | amount | cost_basis |
| 2 | BTC | 0.1744 | 86000 |
| 3 | USDC | 47000 | 1 |

**What each column means:**
- `asset` → The crypto ticker (BTC, ETH, SOL, USDC, etc.)
- `amount` → How much she owns
- `cost_basis` → Average price paid (used to show profit/loss %)

**To update:** Just change the numbers when you buy/sell!

---

#### TAB 3: History (click the History tab)

|     | A | B | C |
|-----|---|---|---|
| 1 | date | value | label |
| 2 | Jun 20 | 30069 | Initial Investment |
| 3 | Jul 4 | 32069 | Carla joins |
| 4 | Aug 11 | 45000 | +$20k capital |
| 5 | Sep 15 | 52000 | |
| 6 | Oct 10 | 58500 | |
| 7 | Nov 1 | 61000 | |
| 8 | Nov 7 | 62500 | Full exit |
| 9 | Nov 14 | 62000 | USDC hold |
| 10 | Nov 21 | 62000 | BTC re-entry |
| 11 | Nov 26 | 62150 | Today |

**What this does:** Creates the performance chart on the dashboard.

**To update:** Add a new row whenever you want to log the portfolio value. The `label` column is optional - only fill it for important events.

---

#### TAB 4: Trades (click the Trades tab)

|     | A | B | C | D | E |
|-----|---|---|---|---|---|
| 1 | date | action | asset | amount | price |
| 2 | Nov 21 | BUY | BTC | 0.1744 | $86,000 |
| 3 | Nov 7 | SELL | BTC | 0.2215 | $103,500 |
| 4 | Nov 7 | SELL | SOL | 108.9 | $164 |
| 5 | Nov 7 | SELL | ETH | 6.43 | $3,300 |

**What each column means:**
- `date` → When the trade happened
- `action` → Either `BUY` or `SELL` (must be uppercase)
- `asset` → What was traded
- `amount` → How much
- `price` → At what price

**To update:** Add new rows at the TOP (row 2) so newest trades show first.

---

#### TAB 5: Targets (click the Targets tab)

|     | A | B |
|-----|---|---|
| 1 | asset | target |
| 2 | BTC | 120000 |
| 3 | ETH | 4750 |
| 4 | SOL | 210 |

**What this does:** Shows the "Price Targets" section. Current prices are pulled live automatically!

**To update:** Just change the `target` prices when your outlook changes. That's it - current prices update themselves.

---

### Step 1.5: Publish the Sheet to the Web

This makes the data readable by the dashboard (but only the data, not editable).

1. Click **File** (top menu)
2. Click **Share** 
3. Click **Publish to web**
4. A popup appears. Leave settings as "Entire Document" and "Web page"
5. Click the blue **Publish** button
6. Click **OK** on the confirmation popup
7. Close this popup

### Step 1.6: Copy Your Sheet ID

Look at the URL bar at the top of your browser. It looks like this:

```
https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456/edit#gid=0
```

The Sheet ID is the long random part between `/d/` and `/edit`:

```
1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
```

**Copy this ID and save it somewhere** (like a note on your phone). You'll need it soon.

---

# PART 2: CREATE A GITHUB ACCOUNT (5 minutes)

GitHub stores your code and connects to Vercel for hosting.

### Step 2.1: Sign Up

1. Go to https://github.com
2. Click **Sign up**
3. Enter your email
4. Create a password
5. Choose a username (like `franklin-swissborg` or whatever you want)
6. Complete the puzzle/verification
7. Check your email and enter the verification code
8. You can skip the personalization questions

### Step 2.2: Create a New Repository

A "repository" (or "repo") is like a folder for your project.

1. Once logged in, click the **+** icon in the top right corner
2. Click **New repository**
3. Fill in:
   - Repository name: `chloe-portfolio-tracker`
   - Description: `Live portfolio dashboard` (optional)
   - Select: **Public** (required for free Vercel hosting)
   - ✅ Check "Add a README file"
4. Click **Create repository**

You now have an empty project folder on GitHub!

---

# PART 3: UPLOAD THE CODE TO GITHUB (5 minutes)

### Step 3.1: Download the Project

If you haven't already, download the zip file I gave you and unzip it:
- On Mac: Double-click the zip file
- On Windows: Right-click → "Extract All"

You should have a folder called `chloe-tracker` with files inside.

### Step 3.2: Add Your Google Sheet ID

1. Open the `chloe-tracker` folder
2. Go into the `src` folder
3. Open `App.jsx` with a text editor:
   - **Mac:** Right-click → Open With → TextEdit
   - **Windows:** Right-click → Open With → Notepad
4. Find this line near the top (around line 9):
   ```
   const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
   ```
5. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID from Step 1.6
   ```
   const SHEET_ID = '1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456';
   ```
6. Save the file (Ctrl+S or Cmd+S)

### Step 3.3: Upload Files to GitHub

1. Go back to your GitHub repository page (github.com/YOURUSERNAME/chloe-portfolio-tracker)
2. Click **Add file** → **Upload files**
3. Open your `chloe-tracker` folder on your computer
4. Select ALL the files and folders inside (not the chloe-tracker folder itself, but everything INSIDE it):
   - `src` (folder)
   - `public` (folder)
   - `package.json`
   - `index.html`
   - `vite.config.js`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `.gitignore`
   - `README.md`
5. Drag them all into the GitHub upload area
6. Scroll down and click the green **Commit changes** button

Wait for the upload to complete. Your code is now on GitHub! 🎉

---

# PART 4: DEPLOY ON VERCEL (5 minutes)

Vercel hosts your website for free and updates it automatically.

### Step 4.1: Create Vercel Account

1. Go to https://vercel.com
2. Click **Sign Up**
3. Click **Continue with GitHub**
4. Authorize Vercel to access your GitHub account
5. You might need to confirm your email

### Step 4.2: Import Your Project

1. Once logged into Vercel, click **Add New...** → **Project**
2. You'll see a list of your GitHub repos
3. Find `chloe-portfolio-tracker` and click **Import**
4. On the configuration screen:
   - Project Name: `chloe-portfolio` (or whatever you like)
   - Framework Preset: It should auto-detect "Vite" ✓
   - Leave everything else as default
5. Click **Deploy**

### Step 4.3: Wait for Build

Vercel will now:
1. Download your code
2. Install dependencies
3. Build the website
4. Deploy it

This takes 1-2 minutes. You'll see a progress log.

### Step 4.4: You're Live! 🚀

When it's done, you'll see "Congratulations!" and a preview of your site.

Click **Visit** to see your live dashboard!

Your URL will be something like: `https://chloe-portfolio.vercel.app`

**Bookmark this URL** and share it with Chloé!

---

# PART 5: HOW TO UPDATE THE PORTFOLIO

This is the easy part - you'll do this regularly.

### When You Make a Trade:

1. **Open your Google Sheet** (Chloe Portfolio Data)

2. **Update the Positions tab:**
   - Change the `amount` for the asset you traded
   - Example: Bought 0.05 more BTC → Change BTC amount from `0.1744` to `0.2244`

3. **Add to the Trades tab:**
   - Insert a new row at row 2 (right-click row 2 → Insert row above)
   - Fill in: date, BUY or SELL, asset, amount, price

4. **Update the History tab:**
   - Add a new row at the bottom with today's date and total portfolio value

5. **Refresh the dashboard** - changes appear within 5 minutes (or immediately if you refresh)

### When to Update Each Tab:

| Tab | When to Update |
|-----|----------------|
| Config | Only if she adds more capital (update `total_invested`) |
| Positions | Every time you buy or sell |
| History | Weekly, or after significant moves |
| Trades | Every time you buy or sell |
| Targets | Only when your price targets change (current prices are live!) |

---

# 📱 SHARING WITH CHLOÉ

Just send her the Vercel URL! She can:
- View on phone or computer
- Bookmark it
- Check anytime - it's always up to date

The dashboard is **read-only** - she can view but not edit anything.

---

# 🔧 TROUBLESHOOTING

### "Loading portfolio..." never stops

- Make sure your Google Sheet is published (Part 1, Step 1.5)
- Check that the Sheet ID is correct in App.jsx
- Verify all 5 tabs exist with exact names: Config, Positions, History, Trades, Targets

### Numbers look wrong

- Don't use currency symbols in the spreadsheet (write `50069` not `$50,069`)
- Don't use commas in numbers (write `50069` not `50,069`)
- Exception: the `price` column in Trades can have `$` for display

### BTC price shows "—"

- The free CoinGecko API has rate limits
- Wait 30 seconds and refresh
- If it persists, the API might be temporarily down

### Changes don't appear

- Spreadsheet changes take up to 5 minutes to appear
- Try a hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Need to update the code?

1. Make changes to the files
2. Go to GitHub → your repo
3. Navigate to the file you want to update
4. Click the pencil icon to edit
5. Make changes
6. Click "Commit changes"
7. Vercel automatically rebuilds (takes 1-2 min)

---

# 🎨 CUSTOMIZATION IDEAS

Things you can change in the Google Sheet:

- **Add more cryptocurrencies:** Add rows to Positions and Targets
- **Different client:** Change `client_name` in Config
- **More history:** Add more rows to History for a longer chart
- **Remove targets section:** Delete all data in Targets tab (leave headers)

---

# 📞 SUPPORT

If you get stuck:
- Take a screenshot of the error
- Note which step you're on
- We can troubleshoot together!

---

Built with ❤️ for SwissBorg clients
