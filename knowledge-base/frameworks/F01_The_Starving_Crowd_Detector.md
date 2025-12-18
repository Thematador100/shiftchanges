# Framework F01: The Starving Crowd Detector

## 1. Principle

This system is the heart of our entire operation. Its sole purpose is to identify individuals and businesses experiencing acute, undeniable, and time-sensitive pain. We do not target demographics; we target trigger events. A trigger event is a publicly observable occurrence that signals a high probability of desperation.

## 2. Data Sources: The Tiers of Pain

We categorize data sources into three tiers based on the immediacy and severity of the distress signal.

### Tier 1: Financial Crisis (Highest Urgency)

These are legal filings that indicate severe financial distress. They are the most reliable predictors of a starving crowd.

| Signal | Data Source(s) | Target Profile | Implied Pain |
|---|---|---|---|
| **UCC-1 Lien Filing** | State Secretary of State databases, Commercial Lien Registries | Business Owner | Just pledged assets for a loan; likely has severe cash flow issues. |
| **Lis Pendens (Pre-Foreclosure)** | County Recorder/Clerk Offices | Homeowner | 90+ days delinquent on mortgage; at immediate risk of losing their home. |
| **Tax Lien (Federal/State)** | IRS Public Records, County Recorder Offices | Business or Individual | Government has a legal claim to their assets; bank accounts can be seized. |
| **Mechanic's Lien** | County Recorder Offices | Property Owner / Contractor | A contractor has not been paid, indicating a dispute or cash flow problem for one or both parties. |
| **Judgment Filing** | State/County Court Records (PACER for Federal) | Business or Individual | Lost a lawsuit and now legally owes a significant sum of money. |
| **Eviction Filing (Unlawful Detainer)** | County Court Records | Landlord | Losing money on a property due to a non-paying tenant. |
| **Bankruptcy Filing (Chapter 7, 11, 13)** | PACER (Federal Court System) | Business or Individual | The ultimate signal of financial collapse and desperation. |

### Tier 2: Business & Operational Crisis

These signals indicate a business is failing, in chaos, or on the verge of collapse.

| Signal | Data Source(s) | Target Profile | Implied Pain |
|---|---|---|---|
| **WARN Act Notice** | State Department of Labor websites | Company Leadership (CEO, CFO) | Legally required to announce mass layoffs; a clear sign of major financial trouble. |
| **Sudden Price Drops** | E-commerce sites, Business-for-sale listings (BizBuySell) | Business Owner | Slashing prices is a classic sign of a desperate need for cash flow. |
| **Negative Review Spike** | Glassdoor, Yelp, Google Reviews, BBB | Business Owner | A sudden surge in negative reviews indicates a systemic operational failure. |
| **Ad Spend Cessation** | Facebook Ad Library, SEMrush, SpyFu | Business Owner | Suddenly stopping all advertising is a primary indicator of a budget crisis. |
| **Hiring "Turnaround" Roles** | LinkedIn, Indeed | Company Leadership | A company hiring a "Turnaround Consultant" or "Interim CFO" is openly admitting it's in crisis. |

### Tier 3: Personal & Professional Crisis

These signals point to individuals facing life-altering, high-stakes personal problems.

| Signal | Data Source(s) | Target Profile | Implied Pain |
|---|---|---|---|
| **Divorce Filing** | County Court Records | High-Net-Worth Individual | Facing a complex and emotionally draining division of assets. |
| **Probate Filing** | County Surrogate/Probate Court | Heirs of an Estate | Inherited property they often don't want and need to sell quickly. |
| **Professional License Complaint** | State Licensing Boards (Medical, Legal, etc.) | Licensed Professional (Doctor, Lawyer) | Career and livelihood are under direct threat. |
| **GoFundMe Campaigns** | GoFundMe, other crowdfunding sites | Individual / Family | Facing a medical or financial emergency they cannot handle alone. |

## 3. The AI Detection System: Agent Workflow

1.  **Scraping & Ingestion:** AI Agent A01 (Record Scraper) and A02 (Behavior Monitor) run continuously, pulling raw data from these sources via APIs or custom scrapers.
2.  **Enrichment:** The system automatically enriches raw data (e.g., a name and address from a lien) with contact information (email, phone) using APIs like PeopleDataLabs, Hunter.io, or custom skip-tracing services.
3.  **Scoring & Prioritization:** Each lead is scored based on a proprietary algorithm:
    - **Recency:** A filing from yesterday is worth 10x one from last month.
    - **Severity:** A tax lien is more severe than a negative review.
    - **Value:** The dollar amount associated with the lien/judgment.
    - **Tier:** Tier 1 signals receive the highest base score.
4.  **Output:** The system generates a prioritized list of the top 200+ targets for the day, complete with enriched contact data and the specific trigger event, ready for the Outreach Generator (Agent A03).

This is a non-stop, 24/7 process. The system ensures we are always acting on the freshest, most potent signals of desperation.
