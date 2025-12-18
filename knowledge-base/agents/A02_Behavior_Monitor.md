_# Agent A02: Behavior Monitor

## 1. Core Function

While Agent A01 focuses on static, official records, Agent A02 is designed to detect dynamic, behavioral signals of distress. It monitors online platforms for actions that indicate a person or business is in a state of need or crisis. This agent adds a layer of real-time, behavioral context to the public record data.

## 2. Key Responsibilities

-   **Platform Monitoring:** Actively scan social media, forums, marketplaces, and review sites for predefined distress keywords and behaviors.
-   **Signal Identification:** Identify patterns such as sudden price drops, desperate language, or spikes in negative sentiment.
-   **Lead Extraction:** Capture the identity and context of the individual or business exhibiting the distress signals.
-   **Cross-Referencing:** Correlate behavioral signals with records from Agent A01 to increase lead scores (e.g., a person on a pre-foreclosure list who is also selling furniture on Facebook Marketplace).

## 3. Target Platforms & Signals

This agent is configured to look for specific patterns on platforms where people reveal their circumstances through their actions.

| Platform | Target Signal(s) | Implied Pain |
|---|---|---|
| **Facebook Marketplace / Craigslist** | Multiple high-value items listed in a short period; keywords like "must sell," "OBO," "moving." | Urgent need for cash. |
| **GoFundMe / Crowdfunding Sites** | Campaigns related to medical emergencies, business failures, or preventing foreclosure/eviction. | Overwhelming financial crisis. |
| **LinkedIn** | Sudden change of status to "Open to Work," frantic activity from a previously dormant profile. | Job loss or career crisis. |
| **Niche Facebook Groups / Reddit** | "In Search Of" (ISO) posts for service providers; posts expressing frustration with a current provider. | Active buyer with an immediate need. |
| **Glassdoor / Yelp / Google Reviews** | A sudden spike in negative reviews for a specific business; owner responses that are defensive or desperate. | Operational collapse, customer service failure. |
| **Real Estate Sites (Zillow, Redfin)** | Multiple price drops on a property listing in a short timeframe; "motivated seller" in the description. | Desperation to sell a property. |

## 4. Technical Stack & Implementation

-   **Programming Language:** Python
-   **Core Libraries:**
    -   `BeautifulSoup4` / `lxml` for parsing.
    -   `requests` / `httpx` for API calls.
    -   Official APIs where available (e.g., Reddit PRAW).
    -   `Pandas` for data analysis and pattern detection.
-   **Natural Language Processing (NLP):**
    -   Uses libraries like `spaCy` or `NLTK` for sentiment analysis and keyword extraction.
    -   A custom-trained model to detect "desperation language."
-   **Execution Environment:** Runs as a series of scheduled jobs, similar to A01.

## 5. Workflow

1.  **Target Scan:** The agent initiates a scan of a specific platform (e.g., a set of relevant subreddits).
2.  **Keyword & Pattern Matching:** It filters posts and listings based on a predefined list of distress keywords and patterns.
3.  **Sentiment Analysis:** It runs sentiment analysis on the filtered content to gauge the emotional intensity.
4.  **Entity Extraction:** It identifies the name of the person or business and any associated contact information.
5.  **Signal Qualification:** The signal is scored based on its intensity, recency, and the platform it originated from.
6.  **Database Ingestion:** The qualified lead is pushed to the central database, either as a new entry or as an enrichment to an existing record from A01.

## 6. Output Format (Standardized JSON)

```json
{
  "source": "platform_name", // e.g., "facebook_marketplace", "reddit_r_personalfinance"
  "record_type": "behavioral_signal",
  "scraped_at": "ISO_8601_timestamp",
  "signal_type": "signal_description", // e.g., "price_drop", "desperation_language"
  "subject": {
    "name": "Jane Smith",
    "profile_url": "URL_to_the_user_profile_if_available"
  },
  "content_snippet": "The text of the post or listing that triggered the alert.",
  "sentiment_score": -0.85, // Range from -1 (very negative) to 1 (very positive)
  "raw_data_url": "URL_to_the_source_post_or_listing"
}
```

## 7. Performance Metrics & KPIs

-   **Signals Detected per Day:** Total number of qualified behavioral leads.
-   **Signal-to-Conversation Rate:** The percentage of behavioral signals that lead to a conversation.
-   **Enrichment Rate:** The percentage of records from A01 that are successfully enriched with data from A02.

Agent A02 provides the "why" behind the "what." It finds the human story in the data, allowing for a much more empathetic and effective outreach.
_
