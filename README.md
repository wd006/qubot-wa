# QuBot WA - An Autonomous AI WhatsApp Agent 🤖

## ⚠️ Disclaimer
> [!CAUTION]
> This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or its affiliates. The official WhatsApp website can be found at [whatsapp.com](https://whatsapp.com).
>
> "WhatsApp" as well as related names, marks, emblems and images are registered trademarks of their respective owners.
>
> The use of this project is at your own risk. The developers assume no responsibility for any consequences that may arise from using this application, including but not limited to account suspension or banning by WhatsApp. It is the user's personal responsibility to use this application in compliance with WhatsApp's Terms of Service. **We strongly discourage spam, bulk messaging, or any use that could be considered harassment.**


## 🚧 Current Status: In Development 🚧
> [!IMPORTANT]
> This project is currently in its active development phase. The core architecture is stable, but features are being added and refined.
> Feel free to fork, experiment, and contribute!

---

## ✨ Core Philosophy

The primary goal of QuBot WA is to break the mold of traditional, spammy WhatsApp bots. It operates on a "ghost participant" principle:

- **Silent by Default:** It listens to conversations without interrupting.
- **Context-Aware:** It understands the flow of conversation and decides to engage only when it's appropriate and valuable.
- **Human-like Interaction:** It uses dynamically calculated typing delays and a distinct personality defined by external prompt files.
- **Action-Oriented:** It's not just a chatbot. It's an agent capable of performing tasks like setting reminders, searching the web, and more.


## 🚀 Key Features

- **LLM as a Router:** Instead of rigid `if/else` logic, it uses an LLM (powered by Google Gemini or Groq) to analyze every message and decide whether to reply, what to say, and what action to take.
- **Dynamic Personality:** The bot's core logic and personality are loaded from external `*.prompt` files, allowing for easy customization without touching the source code.
- **Modular Architecture:**
    - **Actions (`/src/actions`):** A plug-and-play system for adding new capabilities.
    - **REPL (`/src/repl`):** A powerful command-line interface to manage the bot directly from the terminal.
- **Human Simulation:**
    - **Realistic Typing Animation:** The "is typing..." delay is calculated based on the length of the generated response.
    - **Intelligent Silence:** A sophisticated prompt teaches the agent when *not* to speak.
- **Rich Terminal Logging:** A custom logger provides detailed, color-coded insights into every message and the AI's decision-making process.
- **Secure Configuration:** All sensitive keys are managed through a `.env` file.


## 🛠️ Tech Stack

- **Runtime:** Node.js `(recommend v22)`
- **WhatsApp API:** [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
- **LLM Engine:** Google Gemini (`@google/generative-ai`) / Groq (soon) (`groq-sdk`)
- **Configuration:** `dotenv`
- **Database (Planned):** `better-sqlite3` for memory and tasks.
- **Job Queue (Planned):** For scheduled tasks like reminders.


## ✈︎ Future Development Roadmap

The project is evolving. Here are the next major milestones:

-   **Phase 1: Memory Implementation**
    -   [ ] **Short-Term Memory:** Implement a database (SQLite) to remember the last N messages for better contextual understanding.
    -   [ ] **Long-Term Memory:** Develop a system for the agent to learn facts about users and groups.

-   **Phase 2: Expanding Action Capabilities**
    -   [ ] **Reminder System:** Fully implement the `set_reminder` action.
    -   [ ] **Web Search:** Add a `google_search` action for real-time information.

-   **Phase 3: Enhanced Group Dynamics**
    -   [ ] **Proactive Engagement:** Allow the agent to initiate conversations based on triggers.
    -   [ ] **Sentiment Analysis:** Improve the agent's ability to detect the mood of the chat.


## ⚙️ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/wd006/qubot-wa.git
    cd qubot-wa
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure your environment:**
    -   Create a `.env` file in the root directory.
    -   Add your API keys and phone number:
        ```env
        GEMINI_KEY=your_google_ai_api_key
        OWNER_NUMBER=xxxxxxxxx@s.whatsapp.net
        ```

4.  **Customize the prompts:**
    -   Edit `persona.prompt` to shape its personality and rules.

5.  **Run the bot:**
    ```bash
    node index.js
    ```

6.  Scan the QR code with your WhatsApp account, and you're ready to go.


## 📄 License

This project is licensed under the **MIT License**. See the [`LICENSE`](LICENSE) file for more details.


## 🤝 Contributing

Contributions are greatly appreciated. Please fork the repository and create a pull request, or open an issue.


## 📬 Contact

E-Mail: [github@wd006.pp.ua](mailto:github@wd006.pp.ua)

Project Link: [https://github.com/wd006/qubot-wa](https://github.com/wd006/qubot-wa)

For questions, bug reports, or support, please **open an issue** on the GitHub repository.