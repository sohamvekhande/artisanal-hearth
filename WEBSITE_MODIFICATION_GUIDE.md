# Website Modification Analysis & Impact Guide

**Created:** April 12, 2026  
**Status:** Production (GitHub + Render Deployment)

---

## 📋 EXECUTIVE SUMMARY

This document analyzes the maintainability and impact of changing:
1. **Website Name** ("The Artisanal Hearth" → New Name)
2. **Menu Items & Images**

The website is **highly modular** but requires coordinated changes across **multiple layers**. No database schema changes needed, but frontend/branding requires systematic updates.

---

## 🔴 PART 1: CHANGING THE WEBSITE NAME

### Current References (19 locations found)

| Layer | Type | Locations | Impact | Difficulty |
|-------|------|-----------|--------|------------|
| **Frontend UI** | HTML/Text | 10 locations in `index.html` | High visibility | Easy |
| **Title/Meta** | HTML `<title>` | 1 location | Browser tab | Easy |
| **Backend** | Comments & Logs | 2 locations in `server.js` | Cosmetic only | Easy |
| **Package Config** | `package.json` | 2 locations | Deployment packaging | Low |
| **Documentation** | README.md | 1 location | Documentation only | Easy |
| **Database** | Schema | NO direct reference | ✅ NO CHANGE NEEDED | N/A |

### ANSWER: Is it possible? YES, with minimal risk.

### What will break? NOTHING would technically break, but here's what needs updating:

#### **Tier 1: CRITICAL - Must Update (User-Facing)**
```
Frontend Display in index.html:
✓ Line 6:    <title>The Artisanal Hearth</title>
✓ Line 79:   <span>The Artisanal Hearth</span> (loader)
✓ Line 90:   <button>The Artisanal Hearth</button> (navbar logo)
✓ Line 265:  <span>The Artisanal Hearth</span> (home page footer)
✓ Line 481:  <span>The Artisanal Hearth</span> (menu page footer)
✓ Line 570:  <span>The Artisanal Hearth</span> (order page footer)
✓ Line 677:  <span>The Artisanal Hearth</span> (reservation page footer)
✓ Line 690:  Story text: "The Artisanal Hearth was founded..." (About page)
✓ Line 721:  <span>The Artisanal Hearth</span> (about page footer)
✓ Line 812:  <span>The Artisanal Hearth</span> (admin footer)
✓ Line 833:  <p>The Artisanal Hearth</p> (order confirm footer)
✓ Line 857:  <p>The Artisanal Hearth</p> (contact confirm footer)
```

**Cost:** 12 text replacements in HTML

#### **Tier 2: OPTIONAL - Should Update (Branding/Documentation)**
```
Backend (cosmetic only - doesn't affect functionality):
✓ Line 2:    server.js - Comment header
✓ Line 418:  server.js - Console log message

Configuration:
✓ Line 2:    package.json - "name" field
✓ Line 4:    package.json - "description" field

Documentation:
✓ Line 2:    README.md - Title
```

**Cost:** 5 text replacements (purely cosmetic/documentation)

#### **Tier 3: SAFE - No Change Needed ✅**
```
Database: 
✓ Orders table: No website name reference
✓ Reservations: No website name reference
✓ Messages: No website name reference
✓ RLS policies: No website name reference

JavaScript:
✓ API endpoints work with any site name
✓ No hardcoded name validation or logic
✓ CSS/Styling: No name-dependent styling
```

### Implementation Path (Safest Order)

```
1. Update index.html (12 replacements) - PRIMARY
2. Update server.js comments (2 replacements) - OPTIONAL
3. Update package.json (2 replacements) - OPTIONAL  
4. Update README.md (1 replacement) - OPTIONAL
5. Test all pages locally
6. Redeploy to Render
7. No database migrations needed ✅
```

### What WONT Break:
- ✅ Orders, reservations, contact forms (all still work)
- ✅ Admin panel functionality
- ✅ Cart system
- ✅ Authentication
- ✅ Image loading
- ✅ Database queries
- ✅ API endpoints

---

