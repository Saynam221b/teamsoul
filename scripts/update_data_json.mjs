import fs from 'fs';
import path from 'path';

const dataFile = path.resolve(process.cwd(), 'src/data/data.json');
const raw = fs.readFileSync(dataFile, 'utf8');
const data = JSON.parse(raw);

// Fix players
data.players.spower.stints[0].leaveDate = "2024-07-12";
data.players.ninjajod.stints[0].joinDate = "2024-08-19";
data.players.ninjajod.stints[0].leaveDate = "2024-10-08";
data.players.saumay.stints[0].joinDate = "2024-10-09";
data.players.saumay.stints[0].leaveDate = "2025-04-30";
data.players.skipz.stints[0].joinDate = "2024-10-09";
data.players.skipz.stints[0].leaveDate = "2025-01-10";
data.players.hunterz.stints[0].joinDate = "2025-01-12";
data.players.hunterz.stints[0].leaveDate = "2025-04-30";
data.players.rony.stints[0].leaveDate = "2025-07-17";
data.players.rony.isActive = false;
data.players.rony.currentStatus = "departed";

data.players.mayavi = {
    id: "mayavi",
    displayName: "Mayavi",
    realName: "",
    role: "Player",
    stints: [
        { joinDate: "2024-01-01", leaveDate: "2025-07-28", joinContext: "Ex-Blind Esports core", era: "modern" }
    ],
    awards: [],
    impact: "Joined in Jan 2024 with the new core and departed in July 2025.",
    isFounder: false,
    isActive: false,
    currentStatus: "departed"
};

data.staff.ayogi.joinDate = "2024-01-01";
data.staff.ayogi.impact = "Operated as Analyst from Jan 2024 before becoming Coach in July 2025. Guided the BGIS 2026 championship phase.";

// Remove wrong 2024-2025 changes involving these players, and append correctly matched ones.
data.rosterChanges = data.rosterChanges.filter(c => 
    !["spower", "ninjajod", "saumay", "skipz", "goblin", "legit", "jokerr", "manya", "thunder", "rony", "mayavi"].includes(c.playerId) || 
    new Date(c.date) < new Date("2024-01-01")
);

data.rosterChanges.push(
  { playerId: "manya", action: "JOINED", date: "2024-01-01", context: "Ex-Blind Esports" },
  { playerId: "nakul", action: "JOINED", date: "2024-01-01", context: "Ex-Blind Esports" },
  { playerId: "jokerr", action: "JOINED", date: "2024-01-01", context: "Ex-Blind Esports" },
  { playerId: "rony", action: "JOINED", date: "2024-01-01", context: "Ex-Blind Esports" },
  { playerId: "spower", action: "JOINED", date: "2024-01-01", context: "Ex-Blind Esports" },
  { playerId: "mayavi", action: "JOINED", date: "2024-01-01", context: "Ex-Blind Esports" },
  { playerId: "goblin", action: "LEFT", date: "2024-01-11" },
  { playerId: "spower", action: "LEFT", date: "2024-07-12" },
  { playerId: "jokerr", action: "LEFT", date: "2024-08-19" },
  { playerId: "ninjajod", action: "JOINED", date: "2024-08-19" },
  { playerId: "ninjajod", action: "LEFT", date: "2024-10-08" },
  { playerId: "saumay", action: "JOINED", date: "2024-10-09" },
  { playerId: "skipz", action: "JOINED", date: "2024-10-09" },
  { playerId: "skipz", action: "LEFT", date: "2025-01-10" },
  { playerId: "hunterz", action: "JOINED", date: "2025-01-12" },
  { playerId: "saumay", action: "LEFT", date: "2025-04-30" },
  { playerId: "hunterz", action: "LEFT", date: "2025-04-30" },
  { playerId: "goblin", action: "JOINED", date: "2025-05-01", context: "Return" },
  { playerId: "legit", action: "JOINED", date: "2025-05-13" },
  { playerId: "rony", action: "LEFT", date: "2025-07-17" },
  { playerId: "jokerr", action: "JOINED", date: "2025-07-20", context: "Return" },
  { playerId: "manya", action: "LEFT", date: "2025-07-28" },
  { playerId: "mayavi", action: "LEFT", date: "2025-07-28" },
  { playerId: "thunder", action: "JOINED", date: "2025-09-20" }
);

// Add 2026 Tournaments
data.tournaments.push(
  { id: "community-event-1-2026", name: "KRAFTON Community Event 1", year: 2026, month: 4, tier: "C-Tier", placement: null, prize: null, isWin: false, status: "upcoming", eventDate: "April 2026", details: "Open-for-all community event" },
  { id: "bmps-2026", name: "BGMI Pro Series 2026", year: 2026, month: 5, tier: "A-Tier", placement: null, prize: null, isWin: false, status: "upcoming", eventDate: "May 2026" },
  { id: "community-event-2-2026", name: "KRAFTON Community Event 2", year: 2026, month: 6, tier: "C-Tier", placement: null, prize: null, isWin: false, status: "upcoming", eventDate: "June 2026", details: "Open-for-all community event" },
  { id: "community-event-3-2026", name: "KRAFTON Community Event 3", year: 2026, month: 7, tier: "C-Tier", placement: null, prize: null, isWin: false, status: "upcoming", eventDate: "July 2026", details: "Open-for-all community event" },
  { id: "community-event-4-2026", name: "KRAFTON Community Event 4", year: 2026, month: 8, tier: "C-Tier", placement: null, prize: null, isWin: false, status: "upcoming", eventDate: "August 2026", details: "Open-for-all community event" },
  { id: "bmsd-2026", name: "BGMI Showdown 2026", year: 2026, month: 9, tier: "A-Tier", placement: null, prize: null, isWin: false, status: "upcoming", eventDate: "September 2026" },
  { id: "bmic-2026", name: "BGMI International Cup 2026", year: 2026, month: 10, tier: "A-Tier", placement: null, prize: null, isWin: false, status: "upcoming", eventDate: "October 2026" }
);

data.stats.tournamentsByYear[2026] = (data.stats.tournamentsByYear[2026] || 0) + 7;

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2) + "\\n");

console.log("Successfully updated src/data/data.json");
