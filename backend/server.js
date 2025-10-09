import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import { rephrasePrompt, diagramPrompt } from './ai-prompts.js';
import { schemaList } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const http = createServer(app);

const io = new Server(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(path.join(__dirname, '../frontend')));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
});

io.on('connection', socket => {
    socket.on('rephrase_text', async (data, callback) => {
        try {
            const rephrasedText = await callOpenAIForRephrase(data.text);
            callback({ status: 'success', payload: rephrasedText });
        } catch(e) {
            callback({ status: 'error', message: e.message });
        }
    });

    socket.on('generate_diagram', async (data, callback) => {
        try {
            const assistantMessage = await callOpenAIForDiagram(data.text);
            if (!assistantMessage?.tool_calls?.length) {
                throw new Error("AI did not return a valid function call.");
            }
            const toolCall = assistantMessage.tool_calls[0];
            const parsedResult = JSON.parse(toolCall.function.arguments);

            parsedResult.nodes.forEach(node => {
                if (!node.text) {
                    node.text = "Unknown Position";
                }
            });

            const fixedNodes = fixHierarchy(parsedResult.nodes);
            callback({ status: 'success', payload: fixedNodes });
        } catch (e) {
            console.error('Error generating diagram:', e.message);
            callback({ status: 'error', message: e.message });
        }
    });
});

function fixHierarchy(nodes) {
    if (!nodes || nodes.length === 0) return [];
    const existingIds = new Set(nodes.map(node => node.id));
    nodes.forEach(node => {
        if (node.parent && !existingIds.has(node.parent)) {
            console.warn(`"Orphan" detected! Node "${node.text}" refers to a non-existent parent "${node.parent}". Connection removed.`);
            delete node.parent;
        }
    });
    return nodes;
}

async function callOpenAIForRephrase(userText) {
    const messages = [{ role: 'system', content: rephrasePrompt }, { role: 'user', content: userText }];

    try {
        const res = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: messages,
        });
        return res.choices[0].message.content;
    } catch (e) {
        throw new Error(`Error from AI service: ${e.message}`);
    }
}

async function callOpenAIForDiagram(userText) {
    const messages = [{ role: 'system', content: diagramPrompt }, { role: 'user', content: userText }];

    try {
        const res = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: messages,
            tools: schemaList,
            tool_choice: { type: "function", function: { name: "create_org_chart_diagram" } },
        });
        return res.choices[0].message;
    } catch (e) {
        throw new Error(`Error from AI service: ${e.message}`);
    }
}

const PORT = process.env.PORT || 3001;
http.listen(PORT);
