"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoundRobinSchedule = generateRoundRobinSchedule;
exports.computeGroupStandings = computeGroupStandings;
exports.generateDoubleEliminationStructure = generateDoubleEliminationStructure;
function generateRoundRobinSchedule(teams) {
    var isOdd = teams.length % 2 !== 0;
    var teamsToSchedule = isOdd ? __spreadArray(__spreadArray([], teams, true), [null], false) : __spreadArray([], teams, true);
    var numRounds = teamsToSchedule.length - 1;
    var half = teamsToSchedule.length / 2;
    var schedule = [];
    var currentPositions = __spreadArray([], teamsToSchedule, true);
    for (var r = 0; r < numRounds; r++) {
        var roundMatches = [];
        for (var i = 0; i < half; i++) {
            var home = currentPositions[i];
            var away = currentPositions[teamsToSchedule.length - 1 - i];
            if (home && away) {
                roundMatches.push({ teamAId: home.id, teamBId: away.id });
            }
        }
        schedule.push(roundMatches);
        var last = currentPositions.pop();
        if (last !== undefined)
            currentPositions.splice(1, 0, last);
    }
    return schedule;
}
function computeGroupStandings(teams, groupMatches) {
    var standings = teams.map(function (t) { return ({
        teamId: t.id, team: t, played: 0, won: 0, lost: 0, setsFor: 0, setsAgainst: 0, points: 0
    }); });
    var _loop_1 = function (m) {
        if (!m.winnerTeamId)
            return "continue";
        var teamA = standings.find(function (s) { return s.teamId === m.teamAId; });
        var teamB = standings.find(function (s) { return s.teamId === m.teamBId; });
        if (!teamA || !teamB)
            return "continue";
        teamA.played++;
        teamB.played++;
        teamA.setsFor += m.scoreTeamA;
        teamA.setsAgainst += m.scoreTeamB;
        teamB.setsFor += m.scoreTeamB;
        teamB.setsAgainst += m.scoreTeamA;
        if (m.winnerTeamId === teamA.teamId) {
            teamA.won++;
            teamB.lost++;
            teamA.points += 3;
        }
        else {
            teamB.won++;
            teamA.lost++;
            teamB.points += 3;
        }
    };
    for (var _i = 0, groupMatches_1 = groupMatches; _i < groupMatches_1.length; _i++) {
        var m = groupMatches_1[_i];
        _loop_1(m);
    }
    standings.sort(function (a, b) {
        if (a.points !== b.points)
            return b.points - a.points;
        var diffA = a.setsFor - a.setsAgainst;
        var diffB = b.setsFor - b.setsAgainst;
        if (diffA !== diffB)
            return diffB - diffA;
        if (a.setsFor !== b.setsFor)
            return b.setsFor - a.setsFor;
        var h2h = groupMatches.find(function (m) { return (m.teamAId === a.teamId && m.teamBId === b.teamId) || (m.teamAId === b.teamId && m.teamBId === a.teamId); });
        if (h2h && h2h.winnerTeamId)
            return h2h.winnerTeamId === a.teamId ? -1 : 1;
        return 0;
    });
    return standings;
}
function generateDoubleEliminationStructure(teams) {
    var _a;
    var shuffledTeams = __spreadArray([], teams, true).sort(function () { return Math.random() - 0.5; });
    var wbMatches = [];
    for (var i = 0; i < shuffledTeams.length; i += 2) {
        wbMatches.push({
            id: "wb-r0-m".concat(i / 2),
            teamAId: shuffledTeams[i].id,
            teamBId: ((_a = shuffledTeams[i + 1]) === null || _a === void 0 ? void 0 : _a.id) || null,
            bracketType: "winners"
        });
    }
    return {
        wbRounds: [wbMatches],
        lbRounds: []
    };
}
