# Framework F04: The Free Data Arsenal

## 1. Principle

Data is the raw material of alchemy. The most valuable data is often free, hiding in plain sight in government databases, public records, and open-source repositories. This framework catalogs the most actionable free data sources, organized by the type of intelligence they provide. Our goal is to know about a business's problem before they do, or to possess information that gives us an asymmetric advantage in any negotiation.

## 2. The Master Data Source List

### Category A: Financial & Corporate Distress

These sources reveal the financial health and legal standing of businesses and individuals.

| Source | API/Access | Data Available | Distress Signal |
|---|---|---|---|
| **SEC EDGAR** | Free API | All public company filings (10-K, 10-Q, 8-K, insider trading) | Declining revenue, increased debt, executive departures, material adverse events. |
| **USAspending.gov** | Free API | All federal government contract awards and spending | Identify companies winning large contracts (opportunity) or losing them (distress). |
| **PACER / CourtListener** | CourtListener API (free tier) | Federal court filings, bankruptcy cases, civil litigation | Bankruptcy filings, major lawsuits, judgments. |
| **State Secretary of State** | Varies by state (many have free search) | UCC filings, business registrations, annual reports | UCC liens indicate a company has pledged assets for a loan (cash flow crisis). |
| **County Recorder Offices** | Varies by county (many have free online portals) | Property liens, lis pendens (pre-foreclosure), mechanic's liens, judgments | Tax liens, pre-foreclosure filings, unpaid contractor debts. |

### Category B: Legal & Regulatory Intelligence

These sources reveal compliance issues, legal exposure, and regulatory risk.

| Source | API/Access | Data Available | Distress Signal |
|---|---|---|---|
| **EPA ECHO Database** | Free API | Environmental compliance data, violations, enforcement actions | Companies facing EPA enforcement are in crisis mode and may need help with compliance automation. |
| **OSHA Data** | Free API | Workplace safety violations, inspections, penalties | A company with a recent OSHA violation is a target for safety automation and compliance services. |
| **FDA Import Refusal Reports** | Free downloadable data | List of all shipments refused entry by the FDA | Importers with refused shipments (especially perishables) are in a "hair on fire" situation. |
| **State Licensing Boards** | Varies by state | Professional license complaints, disciplinary actions | Doctors, lawyers, and other professionals facing license issues are desperate for reputation management. |

### Category C: Market & Economic Intelligence

These sources provide the data to build hyper-local market analyses and identify macro trends.

| Source | API/Access | Data Available | Distress Signal / Opportunity |
|---|---|---|---|
| **Census Bureau APIs** | Free API (20+ datasets) | Demographics, income, housing, business patterns, workforce indicators | Identify areas of economic decline or growth for targeted outreach. |
| **Bureau of Economic Analysis (BEA)** | Free API | GDP, regional economics, industry data | Understand the economic health of a region or industry. |
| **Bureau of Labor Statistics (BLS)** | Free API | Employment, wages, inflation, productivity | Identify industries with labor shortages or wage pressures. |
| **Department of Labor WARN Act** | Free (state-by-state websites) | Mass layoff and plant closure announcements | Companies announcing layoffs are in financial distress and may need automation to cut further costs. |

### Category D: Intellectual Property & Innovation

These sources reveal competitive intelligence and innovation trends.

| Source | API/Access | Data Available | Distress Signal / Opportunity |
|---|---|---|---|
| **USPTO Open Data Portal** | Free API | Patent filings, trademark registrations, patent assignments | Identify innovative companies, track competitor R&D, find abandoned trademarks. |
| **Google Scholar** | Free (no official API, but scrapable) | Academic publications, citations | Identify cutting-edge research that can be commercialized. |
| **PubMed / NIH Reporter** | Free API | Biomedical research, NIH-funded grants | Identify researchers and institutions working on specific problems. |

### Category E: Public Domain & Open Knowledge

These sources provide free content that can be used to build products and services.

| Source | API/Access | Data Available | Use Case |
|---|---|---|---|
| **Project Gutenberg** | Free | 70,000+ public domain ebooks | Train LLMs, create content products. |
| **Internet Archive** | Free API | Billions of archived web pages, books, audio, video | Historical research, content creation. |
| **Wikipedia / Wikidata** | Free API | Structured knowledge graph of the world | Build knowledge bases for AI agents. |
| **OpenStreetMap** | Free API | Detailed geographic data | Build location-based services. |

## 3. The n8n Workflow: Automated Data Harvesting

Your n8n server should have dedicated workflows for each of these data sources. The goal is to automate the process of:

1.  **Scraping:** Pulling new data from the source on a regular schedule.
2.  **Filtering:** Applying rules to identify records that match our "Starving Crowd" criteria.
3.  **Enriching:** Adding contact information and other relevant data to the filtered records.
4.  **Alerting:** Pushing high-priority leads to a central dashboard or directly to the Outreach Generator (A03).

This automated data harvesting is the foundation of our asymmetric information advantage.
