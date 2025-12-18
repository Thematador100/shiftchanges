_# Agent A03: Outreach Generator

## 1. Core Function

This agent is the bridge between data and conversation. It takes the prioritized, enriched leads from Agents A01 and A02 and initiates a personalized, multi-channel outreach sequence. Its primary goal is to deliver the "Engineering as Marketing" asset and generate a warm inbound conversation. This agent is responsible for executing the critical first touchpoint with precision and empathy.

## 2. Key Responsibilities

-   **Lead Ingestion:** Ingest the top 200+ daily leads from the central database.
-   **Asset Generation:** For each lead, trigger the generation of the appropriate "Free Solve" asset based on their specific trigger event (as defined in Framework F02).
-   **Message Personalization:** Craft a unique, personalized message for each lead that references their specific situation, demonstrates empathy, and introduces the Free Solve asset.
-   **Multi-Channel Execution:** Deploy the message across a predefined sequence of channels (Email, SMS, LinkedIn, Voicemail Drop).
-   **Response Routing:** Monitor for responses and route positive or neutral replies to the appropriate human or AI closing agent.

## 3. The Outreach Sequence (Default)

The agent follows a timed, multi-channel sequence designed to maximize contact rate without being overly aggressive.

-   **Time 0 (Day 1, 9:00 AM):** **Email** - The primary outreach, containing the full personalized message and the link/attachment for the Free Solve asset.
-   **Time + 4 Hours (Day 1, 1:00 PM):** **LinkedIn** - A connection request or InMail with a softer version of the message, referencing the email.
-   **Time + 24 Hours (Day 2, 9:00 AM):** **SMS** - A concise message referencing the email and asking if they had a chance to review the analysis.
-   **Time + 28 Hours (Day 2, 1:00 PM):** **Ringless Voicemail Drop** - A pre-recorded, calm, and professional voicemail referencing the email and providing a direct callback number.

## 4. Technical Stack & Implementation

-   **Programming Language:** Python
-   **Core Libraries:**
    -   `Jinja2` for message templating.
    -   `requests` / `httpx` for interacting with email, SMS, and other APIs.
-   **LLM Integration:** Uses a powerful Large Language Model (e.g., GPT-4, Claude) via API to generate the personalized message body based on a structured prompt and the lead's data.
-   **Service APIs:**
    -   **Email:** SendGrid / Amazon SES
    -   **SMS:** Telnyx / Twilio
    -   **LinkedIn:** LinkedIn automation tools (used with caution to avoid account suspension).
    -   **Voicemail:** Slybroadcast / Twilio

## 5. Workflow

1.  **Fetch Lead:** The agent pulls the highest-priority lead from the database that has not yet been contacted.
2.  **Generate Free Solve:** It sends the lead's data to the "Engineering as Marketing" engine to generate the personalized PDF report/asset.
3.  **Construct LLM Prompt:** It constructs a detailed prompt for the LLM, including the lead's name, distress signal, the Free Solve asset summary, and the desired tone (empathetic, authoritative, not salesy).
4.  **Generate Message:** The LLM returns a personalized message body.
5.  **Populate Templates:** The agent inserts the LLM-generated body into the templates for each channel (Email, SMS, etc.).
6.  **Execute Outreach:** The agent sends the first message (Email) via the appropriate API.
7.  **Schedule Follow-ups:** It schedules the subsequent steps (LinkedIn, SMS, Voicemail) in its job queue.
8.  **Log & Repeat:** The outreach is logged, and the agent moves to the next lead.

## 6. The LLM Prompt for Personalization (Example)

```
[SYSTEM]
You are an expert business writer specializing in empathetic, high-impact outreach. Your tone is that of a helpful, authoritative expert, not a salesperson. You are direct but respectful. Your goal is to get the prospect to open the attached analysis.

[LEAD DATA]
- Name: John Smith
- Distress Signal: Tax Lien
- Filing Date: 2023-10-26
- Amount: $47,500
- Free Solve Asset: Penalty Abatement Eligibility Analysis (shows 85% probability of success)

[TASK]
Write a short, direct email to John. Acknowledge the tax lien specifically. Introduce the free analysis you've already prepared for him. End with a soft call to action.

[OUTPUT]
Subject: Regarding the tax lien filed on October 26th

Hi John,

My firm specializes in resolving complex tax issues, and I saw the $47,500 IRS lien filed last week.

I know this situation can be stressful, so I took the liberty of running your case details through our analysis system. Based on the filing, there's a high probability that you are eligible for penalty abatement, which could significantly reduce the total amount owed.

I've attached the 1-page analysis for your review. It's yours to keep, no strings attached.

If you'd like to discuss the options outlined in the report, I have some time this Thursday.

Best,

[Your Name]
```

## 7. Performance Metrics & KPIs

-   **Outreaches Sent per Day:** Must meet the daily target of 200+.
-   **Open Rate / Reply Rate:** The effectiveness of the subject lines and message bodies.
-   **Positive Reply Rate:** The percentage of replies that are not "unsubscribe" or hostile.
-   **Conversion to Conversation:** The number of outreaches that result in a scheduled call or meaningful exchange.

This agent is the voice of our operation. Its ability to personalize at scale is what separates our system from generic marketing automation.
_
