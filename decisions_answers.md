# Client decisions — Whobrey Studios portal

**What this is:** A short checklist of choices that affect how we build your app and what you get in the first release. Your answers here keep the build aligned with what you actually want—not assumptions from early notes.

**How to use it:** Read each section. Mark **Yes / No / Not sure** or jot answers inline. Anything marked “we need your input” blocks or steers that part of the build.

---

## A. How you’ll use the product (devices)

| # | Question | Our default (if you say nothing) | Your answer |
|---|----------|----------------------------------|-------------|
| A1 | For **your phone**, is it OK if v1 is a **website that works great on mobile** (and can be “installed” like an app via PWA), instead of a separate download from the App Store / Google Play? | **Yes — web-first + PWA**; native apps only if you later need them. | |
| A2 | Do you need your business to appear in the **App Store** in the first year? | **No** unless you say otherwise. | |

A3? Can we start this as A1 & if things progress like I hope they do, integrate it into an actual app?

---

## B. How clients get in

| # | Question | Our default | Your answer |
|---|----------|-------------|-------------|
| B1 | How should **clients** log in? (e.g. magic link to email, password they set, or both) | **Magic link to email** (simplest for clients). | |
| B2 | How should **you (admin)** log in? Same as clients or stricter (password + optional extra security)? | **Stricter for admin** (password + optional 2-step). | |

B1 - Magic link to email (Google account later?)
B2 - Password starting out (re-visit add security later)

---

## C. Money (deposits & final payment)

| # | Question | Our default | Your answer |
|---|----------|-------------|-------------|
| C1 | **Deposit:** fixed percentage (e.g. 50%), fixed dollar amount, or set per quote in the app? | **Set per quote** in the quote builder. | |
| C2 | **Final payment:** always 100% of remainder after deposit, or sometimes different (rush fee, scope change)? | **Adjustable on the quote / invoice** so you’re not boxed in. | |
| C3 | Your **card processor / merchant**—when you have their name and whether they support **online checkout + automatic “paid” updates to the app**, tell us. We’ll wire payments so the app only unlocks work/downloads when **their system** confirms payment. | Waiting on **your merchant details**. | **Merchant name:** ___ |

C1 - 40% deposit (I'd like to have the ability to adjust this (at later date), if possible. If someone buys a $1,500 logo suite, I feel like asking for $800+ from a stranger would be a big ask)
C2 - 100% for now. If they add additionals, I wouldn't need another deposit. I'd just update the invoice & add another line item for add-ons
C3 - Still figuring out card processor, so let's stall out on this for now.

---

## D. Quotes & project flow

| # | Question | Our default | Your answer |
|---|----------|-------------|-------------|
| D1 | If a client **declines** a quote, should the project **close**, or stay open for a **revised quote**? | **Stay open** — you can send a new quote version. | |
| D2 | Should **“project type”** (logo, decal, social banner, etc.) be a **fixed list** we code once, or a **list you can edit** in the app as your services change? | **You can edit** the list in admin (more flexible). | |
| D3 | **Included revisions:** one default for all jobs (e.g. “2 rounds included”), with ability to **change it per quote**? | **Yes** — global default + override per quote. | |
| D3b | What is your usual **default number of included revisions**? (We’ll use this as the starting default in settings.) | ___ rounds | |

D1 - When declined, I would like the option to choose.
D2 - Any way that we can make it a fixed list & have a "Add item", without having to add a bunch of coding stuff?
D3 - Yes
D3b - 2

---

## E. Files & uploads

| # | Question | Our default | Your answer |
|---|----------|-------------|-------------|
| E1 | Rough **maximum file size** you’ll ever need a client to upload (e.g. 25 MB, 100 MB)? | **50 MB** unless you need larger for print. | |
| E2 | Any file types you **do not** want allowed (or “anything design-related is fine”)? | Common design formats + PDF; block executables. | |
| E3 | Should clients be able to upload **reference images** on the first request form, or only **text** until the project exists? | **Optional file attachments** on request if you want them. | |

E1 - I would say no bigger than 50 MB. Most of the large files, I will be the one uploading. If it's too large of a document, I will probably use a cloud link (since I'm already paying for 2 TB of iCloud space)
E2 - None that I can think of
E3 - Yes.

---

## F. Communication & notifications

| # | Question | Our default | Your answer |
|---|----------|-------------|-------------|
| F1 | When something happens (new request, quote sent, message), what must reach you **immediately**? Pick any: **email**, **text/SMS**, **push to phone**, **only when I open the app**. | **Email + in-app** for v1; push as we add it. | |
| F2 | Is **back-and-forth messaging inside the project** (like a thread per job) enough, or do you need **live chat** (see when the other person is typing)? | **Threaded messages** (not live chat) for v1. | |

F1 - tex/SMS &/or push to phone**
F2 Nothing that serious. I would say just a notification bell that has an indicator if there is a new message.

---

## G. Shop (decals / physical products)

| # | Question | Our default | Your answer |
|---|----------|-------------|-------------|
| G1 | Should the **online shop** (browse, cart, checkout, tracking) ship in the **same first release** as custom design jobs, or **after** the project/quote portal is working? | **After** — get custom workflow solid first. | |
| G2 | If shop is later: will **shipping** be flat rate, calculated by weight, or **you enter shipping cost** per order? | **You enter / adjust** per order at first. | |

G1 - I would like a shop eventually but I think this would be better suited for a "Shop" page on my website (maybe include a re-direct link?). This will be for my own decals/merch/etc.
G2 - TBD at a later date.

---

## H. Branding & content you’ll provide

| # | Item | Who provides | Ready? |
|---|------|--------------|--------|
| H1 | App icon | You / designer | ☐ |
| H2 | Logo for header / splash | You / designer | ☐ |
| H3 | **Colors & fonts** for the app look | You pick or we suggest a minimal palette | ☐ |
| H4 | **Product photos** for the shop (when we build it) | You | ☐ |

H1 - Yes
H2 - Yes
H3 - I pick & customer requests changes
H4 - I will provide shop images (need to get some use out of my $800 camera lol)

---

## I. Legal / business (we build software, not legal advice)

| # | Question | Your answer |
|---|----------|-------------|
| I1 | Do you have (or will you use) **terms of service**, **privacy policy**, and **refund/cancellation** language for clients? We can link them in the app once you have the text or a URL. | ☐ Yes — link: ___ |
| I2 | Any **sales tax** rules we should know for the shop (when built)? | |

I1 - Yes - Will provide at later date
I2 - Yes - I have an EIN & everything now, so I will have to collect sales tax

---

## J. Summary — quick yes/no

Answer **Y / N** in the right column if you want a fast pass:

| Statement | Y / N |
|-----------|-------|
| Mobile v1 can be a great mobile **website** (PWA), not necessarily App Store apps. |Y|
| Clients can log in mainly with **email magic link**. |Y|
| **Shop** can come **after** the custom project + quote flow. |Y|
| **Threaded messages** per project are enough (no live chat v1). |Y|
| You’re OK setting **deposit / final amounts per quote** rather than one rigid rule for every job. |Y|

---

**Next step:** Return this file (or a copy with answers) and we’ll lock `DESIGN.md` where your choices replace “defaults” and “open questions.”