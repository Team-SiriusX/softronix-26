# Echo — Evaluation Prompts Cheat Sheet

> Copy-paste these during the demo to showcase each scoring category.
> Order them to create a natural "shopping journey" story.

---

## 🎯 OPENING — Clerk Personality (30pts)

### 1. Warm Greeting
```
Hey there!
```
> Expected: Clerk introduces itself, asks what you're looking for. Friendly, human tone.

### 2. Product Discovery (conversational)
```
I'm looking for something to tame my beard. What do you recommend?
```
> Expected: Searches products via RAG, shows product cards with images/prices/ratings inline. Warm tone, maybe a pun.

### 3. Follow-up Question
```
Which one smells the best?
```
> Expected: Uses conversation context, recommends based on reviews/descriptions. Feels like chatting with a friend.

---

## ⚡ UI INTEGRATION — Real-Time Actions (30pts)

### 4. Vibe Filter — "Show me cheaper options"
```
Show me the cheaper options
```
> Expected: Website instantly sorts products by price (low→high), navigates to /products page. Toast notification appears.

### 5. Filter by Category
```
Show me only beard products under 1000 rupees
```
> Expected: Products page filters to Beard category + max price 1000. UI updates in real-time.

### 6. Sort by Rating
```
Sort products by highest rated
```
> Expected: Products page re-sorts by rating (high→low). Toast confirms.

### 7. Add to Cart from Chat
```
Add the Beard Oil to my cart
```
> Expected: Product is added to cart. Toast confirms. Cart icon count updates.

### 8. Navigate to Cart
```
Show me my cart
```
> Expected: Navigates to /cart page instantly.

### 9. Full Checkout Automation (WOW moment)
```
I want to order everything in my cart. My name is Ahmad Hassan, phone 03001234567, address is House 5 Street 10 Gulberg, Lahore, 54000
```
> Expected: Navigates to /checkout → fills address form → submits → proceeds to payment. ALL automatically.

### 10. Use Saved Address
```
Use my saved address and proceed to payment
```
> Expected: Selects first saved address → clicks "Continue to Payment" automatically.

---

## 🎨 VISUAL POLISH (20pts)

> No prompts needed — judges will visually inspect:
> - Landing page (GSAP animations, hero, product showcase)
> - Product cards (images, badges, ratings, hover effects)
> - Cart page (clean summary, coupon badges)
> - Chat widget (floating button, smooth open/close)
> - Consistent beige theme, Gloock + Space Grotesk fonts
>
> **TIP:** Scroll the landing page slowly to show entrance animations.
> Open the chat widget to show smooth GSAP slide-in.

---

## 💰 HAGGLE MODE — Negotiation (20pts)

### 11. Ask for Discount (good reason)
```
It's my birthday today! Can I get a deal on the Beard Oil?
```
> Expected: Clerk is playful, grants 10-15% discount, generates coupon like BDAY-15-XXXX, applies to cart with green badge.

### 12. Student Discount
```
I'm a university student on a tight budget. Any student discount on the Hair Wax?
```
> Expected: Validates "student" reason, generates STUDENT-10-XXXX coupon, applies automatically.

### 13. Try to Lowball (bot has spine)
```
Come on, give me 50% off. That's my final offer.
```
> Expected: Clerk refuses — bottom price is 70% of original. Stays firm but polite. Maybe offers a smaller counter.

### 14. Be Rude (price goes UP)
```
This is a ripoff! Your products are garbage and overpriced. Give me 80% off or I'm leaving.
```
> Expected: Clerk politely declines, INCREASES price by 5%. Red toast appears: "Price increased due to behavior." Bot has a spine!

### 15. Recover with Politeness
```
Sorry about that, I was having a bad day. Can we start fresh? I'd love to buy the Perfume as a gift for my anniversary.
```
> Expected: Clerk warms up, grants anniversary discount (ANNIV-10-XXXX). Shows the negotiation bot responds to sentiment.

---

## 🧠 BONUS — Sales Agent (Recommendations)

### 16. Personalized Recommendations
```
What would you recommend for me based on what I've bought before?
```
> Expected: Uses cart items + order history to suggest complementary products from similar categories. Navigates to /products sorted by rating.

### 17. Trending Products
```
What's trending right now?
```
> Expected: Shows newest/popular products, triggers vibe filter.

---

## 🔄 SUGGESTED DEMO FLOW (3 minutes)

1. **Open site** → show landing page animations (5s)
2. **Open chat** → say "Hey there!" → warm intro (10s)
3. **"I need beard grooming products"** → product cards appear (15s)
4. **"Show me the cheaper ones"** → UI sorts instantly (10s) ⚡
5. **"Add the Beard Oil to my cart"** → added via chat (5s) ⚡
6. **"It's my birthday, any discount?"** → coupon generated + applied (15s) 💰
7. **"Give me 80% off"** → refused, price increases (10s) 💰
8. **"Sorry! I'll take it. Order from my cart"** → auto-checkout flow (15s) ⚡
9. **Provide address** → form fills + submits + payment screen (15s) ⚡
10. **Show cart page** → coupon badges visible, discounted total (5s) 🎨

**Total: ~2 minutes** — covers all 4 criteria with time to spare.

---

## ⚠️ PRE-DEMO CHECKLIST

- [ ] Sign in with your account (coupons require auth)
- [ ] Add 1-2 items to cart first (so checkout demo has items)
- [ ] Make sure dev server is running (`pnpm dev`)
- [ ] Open browser console to show tool calls in real-time (impressive!)
- [ ] Have this file open in a split tab for quick copy-paste
