"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var tournamentEngines_1 = require("./src/lib/tournamentEngines");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var tournaments, _i, tournaments_1, t, _a, _b, g, teamMap, _c, _d, m, teams, computed, _e, computed_1, s, teams, uniqueTeams, computed, _f, computed_2, s;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, prisma.tournament.findMany({
                        where: { format: "gironi_eliminazione" },
                        include: {
                            groups: {
                                include: {
                                    standings: true,
                                    matches: { include: { teamA: true, teamB: true } }
                                }
                            }
                        }
                    })];
                case 1:
                    tournaments = _g.sent();
                    console.log("Trovati ".concat(tournaments.length, " tornei a gironi."));
                    _i = 0, tournaments_1 = tournaments;
                    _g.label = 2;
                case 2:
                    if (!(_i < tournaments_1.length)) return [3 /*break*/, 14];
                    t = tournaments_1[_i];
                    _a = 0, _b = t.groups;
                    _g.label = 3;
                case 3:
                    if (!(_a < _b.length)) return [3 /*break*/, 13];
                    g = _b[_a];
                    if (!(g.standings.length === 0 && g.matches.length > 0)) return [3 /*break*/, 8];
                    console.log("Gruppo ".concat(g.name, " nel torneo ").concat(t.name, " non ha standings! Ricostruisco..."));
                    teamMap = new Map();
                    for (_c = 0, _d = g.matches; _c < _d.length; _c++) {
                        m = _d[_c];
                        if (m.teamA && !teamMap.has(m.teamAId))
                            teamMap.set(m.teamAId, m.teamA);
                        if (m.teamB && !teamMap.has(m.teamBId))
                            teamMap.set(m.teamBId, m.teamB);
                    }
                    teams = Array.from(teamMap.values());
                    computed = (0, tournamentEngines_1.computeGroupStandings)(teams, g.matches);
                    _e = 0, computed_1 = computed;
                    _g.label = 4;
                case 4:
                    if (!(_e < computed_1.length)) return [3 /*break*/, 7];
                    s = computed_1[_e];
                    return [4 /*yield*/, prisma.groupStanding.create({
                            data: {
                                groupId: g.id,
                                teamId: s.teamId,
                                played: s.played,
                                won: s.won,
                                lost: s.lost,
                                setsFor: s.setsFor,
                                setsAgainst: s.setsAgainst,
                                points: s.points
                            }
                        })];
                case 5:
                    _g.sent();
                    _g.label = 6;
                case 6:
                    _e++;
                    return [3 /*break*/, 4];
                case 7:
                    console.log("Finito di ricostruire gruppo ".concat(g.name, "."));
                    return [3 /*break*/, 12];
                case 8:
                    if (!(g.standings.length > 0)) return [3 /*break*/, 12];
                    // Even if they exist, recalculate points just in case!
                    console.log("Gruppo ".concat(g.name, " ha standings, ricalcolo per sicurezza..."));
                    teams = g.matches.map(function (m) { return m.teamA; }).concat(g.matches.map(function (m) { return m.teamB; })).filter(Boolean);
                    uniqueTeams = Array.from(new Map(teams.map(function (t) { return [t.id, t]; })).values());
                    computed = (0, tournamentEngines_1.computeGroupStandings)(uniqueTeams, g.matches);
                    _f = 0, computed_2 = computed;
                    _g.label = 9;
                case 9:
                    if (!(_f < computed_2.length)) return [3 /*break*/, 12];
                    s = computed_2[_f];
                    return [4 /*yield*/, prisma.groupStanding.updateMany({
                            where: { groupId: g.id, teamId: s.teamId },
                            data: {
                                played: s.played,
                                won: s.won,
                                lost: s.lost,
                                setsFor: s.setsFor,
                                setsAgainst: s.setsAgainst,
                                points: s.points
                            }
                        })];
                case 10:
                    _g.sent();
                    _g.label = 11;
                case 11:
                    _f++;
                    return [3 /*break*/, 9];
                case 12:
                    _a++;
                    return [3 /*break*/, 3];
                case 13:
                    _i++;
                    return [3 /*break*/, 2];
                case 14: return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error).finally(function () { return prisma.$disconnect(); });
