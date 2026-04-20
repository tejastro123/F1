import { DriverStanding, ConstructorStanding, Race } from "@/types/f1";

export const MOCK_DRIVER_STANDINGS: DriverStanding[] = [
  { position: "1", points: "437", wins: "11", Driver: { driverId: "verstappen", permanentNumber: "1", code: "VER", givenName: "Max", familyName: "Verstappen", nationality: "Dutch" }, Constructors: [{ constructorId: "red_bull", name: "Red Bull Racing" }] },
  { position: "2", points: "345", wins: "3", Driver: { driverId: "norris", permanentNumber: "4", code: "NOR", givenName: "Lando", familyName: "Norris", nationality: "British" }, Constructors: [{ constructorId: "mclaren", name: "McLaren" }] },
  { position: "3", points: "307", wins: "3", Driver: { driverId: "leclerc", permanentNumber: "16", code: "LEC", givenName: "Charles", familyName: "Leclerc", nationality: "Monegasque" }, Constructors: [{ constructorId: "ferrari", name: "Ferrari" }] },
  { position: "4", points: "262", wins: "2", Driver: { driverId: "piastri", permanentNumber: "81", code: "PIA", givenName: "Oscar", familyName: "Piastri", nationality: "Australian" }, Constructors: [{ constructorId: "mclaren", name: "McLaren" }] },
  { position: "5", points: "244", wins: "2", Driver: { driverId: "sainz", permanentNumber: "55", code: "SAI", givenName: "Carlos", familyName: "Sainz", nationality: "Spanish" }, Constructors: [{ constructorId: "ferrari", name: "Ferrari" }] },
  { position: "6", points: "192", wins: "2", Driver: { driverId: "hamilton", permanentNumber: "44", code: "HAM", givenName: "Lewis", familyName: "Hamilton", nationality: "British" }, Constructors: [{ constructorId: "mercedes", name: "Mercedes" }] },
  { position: "7", points: "192", wins: "1", Driver: { driverId: "russell", permanentNumber: "63", code: "RUS", givenName: "George", familyName: "Russell", nationality: "British" }, Constructors: [{ constructorId: "mercedes", name: "Mercedes" }] },
  { position: "8", points: "152", wins: "0", Driver: { driverId: "perez", permanentNumber: "11", code: "PER", givenName: "Sergio", familyName: "Perez", nationality: "Mexican" }, Constructors: [{ constructorId: "red_bull", name: "Red Bull Racing" }] },
  { position: "9", points: "62", wins: "0", Driver: { driverId: "alonso", permanentNumber: "14", code: "ALO", givenName: "Fernando", familyName: "Alonso", nationality: "Spanish" }, Constructors: [{ constructorId: "aston_martin", name: "Aston Aramco" }] },
  { position: "10", points: "31", wins: "0", Driver: { driverId: "hulkenberg", permanentNumber: "27", code: "HUL", givenName: "Nico", familyName: "Hulkenberg", nationality: "German" }, Constructors: [{ constructorId: "haas", name: "Haas F1 Team" }] },
];

export const MOCK_CONSTRUCTOR_STANDINGS: ConstructorStanding[] = [
  { position: "1", points: "608", wins: "5", Constructor: { constructorId: "mclaren", name: "McLaren", nationality: "British" } },
  { position: "2", points: "593", wins: "11", Constructor: { constructorId: "red_bull", name: "Red Bull Racing", nationality: "Austrian" } },
  { position: "3", points: "557", wins: "5", Constructor: { constructorId: "ferrari", name: "Ferrari", nationality: "Italian" } },
  { position: "4", points: "384", wins: "3", Constructor: { constructorId: "mercedes", name: "Mercedes", nationality: "German" } },
  { position: "5", points: "86", wins: "0", Constructor: { constructorId: "aston_martin", name: "Aston Aramco", nationality: "British" } },
];

export const MOCK_RACE_SCHEDULE: Race[] = [
  { round: "1", raceName: "Bahrain Grand Prix", date: "2024-03-02", time: "15:00:00Z", Circuit: { circuitId: "bahrain", circuitName: "Bahrain International Circuit", Location: { locality: "Sakhir", country: "Bahrain" } } },
  { round: "2", raceName: "Saudi Arabian Grand Prix", date: "2024-03-09", time: "17:00:00Z", Circuit: { circuitId: "jeddah", circuitName: "Jeddah Corniche Circuit", Location: { locality: "Jeddah", country: "Saudi Arabia" } } },
  { round: "24", raceName: "Abu Dhabi Grand Prix", date: "2024-12-08", time: "13:00:00Z", Circuit: { circuitId: "yas_marina", circuitName: "Yas Marina Circuit", Location: { locality: "Abu Dhabi", country: "UAE" } } },
];
