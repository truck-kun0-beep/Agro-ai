import { useState } from "react";
import "./index.css";

type Analysis = {
  diagnosis: string;
  confidence: number;
  severity: string;
  visibleDamage: number;
  symptomsDetected: string[];
  possibleCause: string;
  imageFindings: string;
  weatherRisk: string;
  organicTreatment: string[];
  chemicalTreatment: string[];
  prevention: string[];
  farmerAdvice: string;
  bengaliAdvice: string;
  sprayingAdvice: string;
  marketRisk: string;
};

type Weather = {
  location?: string;
  temperature?: number;
  humidity?: number;
  precipitation?: number;
  rain?: number;
  windSpeed?: number;
};

function App() {
  const [farmerName, setFarmerName] = useState("");
  const [crop, setCrop] = useState("Rice");
  const [plantingDate, setPlantingDate] = useState("");
  const [location, setLocation] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState("");

  const handleImage = (file: File | undefined) => {
    if (!file) return;

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const analyzeCrop = async () => {
    if (!crop || !symptoms) {
      setError("Please select a crop and describe the symptoms.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      let imageData = null;

      if (image) {
        const base64 = await fileToBase64(image);

        imageData = {
          mimeType: image.type,
          data: base64,
        };
      }

      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          farmerName,
          crop,
          plantingDate,
          location,
          symptoms,
          image: imageData,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data.analysis);
      setWeather(data.weather);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setWeather(null);
    setImage(null);
    setImagePreview("");
    setError("");
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand">🌱 AgroLens AI</div>
          <div className="tagline">
            AI-powered crop health & climate advisory
          </div>
        </div>
        <div className="status">● AI SYSTEM ONLINE</div>
      </header>

      <main className="container">
        {!analysis && !loading && (
          <>
            <section className="hero">
              <div>
                <p className="eyebrow">SMART FARMING PLATFORM</p>
                <h1>
                  Diagnose crop problems
                  <br />
                  <span>before they become losses.</span>
                </h1>
                <p>
                  Combine farmer observations, crop images and local weather
                  conditions to generate an actionable agricultural advisory.
                </p>
              </div>

              <div className="heroIcon">🌾</div>
            </section>

            <section className="card">
              <div className="sectionTitle">
                <div>
                  <h2>New Field Inspection</h2>
                  <p>Enter the farmer's field information below.</p>
                </div>
                <span className="step">01</span>
              </div>

              <div className="grid">
                <label>
                  Farmer name
                  <input
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="Rahim Ahmed"
                  />
                </label>

                <label>
                  Crop
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                  >
                    <option>Rice</option>
                    <option>Wheat</option>
                    <option>Potato</option>
                    <option>Tomato</option>
                    <option>Maize</option>
                    <option>Vegetables</option>
                  </select>
                </label>

                <label>
                  Planting date
                  <input
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                  />
                </label>

                <label>
                  Field location
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Rangpur"
                  />
                </label>
              </div>

              <label>
                Describe symptoms
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Example: Brown spots are appearing on rice leaves and some leaves are turning yellow..."
                />
              </label>

              <div className="quick">
                <span>Quick symptoms:</span>

                <button
                  onClick={() =>
                    setSymptoms(
                      "Brown spots are appearing on leaves with yellowing around the spots."
                    )
                  }
                >
                  🟤 Brown spots
                </button>

                <button
                  onClick={() =>
                    setSymptoms(
                      "Leaves are turning yellow and some lower leaves are drying."
                    )
                  }
                >
                  🟡 Yellow leaves
                </button>

                <button
                  onClick={() =>
                    setSymptoms(
                      "White patches are appearing on the surface of the leaves."
                    )
                  }
                >
                  ⚪ White patches
                </button>
              </div>

              <div className="upload">
                <div>
                  <strong>📸 Crop image</strong>
                  <p>Upload a clear photo of the affected plant.</p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImage(e.target.files?.[0])}
                />
              </div>

              {imagePreview && (
                <div className="preview">
                  <img src={imagePreview} alt="Crop preview" />
                  <div>
                    <strong>{image?.name}</strong>
                    <p>Image ready for AI vision analysis.</p>
                  </div>
                </div>
              )}

              {error && <div className="error">{error}</div>}

              <button className="analyzeButton" onClick={analyzeCrop}>
                Analyze Crop with AI →
              </button>
            </section>
          </>
        )}

        {loading && (
          <section className="loadingCard">
            <div className="loader">🌱</div>
            <h2>AgroLens is analyzing the field...</h2>

            <div className="loadingSteps">
              <div>✓ Processing farmer observations</div>
              <div>✓ Checking crop image with computer vision</div>
              <div>✓ Retrieving local weather conditions</div>
              <div>◌ Generating agronomic advisory</div>
            </div>
          </section>
        )}

        {analysis && (
          <section>
            <div className="resultHeader">
              <div>
                <p className="eyebrow">FIELD HEALTH REPORT</p>
                <h1>{crop} Analysis</h1>
                <p>{location || "Location not provided"}</p>
              </div>

              <button className="secondaryButton" onClick={reset}>
                ← New Inspection
              </button>
            </div>

            {imagePreview && (
              <div className="resultImage">
                <img src={imagePreview} alt="Analyzed crop" />
              </div>
            )}

            <div className="stats">
              <div className="stat">
                <span>Diagnosis</span>
                <strong>{analysis.diagnosis}</strong>
              </div>

              <div className="stat">
                <span>Severity</span>
                <strong>{analysis.severity}</strong>
              </div>

              <div className="stat">
                <span>AI Confidence</span>
                <strong>{analysis.confidence}%</strong>
              </div>

              <div className="stat">
                <span>Visible Damage</span>
                <strong>{analysis.visibleDamage}%</strong>
              </div>
            </div>

            {weather && (
              <div className="card weather">
                <div className="sectionTitle">
                  <div>
                    <h2>🌦️ Hyperlocal Weather</h2>
                    <p>{weather.location}</p>
                  </div>
                </div>

                <div className="weatherGrid">
                  <div>
                    <span>Temperature</span>
                    <strong>{weather.temperature}°C</strong>
                  </div>

                  <div>
                    <span>Humidity</span>
                    <strong>{weather.humidity}%</strong>
                  </div>

                  <div>
                    <span>Rain</span>
                    <strong>{weather.rain} mm</strong>
                  </div>

                  <div>
                    <span>Wind</span>
                    <strong>{weather.windSpeed} km/h</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="resultGrid">
              <div className="card">
                <h2>🔍 AI Findings</h2>
                <p>{analysis.imageFindings}</p>

                <h3>Symptoms detected</h3>
                <ul>
                  {analysis.symptomsDetected?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <h3>Possible cause</h3>
                <p>{analysis.possibleCause}</p>

                <h3>Weather risk</h3>
                <p>{analysis.weatherRisk}</p>
              </div>

              <div className="card">
                <h2>🌿 Recommended Actions</h2>

                <h3>Organic treatment</h3>
                <ul>
                  {analysis.organicTreatment?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <h3>Chemical treatment</h3>
                <ul>
                  {analysis.chemicalTreatment?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <h3>Spraying advice</h3>
                <p>{analysis.sprayingAdvice}</p>
              </div>
            </div>

            <div className="card advisory">
              <h2>👨‍🌾 Farmer Advisory</h2>
              <p>{analysis.farmerAdvice}</p>

              <div className="bengali">
                <h3>🇧🇩 বাংলা পরামর্শ</h3>
                <p>{analysis.bengaliAdvice}</p>
              </div>
            </div>

            <div className="card">
              <h2>🛡️ Prevention</h2>
              <ul>
                {analysis.prevention?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default App;