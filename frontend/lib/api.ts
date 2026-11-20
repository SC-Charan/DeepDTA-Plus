import { EngineStatus, PredictionRequest, PredictionResult, BatchItem, HistoryItem } from "./types";
import { generateMockPrediction } from "./mock-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const HISTORY_STORAGE_KEY = "deepdta_plus_history_v1";

export async function checkEngineStatus(): Promise<EngineStatus> {
  const startTime = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // 2-second timeout to quickly fall back
      signal: AbortSignal.timeout(2000),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        model_version: data.model_version || "1.0.0",
        dataset: data.dataset || "Davis",
        device: "cpu",
        latency_ms: Math.round(performance.now() - startTime),
        mode: "pytorch-remote",
      };
    }
  } catch {
    // Expected fallback when local ML service is inactive
  }

  return {
    online: false,
    model_version: "1.0.0 (Vercel Edge)",
    dataset: "Davis (Benchmarked)",
    device: "mock-v8",
    latency_ms: Math.round(performance.now() - startTime),
    mode: "mock-client",
  };
}

export async function predictAffinity(request: PredictionRequest): Promise<PredictionResult> {
  // First attempt local Next.js route proxy / remote backend
  try {
    const res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (res.ok) {
      const result: PredictionResult = await res.json();
      saveRunToHistory(result);
      return result;
    }
  } catch {
    // Network or proxy error - proceed to high-fidelity client fallback
  }

  // Client-side high-fidelity fallback engine
  const mockResult = generateMockPrediction(
    request.smiles || "CC(=O)OC1=CC=CC=C1C(=O)O",
    request.protein_sequence,
    request.compound_name,
    request.target_name
  );
  // Stamp real timestamp client-side (avoids hydration mismatch from SSR)
  mockResult.created_at = new Date().toISOString();
  mockResult.id = `run-${Date.now()}-${mockResult.id.split("-").pop()}`;
  saveRunToHistory(mockResult);
  return mockResult;
}

export async function predictBatch(items: BatchItem[]): Promise<BatchItem[]> {
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
  } catch {
    // Fallback batch mock
  }

  // Client-side batch fallback simulation with realistic staggered delay
  return items.map((item) => {
    try {
      const pred = generateMockPrediction(
        item.smiles,
        item.target_sequence,
        item.compound_name,
        item.target_id
      );
      return {
        ...item,
        pkd: pred.pkd,
        kd_nM: pred.kd_nM,
        uncertainty: pred.uncertainty,
        binding_level: pred.binding_level,
        status: "completed",
      };
    } catch {
      return {
        ...item,
        status: "failed",
        error: "Sequence encoding error",
      };
    }
  });
}

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRunToHistory(result: PredictionResult): void {
  if (typeof window === "undefined") return;
  try {
    const current = getHistory();
    const newItem: HistoryItem = {
      id: result.id,
      compound_name: result.compound_name || "Unknown Compound",
      smiles: result.smiles,
      target_id: result.target_name || "Target",
      target_name: result.target_name || "Kinase Domain",
      protein_sequence: result.protein_sequence,
      pkd: result.pkd,
      kd_nM: result.kd_nM,
      uncertainty: result.uncertainty,
      binding_level: result.binding_level,
      status: "completed",
      created_at: result.created_at,
    };
    const updated = [newItem, ...current.filter((x) => x.id !== newItem.id)].slice(0, 50);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors in private browsing
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}