## 🟡 PART 2: CHANGING MENU ITEMS & IMAGES

### Current Menu Structure

**Total Menu Items:** 11  
**Categories:** 4 (Coffee, Food, Desserts, Tea & Tonics)

```
Coffee (4 items):
├─ Hearth Smoked Latte           ₹180  → assets/hearth_smoked_latte.jpg
├─ Coorg Cold Brew Tonic         ₹160  → assets/cold_brew.jpg
├─ Araku Filter Coffee           ₹90   → assets/araku_filter_coffe.jpg
└─ Golden Hour Latte             ₹150  → assets/golden_hour_latte.jpg

Food (3 items):
├─ Masala French Toast           ₹170  → assets/masala_frech_toast.jpg
├─ Avocado Achari Toast          ₹190  → assets/Avocado_Achari_toast.jpg
└─ Banana Walnut Bread           ₹120  → assets/banana_walnut_bread.jpg

Desserts (2 items):
├─ Mishti Doi Cheesecake         ₹180  → assets/Mishti_dohi.jpg
└─ Kesar Pista Financier         ₹130  → assets/Kesar_Pista_Financier.jpg

Tea & Tonics (2 items):
├─ Kashmiri Kahwa                ₹140  → assets/kashmiri_kahwa.jpg
└─ Rose Hibiscus Tonic           ₹140  → assets/rose_hibiscus_tonic.jpg
```

### Where Menu Items are Referenced

| Location | Format | Notes |
|----------|--------|-------|
| **HTML Menu Display** | `<div class="menu-item" data-cat="X" data-name="Y">` | 11 items hardcoded |
| **Cart Item Images** | JavaScript `itemImages` object | Manual mapping (line 1077) |
| **Add-to-Cart Buttons** | `data-name` & `data-price` attributes | Multiple instances |
| **Frontend Homepage** | 2 featured items on hero | Specific product showcases |
| **Database** | Orders table stores `items` JSON | Stores name + price + qty |
| **Admin Orders Table** | Display only (no update needed) | Shows customer's item names |

### ANSWER: Is it possible to change items? YES, but requires multi-layer updates.

### Impact Analysis: Easy vs Hard Changes

#### ✅ EASY - Just Change the Text & Image

**Task:** Replace "Hearth Smoked Latte" with "Dark Roast Espresso"

**Steps Required:**
1. Update 3 locations in `index.html` (name text appears 3-4 times for that single item)
2. Update JavaScript `itemImages` object mapping
3. Replace image file: `hearth_smoked_latte.jpg`
4. Verify alt-text
5. Clear browser cache & redeploy

**Affected Items:** 1 product  
**User Risk:** Minimal - only new orders show updated name  
**Backward Compatibility:** Old orders still display original name (stored in DB) ✅

---

#### ⚠️ MODERATE COMPLEXITY - Systematic Changes

**Scenario 1: Replace entire item (same category)**

Example: "Masala French Toast" → "Paneer Paratha"

**What Changes:**
1. HTML: Update display name (3-4 locations)
2. JavaScript: Update `itemImages` mapping key & value
3. Frontend: Update description text
4. Homepage: If featured in hero section (2 instances)
5. Images: Upload new: `paneer_paratha.jpg`
6. Price: Optionally adjust ₹170

**What Stays Same:** ✅
- Category (`data-cat="food"`)
- Database structure (orders still store items properly)
- Cart system
- Admin panel
- Orders from OLD items still display correctly

**User Experience:**
- Past orders show "Masala French Toast" ✅ (historical accuracy)
- New orders show "Paneer Paratha" ✅ (current menu)
- No broken functionality ✅

---

#### 🔴 COMPLEX - Adding/Removing Categories or Items

**Scenario: Add new category "Smoothies" with 3 items**

**What's Required:**
1. Add 4 new `<div class="menu-item" data-cat="smoothies">` blocks to HTML
2. Add 3 new image files to `/assets/`
3. Add 3 new entries to `itemImages` object
4. Add new tab button: `<button data-tab="smoothies">Smoothies</button>`
5. Ensure `setTab()` function recognizes new category
6. Update menu layout grid spacing

