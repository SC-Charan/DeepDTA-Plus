import os

src_path = r"C:\Users\Charan\.gemini\antigravity\brain\660a10fd-92f1-4051-9143-216351daf175\.user_uploaded\media_1795535127010_6ac04fcf.html"
with open(src_path, "r", encoding="utf-8") as f:
    content = f.read()

print("Read source HTML, size:", len(content))

# Ensure destination directories exist
os.makedirs("frontend/public", exist_ok=True)

# Replace API_BASE_URL
old_api = 'const API_BASE_URL = window.DTA_API_URL || "http://localhost:8000";'
new_api = 'const API_BASE_URL = window.DTA_API_URL || (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:8000" : "https://deepdta-plus.onrender.com");'

if old_api in content:
    content = content.replace(old_api, new_api, 1)
    print("API_BASE_URL updated")
else:
    print("Warning: old_api not found")

# Replace predictAffinity to add direct fallback
old_pred = """async function predictAffinity(request) {
    // First attempt local Next.js route proxy / remote backend
    try {
        const res = await fetch("/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });
        if (res.ok) {
            const result = await res.json();
            result.pkd = Number(result.pkd) || 7.0;
            result.kd_nM = Number(result.kd_nM) || Math.pow(10, 9 - result.pkd);
            result.uncertainty = Number(result.uncertainty) || 0.15;
            saveRunToHistory(result);
            return result;
        }
    }
    catch {
        // Network or proxy error - proceed to high-fidelity client fallback
    }"""

new_pred = """async function predictAffinity(request) {
    // 1. First attempt Next.js route proxy
    try {
        const res = await fetch("/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });
        if (res.ok) {
            const result = await res.json();
            result.pkd = Number(result.pkd) || 7.0;
            result.kd_nM = Number(result.kd_nM) || Math.pow(10, 9 - result.pkd);
            result.uncertainty = Number(result.uncertainty) || 0.15;
            saveRunToHistory(result);
            return result;
        }
    }
    catch {}

    // 2. Direct FastAPI backend
    try {
        const res = await fetch(`${API_BASE_URL}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });
        if (res.ok) {
            const result = await res.json();
            result.pkd = Number(result.pkd) || 7.0;
            result.kd_nM = Number(result.kd_nM) || Math.pow(10, 9 - result.pkd);
            result.uncertainty = Number(result.uncertainty) || 0.15;
            saveRunToHistory(result);
            return result;
        }
    }
    catch {}"""

if old_pred in content:
    content = content.replace(old_pred, new_pred, 1)
    print("predictAffinity updated")
else:
    print("Warning: old_pred not found")

# Replace predictBatch to add direct fallback
old_batch = """async function predictBatch(items) {
    try {
        const res = await fetch("/api/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
        });
        if (res.ok) {
            const data = await res.json();
            return data.items;
        }
    }
    catch {
        // Fallback batch mock
    }"""

new_batch = """async function predictBatch(items) {
    try {
        const res = await fetch("/api/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
        });
        if (res.ok) {
            const data = await res.json();
            return data.items || data;
        }
    }
    catch {}

    try {
        const res = await fetch(`${API_BASE_URL}/predict_batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
        });
        if (res.ok) {
            const data = await res.json();
            return Array.isArray(data) ? data : (data.items || data);
        }
    }
    catch {}"""

if old_batch in content:
    content = content.replace(old_batch, new_batch, 1)
    print("predictBatch updated")
else:
    print("Warning: old_batch not found")

# Write to root index.html
with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Saved index.html")

# Write to frontend/public/demo.html and frontend/public/app.html
with open("frontend/public/demo.html", "w", encoding="utf-8") as f:
    f.write(content)
with open("frontend/public/app.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Saved frontend/public/demo.html and app.html")
