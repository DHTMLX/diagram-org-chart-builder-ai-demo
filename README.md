# AI Org Chart Builder with DHTMLX Diagram

A full-stack web application that integrates DHTMLX Diagram with AI for generating organizational charts and diagrams from natural language text descriptions.

### **[✨ Try the Live Demo >>>](https://dhtmlx.com/docs/demo/ai-org-chart-builder/)**

## Features

- **Natural Language to Diagram:** Describe your diagram in plain English (e.g., "An organizational chart with CEO and department heads") and watch it come to life.
- **Live Preview:** See the generated DHTMLX Diagram instantly.
- **Editable JSON:** View, edit, and fine-tune the generated JSON configuration in a built-in code editor.
- **Instant Updates:** Modify the JSON and see your changes immediately without calling the AI again.

## AI Service

- Configured to work with any OpenAI API-compatible service.
- Tested with `gpt-4.1-nano` model.

## Setup and Installation

Follow these steps to get the project running on your local machine.

```bash
# 1. Clone the repository
git clone diagram-org-chart-builder-ai-demo
cd diagram-org-chart-builder-ai-demo

# 2. Install dependencies
npm install
```

### Set up environment variables:
Create a new file named `.env` inside the `diagram-org-chart-builder-ai-demo` directory by copying from `env.sample`. This file holds your secret keys and configuration.

📄 `diagram-org-chart-builder-ai-demo/.env`
```ini
# --- OpenAI API Configuration ---
OPENAI_API_KEY=sk-YourSecretApiKeyGoesHere
OPENAI_BASE_URL=https://api.openai.com/v1

# --- Security Configuration ---
CORS_ALLOWED_ORIGINS=http://localhost:3001,http://127.0.0.1:3001,http://localhost:5500,http://127.0.0.1:5500

# --- Server Configuration (optional) ---
PORT=3001
```

-   **`OPENAI_API_KEY`**: (Required) Your secret API key for the AI service.
-   **`OPENAI_BASE_URL`**: The API endpoint for the AI service. Can be changed to use a proxy or a different provider compatible with the OpenAI API.
-   **`CORS_ALLOWED_ORIGINS`**: A crucial security setting. This is a comma-separated list of web addresses allowed to connect to your backend server. For production, you **must** change this to your public frontend's URL (e.g., `https://myapp.com`).
-   **`PORT`**: (Optional) The port number on which the server will run. Defaults to 3001 if not set.

### Run the Application

In the same `diagram-org-chart-builder-ai-demo` directory, run the start command:
```bash
npm start
```

You should see the following output in your terminal:
```
Server started on port 3001
```

### Open in Browser

Open your favorite web browser and navigate to:
[http://localhost:3001](http://localhost:3001)

You should see the application, ready to generate diagrams!

## How It Works: From Text to Diagram

1.  **Describe your idea:** The user enters a text description of the diagram, for example, "director and three departments: sales, marketing and development".
2.  **AI-Powered JSON Generation:** The text is sent to the server, where our AI generates a structured JSON configuration based on the request.
3.  **Instant visualization:** The frontend receives the ready data and immediately renders an interactive DHTMLX diagram that can be seen on the screen right away.
4.  **Full control:** Next to the diagram, the JSON code is displayed. You can edit it manually and update the visualization in real time to bring the result to perfection.

## Deployment

This application is ready to be deployed on any service that supports Node.js, such as Render, Heroku, or Vercel.

**Key deployment steps:**
- **Do not** upload your `.env` file. Use the hosting provider's "Environment Variables" section to set `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `CORS_ALLOWED_ORIGINS`.
- The `Root Directory` should be left blank (or set to /).
- The `Start Command` should be `npm start`.

## License

DHTMLX Diagram is a commercial library - use it under a [valid license](https://dhtmlx.com/docs/products/licenses.shtml) or [evaluation agreement](https://dhtmlx.com/docs/products/dhtmlxDiagram/download.shtml).