**Complexity:** Medium (structural changes to menu grid)  
**Testing Required:** Menu tabs, search filter, cart interactions

---

### Critical Locations for Menu Item Changes

#### **Location 1: HTML Menu Display** (11 menu-item divs)
```html
<!-- File: public/index.html, Lines 294-469 -->

<div class="group menu-item" data-cat="coffee" data-name="hearth smoked latte">
  <div class="bg-surface-container-lowest rounded-4xl...">
    <img alt="Hearth Smoked Latte" src="assets/hearth_smoked_latte.jpg"/>
    <h3>Hearth Smoked Latte</h3>
    <span>₹180</span>
    <p>Description text...</p>
    <button data-add-to-cart data-name="Hearth Smoked Latte" data-price="180">
      Add to Cart
    </button>
  </div>
</div>
```

**Required Changes Per Item:**
- [ ] `data-name` attribute (lowercase for search)
- [ ] Image `alt` text
- [ ] Image `src` path
- [ ] `<h3>` display name
- [ ] Price in `<span>`
- [ ] Description `<p>`
- [ ] Button `data-name` & `data-price`

---

#### **Location 2: JavaScript itemImages Mapping** (Line 1077-1088)
```javascript
const itemImages = {
  'Hearth Smoked Latte': 'assets/hearth_smoked_latte.jpg',
  'Coorg Cold Brew Tonic': 'assets/cold_brew.jpg',
  'Araku Filter Coffee': 'assets/araku_filter_coffe.jpg',
  'Golden Hour Latte': 'assets/golden_hour_latte.jpg',
  'Masala French Toast': 'assets/masala_frech_toast.jpg',
  'Avocado Achari Toast': 'assets/Avocado_Achari_toast.jpg',
  'Banana Walnut Bread': 'assets/banana_walnut_bread.jpg',
  'Mishti Doi Cheesecake': 'assets/Mishti_dohi.jpg',
  'Kesar Pista Financier': 'assets/Kesar_Pista_Financier.jpg',
  'Kashmiri Kahwa': 'assets/kashmiri_kahwa.jpg',
  'Rose Hibiscus Tonic': 'assets/rose_hibiscus_tonic.jpg'
};
```

**CRITICAL:** The object keys MUST EXACTLY match the `data-name` attributes in buttons.  
**Mismatch = Missing image in cart** ❌

---

#### **Location 3: Homepage Featured Items** (Lines 159-214)
```html
<!-- Hero section features 2 specific products -->
<div class="space-y-4">
  <img src="assets/hearth_smoked_latte.jpg" alt="Hearth Smoked Latte"/>
  <h3>Hearth Smoked Latte</h3>
  <button data-add-to-cart data-name="Hearth Smoked Latte" data-price="180">
    Add to Cart
  </button>
</div>

<div class="space-y-4">
  <img src="assets/masala_frech_toast.jpg" alt="Masala French Toast"/>
  <h3>Masala French Toast</h3>
  <button data-add-to-cart data-name="Masala French Toast" data-price="170">
    Add to Cart
  </button>
</div>
```

**If you want to change these featured items:**
- Update 4 text references per item (name, alt, button data-name)
- Update 2 image paths
- Keep same structure

---

### Image File Management

#### Current Assets (in `public/assets/`):

```
✓ hearth_smoked_latte.jpg
✓ cold_brew.jpg
✓ araku_filter_coffe.jpg        ← Note typo: "coffe" not "coffee"
✓ golden_hour_latte.jpg
✓ masala_frech_toast.jpg         ← Note typo: "frech" not "fresh"
✓ Avocado_Achari_toast.jpg
✓ banana_walnut_bread.jpg
✓ Mishti_dohi.jpg
✓ Kesar_Pista_Financier.jpg
✓ kashmiri_kahwa.jpg
✓ rose_hibiscus_tonic.jpg
+ banner_anypurpose.png          ← Backup/general use
+ cafe_interior.jpg              ← Used in About/Contact pages
```

