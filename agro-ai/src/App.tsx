import { useState } from "react";
import "./index.css";

type Analysis = {
  diagnosis: string;
  confidence: number;
  severity: string;
  visibleDamage: number;
  symptomsDetected: string[];
  possibleCause: string;
  weatherRisk: string;
  organicTreatment: string[];
  chemicalTreatment: string[];
  prevention: string[];
  farmerAdvice: string;
  bengaliAdvice: string;
};

function App() {
  const [crop, setCrop] = useState("Rice");
  const [plantingDate, setPlantingDate] = useState("");
  const [location, setLocation] = useState("Bangladesh");
  const [symptoms, setSymptoms] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");

  async function analyzeCrop() {
    if (!symptoms.trim()) {
      setError("Please describe the symptoms first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
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
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAnalysis(null);
    setSymptoms("");
    setError("");
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <div className="logoIcon">🌱</div>
          <div>
            <strong>AgroLens</strong>
            <span>AI Agriculture</span>
          </div>
        </div>

        <div className="navStatus">
          <span className="statusDot"></span>
          AI System Online
        </div>
      </header>

      {!analysis && !loading && (
        <main className="container">
          <section className="hero">
            <div>
              <div className="eyebrow">SMART FIELD INTELLIGENCE</div>
              <h1>
                Protect your crop.
                <br />
                <span>Grow with confidence.</span>
              </h1>
              <p>
                AI-powered crop health analysis and agricultural advisory for
                farmers.
              </p>
            </div>

            <div className="heroCard">
              <div className="heroEmoji">🌾</div>
              <div>
                <strong>AI Crop Doctor</strong>
                <p>Analyze symptoms in seconds</p>
              </div>
            </div>
          </section>

          <section className="inspectionCard">
            <div className="sectionHeader">
              <div>
                <div className="step">FIELD INSPECTION</div>
                <h2>Start a new inspection</h2>
              </div>
              <div className="stepNumber">01</div>
            </div>

            <div className="formGrid">
              <div className="field">
                <label>Farmer name</label>
                <input
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="Enter farmer name"
                />
              </div>

              <div className="field">
                <label>Crop type</label>
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
              </div>

              <div className="field">
                <label>Planting date</label>
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Field location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="District / Union"
                />
              </div>
            </div>

            <div className="field symptomsField">
              <label>Describe what you see in the field</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: Brown spots have appeared on the rice leaves. Some leaves are turning yellow and drying from the edges..."
                rows={6}
              />
            </div>

            <div className="quickSymptoms">
              <span>Quick symptoms:</span>
              <button
                onClick={() =>
                  setSymptoms(
                    "Brown spots are appearing on rice leaves. Some leaves are turning yellow and drying from the edges. The disease seems to be spreading quickly."
                  )
                }
              >
                🟤 Brown spots
              </button>
              <button
                onClick={() =>
                  setSymptoms(
                    "Leaves have yellow patches and the plants are becoming weak. Growth is slower than normal."
                  )
                }
              >
                🟡 Yellow leaves
              </button>
              <button
                onClick={() =>
                  setSymptoms(
                    "Leaves have white powder-like patches and some leaves are curling."
                  )
                }
              >
                ⚪ White patches
              </button>
            </div>

            {error && <div className="error">{error}</div>}

            <button
              className="analyzeButton"
              onClick={analyzeCrop}
              disabled={loading}
            >
              🔬 Analyze Crop with AI
              <span>→</span>
            </button>

            <p className="privacy">
              Your field information is used only to generate this advisory.
            </p>
          </section>
        </main>
      )}

      {loading && (
        <main className="loadingScreen">
          <div className="loaderIcon">🌱</div>
          <h1>Analyzing your field...</h1>
          <p>AgroLens AI is examining the symptoms and preparing an advisory.</p>

          <div className="loadingSteps">
            <div className="active">✓ Farmer symptoms extracted</div>
            <div className="active">✓ Crop information analyzed</div>
            <div className="processing">◌ Generating diagnosis</div>
            <div>○ Preparing treatment advisory</div>
          </div>
        </main>
      )}

      {analysis && (
        <main className="container resultContainer">
          <button className="backButton" onClick={reset}>
            ← New inspection
          </button>

          <div className="resultHero">
            <div>
              <div className="eyebrow">AI FIELD HEALTH REPORT</div>
              <h1>{analysis.diagnosis}</h1>
              <p>AI-generated preliminary assessment for your {crop} field.</p>
            </div>

            <div className={`severity ${analysis.severity.toLowerCase()}`}>
              {analysis.severity}
            </div>
          </div>

          <div className="statsGrid">
            <div className="statCard">
              <span>AI Confidence</span>
              <strong>{analysis.confidence}%</strong>
            </div>

            <div className="statCard">
              <span>Visible Damage</span>
              <strong>{analysis.visibleDamage}%</strong>
            </div>

            <div className="statCard">
              <span>Crop</span>
              <strong>{crop}</strong>
            </div>

            <div className="statCard">
              <span>Location</span>
              <strong>{location}</strong>
            </div>
          </div>

          <div className="resultGrid">
            <section className="resultCard">
              <h3>🔎 Symptoms detected</h3>
              <ul>
                {analysis.symptomsDetected.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="resultCard">
              <h3>🧬 Possible cause</h3>
              <p>{analysis.possibleCause}</p>
            </section>

            <section className="resultCard">
              <h3>🌦️ Weather risk</h3>
              <p>{analysis.weatherRisk}</p>
            </section>

            <section className="resultCard">
              <h3>🌿 Organic treatment</h3>
              <ul>
                {analysis.organicTreatment.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="resultCard">
              <h3>🧪 Chemical treatment</h3>
              <ul>
                {analysis.chemicalTreatment.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="resultCard">
              <h3>🛡️ Prevention</h3>
              <ul>
                {analysis.prevention.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="advisory">
            <div className="advisoryHeader">
              <div>
                <div className="eyebrow">FARMER ADVISORY</div>
                <h2>What you should do</h2>
              </div>
              <div className="audioButton">🔊 Listen</div>
            </div>

            <p>{analysis.farmerAdvice}</p>

            <div className="bengali">
              <div>বাংলা পরামর্শ</div>
              <p>{analysis.bengaliAdvice}</p>
            </div>
          </section>

          <div className="disclaimer">
            ⚠️ This is an AI-assisted preliminary assessment, not a substitute
            for a qualified agricultural officer or locally registered product
            label.
          </div>
        </main>
      )}
    </div>
  );
}

export default App;