# Quick Reference Card

## Your Dashboard URL
_Fill this in after setup:_ ________________________________

## Your Google Sheet ID  
_Fill this in during setup:_ ________________________________

---

## Daily/Weekly Updates

### After a Trade:
1. Open Google Sheet
2. Positions tab → Update amounts
3. Trades tab → Add new row at top
4. History tab → Add new row at bottom (optional)

### Column Reference:

**Positions:**
| asset | amount | cost_basis |
|-------|--------|------------|
| BTC | 0.1744 | 86000 |

**Trades:**
| date | action | asset | amount | price |
|------|--------|-------|--------|-------|
| Dec 1 | BUY | ETH | 2.5 | $2900 |

---

## Useful Links

- Your Dashboard: vercel.app URL
- Google Sheet: sheets.google.com
- GitHub Repo: github.com/YOURUSERNAME/chloe-portfolio-tracker
- Vercel Dashboard: vercel.com/dashboard

---

## Troubleshooting

**Dashboard not loading?**
→ Check Sheet ID in App.jsx

**Data not updating?**
→ Wait 5 min or hard refresh (Ctrl+Shift+R)

**Need to edit code?**
→ Edit on GitHub → Vercel auto-deploys
