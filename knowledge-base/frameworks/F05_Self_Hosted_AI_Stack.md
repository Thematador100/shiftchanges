# Framework F05: The Self-Hosted AI Stack

## 1. Principle

We do not pay rent to SaaS landlords. We build our own infrastructure. By self-hosting our AI stack, we achieve three critical advantages: **cost control** (near-zero marginal cost per operation), **data privacy** (a selling point for sophisticated clients), and **proprietary capability** (a stack that competitors cannot easily replicate). This framework defines the components of our self-hosted AI stack.

## 2. The Core Stack Components

### 2.1. Workflow Automation: n8n

**n8n** is the central nervous system of our operation. It is a self-hosted, open-source workflow automation tool that replaces Zapier and Make.com.

-   **Deployment:** Self-hosted on your server via Docker.
-   **Cost:** Free (self-hosted). No per-execution fees.
-   **Key Capabilities:**
    -   Connects to 400+ services via pre-built integrations.
    -   Executes custom JavaScript and Python code within workflows.
    -   Triggers workflows on a schedule, via webhook, or from other events.
    -   Manages complex, multi-step automation with branching logic.
-   **Our Use Cases:**
    -   Orchestrating all AI agents (A01-A04).
    -   Scraping data from free government APIs.
    -   Triggering outreach sequences.
    -   Connecting to Telnyx for voice and SMS.

### 2.2. Large Language Models (LLMs): Ollama + Open-Source Models

**Ollama** is the simplest way to run powerful, open-source LLMs on your own server.

-   **Deployment:** Self-hosted on your server.
-   **Cost:** Free. Your only cost is server compute.
-   **Recommended Models:**

| Model | Parameters | Strength | Use Case |
|---|---|---|---|
| **Qwen 2.5 32B** | 32 Billion | Best overall open-source model, comparable to GPT-4o-mini. | Complex reasoning, content generation, agent logic. |
| **Llama 3.3 70B** | 70 Billion | Meta's flagship, excellent for coding and analysis. | Code generation, data analysis, complex tasks. |
| **Mistral 7B** | 7 Billion | Best balance of speed and capability for a small model. | Fast, routine tasks, initial lead qualification. |
| **Phi-3 Mini** | 3.8 Billion | Microsoft's small but powerful model. | Edge cases, very fast inference. |
| **Dolphin 2.9 (Mistral)** | 7 Billion | "Uncensored" variant of Mistral. | Tasks requiring less restrictive outputs. |

-   **Our Use Cases:**
    -   Generating personalized outreach messages (A03).
    -   Powering the logic of our AI Closing Agent (A04).
    -   Analyzing documents for the Litigation Support Bot.
    -   Writing grant proposals.

### 2.3. Text-to-Speech (TTS): Coqui TTS / XTTS-v2

**Coqui TTS** is an open-source deep learning toolkit for text-to-speech synthesis, including voice cloning.

-   **Deployment:** Self-hosted on your server via Docker or Python.
-   **Cost:** Free.
-   **Key Capabilities:**
    -   **Voice Cloning:** Clone any voice from just 6 seconds of audio.
    -   **Multi-Language:** Supports 17+ languages.
    -   **High Quality:** Produces natural-sounding speech.
-   **Our Use Cases:**
    -   Powering our AI Voice Agent (A04) with a unique, branded voice.
    -   Creating personalized audio messages for outreach.
    -   Generating voiceovers for AI-generated videos.

### 2.4. Telephony: Telnyx

**Telnyx** is our raw telephony infrastructure. It is more powerful and cost-effective than Twilio for our use cases.

-   **Deployment:** Cloud-based API.
-   **Cost:** Pay-per-use (very low cost per minute/message).
-   **Key Capabilities:**
    -   Programmable Voice (inbound and outbound calls).
    -   Programmable SMS/MMS.
    -   SIP Trunking for integration with custom voice systems.
    -   TeXML for complex call flows.
-   **Our Use Cases:**
    -   Handling all inbound and outbound calls for A04.
    -   Sending and receiving SMS for outreach sequences.
    -   Ringless voicemail drops.

### 2.5. Video Generation: Open-Source & Chinese Models

For video generation, we leverage the rapidly improving open-source and Chinese AI models.

| Model | Access | Strength | Use Case |
|---|---|---|---|
| **Wan 2.1** | Open-source (Hugging Face) | Text-to-video, image-to-video, good quality. | Generating short video clips for personalized VSLs. |
| **Tencent Hunyuan Video** | Free web access / API | High-quality, cinematic video. | Creating polished marketing videos. |
| **Stable Video Diffusion** | Open-source (Hugging Face) | Image-to-video, good for animations. | Animating still images for presentations. |

-   **Our Use Cases:**
    -   Creating hyper-personalized Video Sales Letters (VSLs) that address the prospect by name and reference their specific situation.
    -   Generating video content for the "Hyper-Local Market Dominator" reports.

## 3. The Integration Architecture

All components are orchestrated by **n8n**. A typical workflow looks like this:

1.  **n8n** triggers a data scrape from a government API.
2.  **n8n** sends the scraped data to **Ollama (Qwen 2.5)** to analyze and identify high-priority leads.
3.  **n8n** sends the lead data to **Ollama** again to generate a personalized outreach message.
4.  **n8n** sends the message to **Telnyx** to deliver via SMS or email.
5.  When a prospect responds, **n8n** triggers the AI Voice Agent.
6.  The AI Voice Agent uses **Coqui TTS** for speech and **Ollama** for conversational logic.
7.  The call is routed through **Telnyx**.

This is a fully integrated, self-hosted, near-zero-marginal-cost AI factory.
