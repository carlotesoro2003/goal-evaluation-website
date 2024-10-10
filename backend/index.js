import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { configDotenv } from 'dotenv';

configDotenv();

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = express();

// Middleware to enable CORS for all routes
app.use(cors());

// Middleware to parse JSON request body
app.use(bodyParser.json());

// POST endpoint to evaluate goal
app.post("/evaluate-goal", async (req, res) => {
    const { target, evaluation } = req.body;

    if (!target || !evaluation) {
        return res.status(400).json({ error: "Target and evaluation are required" });
    }

    try {
        const model =  genAi.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `The target is: ${target}. Based on the following evaluation: "${evaluation}", determine if the goal has been achieved and explain why.`;

        const result = await model.generateContent(prompt);

        const response = result.response;
        const text =  await response.text();

        res.json({ aiEvaluation: text });
    } catch (error) {
        console.error("Error with the Google Generative AI API", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
app.listen(process.env.PORT, () => {
    console.log("Server is running on port", process.env.PORT);
});
