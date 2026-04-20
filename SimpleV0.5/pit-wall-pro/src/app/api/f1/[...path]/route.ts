import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import {
  MOCK_DRIVER_STANDINGS,
  MOCK_CONSTRUCTOR_STANDINGS,
  MOCK_RACE_SCHEDULE
} from "@/lib/mockData";

const API_BASE = "https://api.jolpi.ca/ergast/f1";

// Helper to wrap mock data in Ergast-style response
function wrapInMRData(key: string, data: unknown) {
  return {
    MRData: {
      xmlns: "http://ergast.com/mrd/1.5",
      series: "f1",
      url: "http://ergast.com/api/f1",
      limit: "100",
      offset: "0",
      total: String(Array.isArray(data) ? data.length : 1),
      [key]: data
    }
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join("/");
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  // Only add .json if not already present in the path
  const fullPath = path.endsWith(".json") ? path : `${path}.json`;
  const url = `${API_BASE}/${fullPath}${queryString ? `?${queryString}` : ""}`;


  try {
    const response = await axios.get(url, {
      timeout: 15000, // 15s timeout
      headers: {
        Accept: "application/json",
        "User-Agent": "Pit-Wall-Pro/1.0",
      },
    });

    return NextResponse.json(response.data, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error: unknown) {
    const err = error as AxiosError;


    // Fallback logic for common endpoints
    const lowerPath = path.toLowerCase();
    if (lowerPath.includes("driverstandings")) {

      return NextResponse.json(wrapInMRData("StandingsTable", { StandingsLists: [{ DriverStandings: MOCK_DRIVER_STANDINGS }] }));
    }
    if (lowerPath.includes("constructorstandings")) {

      return NextResponse.json(wrapInMRData("StandingsTable", { StandingsLists: [{ ConstructorStandings: MOCK_CONSTRUCTOR_STANDINGS }] }));
    }
    if (path.split("/").length === 1 || (path.split("/").length === 2 && (path.endsWith("2024") || path.endsWith("2026")))) {

      return NextResponse.json(wrapInMRData("RaceTable", { Races: MOCK_RACE_SCHEDULE }));
    }

    return NextResponse.json(
      { error: "Failed to fetch from F1 API", details: err.message },
      { status: err.response?.status || 500 }
    );
  }
}
