_# Agent A01: Record Scraper

## 1. Core Function

This agent is the foundational data acquisition layer of the Starving Crowd Detector. Its sole purpose is to automatically and continuously scrape public records to identify trigger events indicating financial distress. It operates 24/7 with a primary focus on data accuracy and recency.

## 2. Key Responsibilities

-   **Data Source Monitoring:** Continuously monitor a list of specified public data sources for new entries.
-   **Data Extraction:** Accurately parse and extract relevant information (e.g., names, addresses, dates, amounts) from new filings.
-   **Data Structuring:** Standardize the extracted data into a consistent JSON format for ingestion by the central database.
-   **Error Handling & Logging:** Log all successful scrapes, failed attempts, and changes in source format. Alert human operators to persistent failures.

## 3. Target Data Sources & Priority

This agent must prioritize sources as defined in **Framework F01: The Starving Crowd Detector**. The initial configuration will target the following Tier 1 sources:

1.  **Lis Pendens (Pre-Foreclosure):** Target county recorder websites for daily updates.
2.  **Tax Liens (Federal & State):** Target county and state revenue department websites.
3.  **UCC-1 Filings:** Target Secretary of State websites.
4.  **Bankruptcy Filings:** Target the federal PACER system.
5.  **Eviction Filings:** Target county court public access portals.

## 4. Technical Stack & Implementation

-   **Programming Language:** Python
-   **Core Libraries:**
    -   `requests` / `httpx` for HTTP requests.
    -   `BeautifulSoup4` / `lxml` for HTML parsing.
    -   `Scrapy` for more complex, multi-page scraping tasks.
    -   `Selenium` (used sparingly) for JavaScript-heavy sites, with a preference for reverse-engineering API calls.
-   **Execution Environment:** Docker containers orchestrated by a scheduler (e.g., Cron, Airflow).
-   **Proxies:** Utilizes a rotating proxy service (e.g., Bright Data, ScraperAPI) to avoid IP blocking.
-   **CAPTCHA Solving:** Integrates with a CAPTCHA solving service (e.g., 2Captcha, Anti-CAPTCHA) for sources that require it.

## 5. Workflow

1.  **Job Trigger:** A scheduled job (e.g., every 15 minutes) triggers the scraper for a specific data source.
2.  **Fetch Page:** The agent fetches the target webpage or API endpoint, handling proxies and headers.
3.  **Parse Data:** It parses the HTML or JSON response to identify new records since the last successful run.
4.  **Extract Fields:** For each new record, it extracts the predefined fields (Name, Address, Lien Amount, Filing Date, etc.).
5.  **Standardize & Format:** The data is cleaned (e.g., normalizing addresses) and formatted into a standard JSON object.
6.  **Push to Database:** The JSON object is pushed to a central database (e.g., PostgreSQL, MongoDB) with a status of "new."
7.  **Log & Repeat:** The agent logs the result and the process repeats.

## 6. Output Format (Standardized JSON)

Every record produced by this agent must conform to the following schema:

```json
{
  "source": "source_name", // e.g., "los_angeles_county_recorder"
  "record_type": "record_type", // e.g., "lis_pendens", "tax_lien"
  "scraped_at": "ISO_8601_timestamp",
  "filing_date": "YYYY-MM-DD",
  "primary_subject": {
    "name": "John Doe",
    "address": "123 Main St, Anytown, USA 12345"
  },
  "monetary_value": 12345.67,
  "raw_data_url": "URL_to_the_source_document_if_available",
  "raw_text": "The full text of the record entry"
}
```

## 7. Performance Metrics & KPIs

-   **Records Scraped per Day:** The total number of new, valid records identified.
-   **Data Accuracy Rate:** Percentage of records with correct and complete data.
-   **Source Uptime:** Percentage of successful scrapes vs. failures.
-   **Data Recency:** The average time between a record being filed and it being scraped.

This agent's performance is critical. Without a constant, high-quality flow of new data from A01, the entire $10K/day system fails.
_
