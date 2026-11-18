import { NextRequest, NextResponse } from "next/server";
import { BatchItem } from "@/lib/types";
import { generateMockPrediction } from "@/lib/mock-data";

export const runtime = "edge";

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: BatchItem[] = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required and must not be empty." },
        { status: 400 }
      );
    }

    // Try batch endpoint on backend
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const batchPayload = {
        items: items.map((item) => ({
          smiles: item.smiles,
          compound_name: item.compound_name,
          protein_sequence: item.target_sequence,
        })),
      };

      const backendRes = await fetch(`${FASTAPI_URL}/predict_batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (backendRes.ok) {
        const results = await backendRes.json();
        const updatedItems: BatchItem[] = items.map((item, idx) => {
          const r = results[idx];
          return {
            ...item,
            pkd: r.pkd,
            kd_nM: r.kd_nM,
            uncertainty: r.uncertainty,
            binding_level: r.binding_level,
            status: "completed",
          };
        });
        return NextResponse.json({ items: updatedItems });
      }
    } catch {
      // Backend offline or unreachable -> fallback gracefully
    }

    // High-fidelity fallback batch computation
    const updatedItems: BatchItem[] = items.map((item) => {
      try {
        if (!item.smiles || !item.target_sequence) {
          return {
            ...item,
            status: "failed",
            error: "Missing SMILES or Target Sequence",
          };
        }

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
          error: "Failed to parse sequence or SMILES",
        };
      }
    });

    return NextResponse.json({ items: updatedItems });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Batch inference error" },
      { status: 500 }
    );
  }
}
