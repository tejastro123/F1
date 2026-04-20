/**
 * F1 Circuit SVG Paths
 * This library stores the blueprint paths for various F1 circuits.
 * In a production app, these would be high-precision paths fetched from a GIS source.
 */

export interface CircuitPath {
  id: string;
  name: string;
  path: string;
  viewBox: string;
  splitPoints: { x: number; y: number; label: string }[];
}

export const CIRCUIT_DATA: Record<string, CircuitPath> = {
  "generic": {
    id: "generic",
    name: "Modern Circuit",
    path: "M 100 300 C 100 100 300 100 500 100 C 700 100 900 150 900 300 C 900 450 700 500 500 500 C 300 500 100 500 100 300 Z",
    viewBox: "0 0 1000 600",
    splitPoints: [
      { x: 500, y: 100, label: "S1" },
      { x: 900, y: 300, label: "S2" },
      { x: 100, y: 300, label: "S3" }
    ]
  },
  "monaco": {
    id: "monaco",
    name: "Circuit de Monaco",
    path: "M 200 400 L 400 400 L 450 350 L 500 400 L 700 400 L 750 300 L 600 200 L 400 150 L 200 250 Z", // Simplified representation
    viewBox: "0 0 1000 600",
    splitPoints: [
      { x: 450, y: 350, label: "S1" },
      { x: 750, y: 300, label: "S2" },
      { x: 200, y: 250, label: "S3" }
    ]
  },
  "silverstone": {
    id: "silverstone",
    name: "Silverstone Circuit",
    path: "M 150 200 Q 300 100 450 200 T 750 200 Q 900 300 750 400 T 450 400 Q 300 500 150 400 Z",
    viewBox: "0 0 1000 600",
    splitPoints: [
      { x: 450, y: 200, label: "S1" },
      { x: 750, y: 400, label: "S2" },
      { x: 150, y: 400, label: "S3" }
    ]
  },
  "spa": {
    id: "spa",
    name: "Circuit de Spa-Francorchamps",
    path: "M 100 200 L 300 100 L 500 150 L 800 100 L 900 300 L 700 500 L 400 450 L 100 400 Z",
    viewBox: "0 0 1000 600",
    splitPoints: [
      { x: 300, y: 100, label: "S1" },
      { x: 900, y: 300, label: "S2" },
      { x: 100, y: 400, label: "S3" }
    ]
  }
};

export function getCircuitPath(circuitId: string): CircuitPath {
  return CIRCUIT_DATA[circuitId] || CIRCUIT_DATA["generic"];
}
