import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    message: "AgroLens AI backend is running 🌱",
  });
});

app.get("/api/test-route", (req, res) => {
  res.json({
    message: "AgroLens backend is working 🔥",
  });
});

// Get weather from Open-Meteo
async function getWeather(location) {
  try {
    if (!location) return null;

    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        location
      )}&count=1&language=en&format=json`
    );

    const geoData = await geoResponse.json();

    if (!geoData.results?.length) {
      return null;
    }

    const place = geoData.results[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m&forecast_days=3`
    );

    const weatherData = await weatherResponse.json();

    return {
      location: `${place.name}, ${place.country}`,
      temperature: weatherData.current?.temperature_2m,
      humidity: weatherData.current?.relative_humidity_2m,
      precipitation: weatherData.current?.precipitation,
      rain: weatherData.current?.rain,
      windSpeed: weatherData.current?.wind_speed_10m,
    };
  } catch (error) {
    console.error("Weather error:", error);
    return null;
  }
};

app.post("/api/analyze", async (req, res) => {
  console.log("API HIT");

  try {
    const {
      farmerName,
      crop,
      plantingDate,
      symptoms,
      location,
      image,
    } = req.body;

    if (!crop || !symptoms) {
      return res.status(400).json({
        success: false,
        error: "Crop and symptoms are required.",
      });
    }

    console.log("Getting weather...");

    const weather = await getWeather(location);

    console.log("Weather:", weather);

    const prompt = `
You are AgroLens AI, an agricultural advisory assistant.

Analyze the farmer's crop using:
1. Farmer observations
2. Crop information
3. Weather conditions
4. Crop image if provided

FARMER:
${farmerName || "Not provided"}

CROP:
${crop}

PLANTING DATE:
${plantingDate || "Not provided"}

LOCATION:
${location || "Not provided"}

OBSERVED SYMPTOMS:
${symptoms}

CURRENT WEATHER:
${JSON.stringify(weather || "Weather unavailable")}

Return ONLY valid JSON.

Use exactly this structure:

{
  "diagnosis": "",
  "confidence": 0,
  "severity": "Mild",
  "visibleDamage": 0,
  "symptomsDetected": [],
  "possibleCause": "",
  "imageFindings": "",
  "weatherRisk": "",
  "organicTreatment": [],
  "chemicalTreatment": [],
  "prevention": [],
  "farmerAdvice": "",
  "bengaliAdvice": "",
  "sprayingAdvice": "",
  "marketRisk": "Low"
}

Rules:

- confidence must be 0-100.
- visibleDamage must be 0-100.
- severity must be Mild, Moderate, Severe, or Critical.
- If an image is provided, inspect it carefully.
- Do not claim certainty from an image alone.
- Chemical treatment must NOT invent pesticide brands or unsafe dosage.
- Say to follow locally registered product labels and agricultural officer guidance.
- Consider weather when discussing disease risk and spraying.
- Keep the response practical for a farmer.
`;

    const contents = [{ text: prompt }];

    // Add image if provided
    if (image?.data && image?.mimeType) {
      console.log("Sending crop image to Gemini...");

      contents.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    console.log("Calling Gemini...");
let response;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    console.log(`Gemini attempt ${attempt}/3`);

    response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
    });

    break;
  } catch (error) {
    console.log(`Gemini attempt ${attempt} failed:`, error.message);

    if (attempt === 3) {
      throw error;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, attempt * 3000)
    );
  }
}

    console.log("Gemini response received.");

    let text = response.text.trim();

    text = text.replace(/^```json\s*/i, "");
    text = text.replace(/^```\s*/i, "");
    text = text.replace(/\s*```$/i, "");

    const analysis = JSON.parse(text);

    res.json({
      success: true,
      analysis,
      weather,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🌱 AgroLens server running on http://localhost:${PORT}`);
});