#### Image Name Matching Rules:

**Required:** The filename in `itemImages` object must match the actual file exactly.

```javascript
// ✅ CORRECT - File exists and matches
'Araku Filter Coffee': 'assets/araku_filter_coffe.jpg'  // File indeed has typo

// ❌ WRONG - File doesn't exist
'Araku Filter Coffee': 'assets/araku_filter_coffee.jpg' // File actually named "coffe.jpg"

// ❌ WRONG - Case mismatch (might fail on case-sensitive servers)
'Araku Filter Coffee': 'assets/Araku_Filter_Coffee.jpg' // File is lowercase
```

#### To Add/Replace Images:

1. **Create/edit** new image file
2. **Name it** (lowercase with underscores recommended)
3. **Upload** to `public/assets/`
4. **Update** `itemImages` object with exact filename
5. **Update** HTML `src=` attributes
6. **Test** locally before deployment

---

## 📊 CHANGE COMPLEXITY MATRIX

### Minimal Changes (Low Risk)
| Change | Locations to Update | Time | Risk |
|--------|-------------------|------|------|
| Rename 1 menu item | 4-5 places in HTML + 1 JS entry | 5 min | Low |
| Change 1 price | 2 places in HTML | 2 min | Low |
| Swap 1 image | Upload file + update JS + HTML src | 3 min | Low |
| Update 1 description | 1 place in HTML | 2 min | Low |

### Moderate Changes (Medium Risk)
| Change | Locations to Update | Time | Risk |
|--------|-------------------|------|------|
| Replace entire item (same category) | 4-5 HTML blocks + JS + images | 15 min | Medium |
| Add new item to existing category | 1 HTML block + JS + image + tab logic | 20 min | Medium |
| Rename website name | 12 HTML + 5 config files | 10 min | Low |

### Complex Changes (High Risk)
| Change | Locations to Update | Time | Risk |
|--------|-------------------|------|------|
| Add/Remove entire category | Menu HTML + tabs + JS logic + 3+ items | 45 min | High |
| Major menu overhaul (8+ items) | 40+ text locations | 60 min | High |
| Change database item tracking | DB schema + API + admin panel | Hours | Critical |

---

## 🛠️ STEP-BY-STEP: CHANGE ONE MENU ITEM SAFELY

### Task: Replace "Golden Hour Latte" (₹150) with "Sunset Espresso" (₹155)

```bash
# Step 1: Prepare new image
→ Create/export: sunset_espresso.jpg
→ Save to: public/assets/sunset_espresso.jpg

# Step 2: Update HTML in index.html
Find & replace (4 locations):
  OLD: "Golden Hour Latte"
  NEW: "Sunset Espresso"
  
Find & replace (1 location):
  OLD: "golden_hour_latte"  (in data-name)
  NEW: "sunset espresso"    (lowercase for search)
  
Find & replace (1 location):
  OLD: "golden hour latte" (in menu data-name)
  NEW: "sunset espresso"
  
Find & replace (1 location):
  OLD: data-price="150"
  NEW: data-price="155"
  
Find & replace (1 location):
  OLD: src="assets/golden_hour_latte.jpg"
  NEW: src="assets/sunset_espresso.jpg"

# Step 3: Update JavaScript itemImages object (line 1088)
OLD:  'Golden Hour Latte': 'assets/golden_hour_latte.jpg',
NEW:  'Sunset Espresso': 'assets/sunset_espresso.jpg',

# Step 4: Test locally
→ npm run dev
→ Load http://localhost:3000
→ Test: Add to cart, search "sunset", view menu

# Step 5: Deploy
→ git add .
→ git commit -m "Menu: Replace Golden Hour Latte with Sunset Espresso"
→ git push
→ Render auto-deploys ✅
```

---

## 🔐 WHAT'S PROTECTED (Won't Break)

```
✅ Old Orders: Still display original item names from JSON
   Example: 2026-04-10 order shows "Golden Hour Latte" forever

✅ Customer Data: Phone, email, addresses not affected

✅ Reservations: Book table functionality unaffected

✅ Admin Panel: Still shows all historical data

✅ Contact Forms: Work regardless of menu items

✅ Database Integrity: No schema changes needed

✅ Deployment: No Render config changes required
```

---

## ⚠️ GOTCHAS TO AVOID

### 1. Case-Sensitivity Mismatch
```javascript
// ❌ WRONG - Case mismatch between key and button
itemImages = {'Hearth Smoked Latte': 'asset.jpg'}
button data-name="hearth smoked latte"  // Different case!
// Result: Image won't load in cart

// ✅ CORRECT
itemImages = {'Hearth Smoked Latte': 'asset.jpg'}
button data-name="Hearth Smoked Latte"  // Exact match
```

### 2. Image Path Typos
```javascript
// ❌ WRONG
'Item Name': 'assets/itemname.jpg'  // File is "item_name.jpg"

// ✅ CORRECT
'Item Name': 'assets/item_name.jpg'  // Exact filename
```

### 3. Forgetting Multiple Locations
```
Menu item "Espresso" appears at:
- Line 342: Menu grid card
- Line 353: Add to cart button
- Line 1088: itemImages object
- Line 159: Homepage featured (if featured)
→ Miss one = partial functionality ❌
```

### 4. Spaces vs Underscores
```javascript
// data-name uses actual display name (with spaces)
data-name="Hearth Smoked Latte"

// But data-cat uses underscores/no spaces
data-cat="coffee"

// Filenames: use underscores or hyphens, avoid spaces
assets/hearth_smoked_latte.jpg  ✅
assets/hearth smoked latte.jpg  ❌
```

---

## 🚀 DEPLOYMENT SAFETY CHECKLIST

Before pushing changes to production:

```
☐ All menu-item divs have matching data-name & button data-name
☐ itemImages object has entries for all items
☐ All image files exist in public/assets/
☐ No broken alt-text or missing descriptions
☐ Tested locally: Add to cart works for updated items
☐ Tested locally: Search works for new item names
☐ Tested locally: Menu tabs still filter correctly
☐ No console errors in browser DevTools
☐ All links still work
☐ Git diff reviewed before commit
☐ Commit message descriptive ("Menu: Update items for Spring menu")
```

---

## 📝 SUMMARY: EFFORT ESTIMATES

### Change Website Name
- **Effort:** ~30 minutes (if doing all 14 replacements)
- **Risk:** ✅ Very Low (all text, no logic changes)
- **Breaking Changes:** ✅ None
- **Recommendation:** ✅ Safe to do anytime

### Add/Replace 1-2 Menu Items
- **Effort:** ~15-25 minutes per item
- **Risk:** ✅ Low (if following checklist)
- **Breaking Changes:** ✅ None (old orders unaffected)
- **Recommendation:** ✅ Safe, no deployment risk

### Overhaul 8+ Menu Items or Add Category
- **Effort:** ~1-2 hours
- **Risk:** ⚠️ Medium (more coordination needed)
- **Breaking Changes:** ✅ None to database
- **Recommendation:** ⚠️ Test thoroughly, deploy during low-traffic time

### Modify Database Schema
- **Effort:** Hours to days
- **Risk:** 🔴 High
- **Breaking Changes:** 🔴 Will break old orders display
- **Recommendation:** 🔴 **DO NOT ATTEMPT** - Current structure is perfect

---

## 🎯 FINAL RECOMMENDATIONS

### For Website Name Change
✅ **Go ahead!** It's purely cosmetic and has zero technical risk. Just update text strings.

### For Menu Item Changes
✅ **Highly recommended!** You can:
- Add new items anytime
- Replace existing items anytime  
- Change prices anytime
- Update images anytime
- All without affecting database or past orders

⚠️ **Just be careful with:**
- Exact name matching (itemImages object)
- Image filenames
- Testing locally first

### Don't Change
🔴 **Database schema** - It's perfect as-is. Menu items are stored as JSON text, giving you complete flexibility.

---

**Version:** 1.0  
**Last Updated:** April 12, 2026  
**Status:** Ready for Implementation