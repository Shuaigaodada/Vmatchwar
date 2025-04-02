class Player {
    constructor(wechat_name, rank) {
        this.wechat_name = wechat_name;
        this.nike_name = "";
        this.rank = rank || 0;
    }

    toString() {
        return this.wechat_name;
    }
}

class BO1 {
    constructor() {
        this.price = "";
        this.players = []; // Array<{id: string, rank: number}> 玩家列表，每个元素是 {id, rank}
        this.groups = []; // Array<Array<string>> 分组列表，每个元素是一个分组
        this.startTime = 0;
        this.endSignUp = 0;
        this.substitute = [];
        this.admins = [];
        this.startBoth = false;
        this.teammateLimit = 20;
        this.schedule = [];
        this.teams = [];
    }

    createGroups(wechat_names) {
        // 组的第一个元素是组长，组长负责同意/拒绝组员的加入
        this.groups.push(wechat_names);
    }

    joinGroups(wechat_name, group_leader) {
        for(let group of this.groups) {
            if(group[0] === group_leader) {
                group.push(wechat_name);
                return;
            }
        }
    }

    createSchedule(_teams) {
        let teams = _teams.slice();
        // 创建赛程
        if(teams.length % 2 !== 0) {
            // 轮空处理
            teams.push([new Player("轮空"), new Player("轮空"), new Player("轮空"), new Player("轮空"),new Player("轮空")]);
        }
        
        this.shuffle(teams);

        // 生成赛程
        let currentRound = teams.map((team, index) => {
            if(index % 2 === 0) {
                return { teamA: team, teamB: teams[index + 1], winner: null };
            }
        }).filter(match => match !== undefined);

        this.schedule.push(currentRound);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    replace_teammates(wechat_name) {
        for(let i = 0; i < this.teams.length; i++) {
            for(let j = 0; j < this.teams[i].length; j++) {
                if(this.teams[i][j].wechat_name == wechat_name) {
                    this.teams[i][j] = this.substitute.shift();
                    return;
                }
            }
        }
        throw new Error("没有找到该队员");
    }

    randomTeams(numTeams) {
        const n = this.players.length;
        if (n % numTeams !== 0) {
            throw new Error("玩家数量必须能被队伍数量整除");
        }
        const teamSize = n / numTeams;
    
        // 提取玩家id和rank
        const playerIds = this.players.map(p => p.wechat_name);
        const ranks = Object.fromEntries(this.players.map(p => [p.wechat_name, p.rank]));
    
        // 检查组拍是否冲突
        for (const group of this.groups) {
            if (!group.every(id => playerIds.includes(id))) {
                throw new Error("组拍冲突");
            }
        }
    
        // 生成所有可能的分组
        const allCombinations = this.getCombinations(playerIds, teamSize);
        let bestDiff = Infinity;
        let bestTeams = null;
    
        // 遍历所有组合，找到最优组合
        for (const combination of this.getTeamCombinations(allCombinations, numTeams)) {
            const usedPlayers = new Set(combination.flat());
            if (usedPlayers.size !== playerIds.length) {
                continue; // 确保没有重复使用玩家
            }
    
            // 检查组拍是否被拆散
            let valid = true;
            for (const group of this.groups) {
                const inOneTeam = combination.some(team => group.every(id => team.includes(id)));
                if (!inOneTeam) {
                    valid = false;
                    break;
                }
            }
            if (!valid) {
                continue;
            }
    
            // 计算每个队伍的段位差
            const teamRanks = combination.map(team => team.reduce((sum, id) => sum + ranks[id], 0));
            const maxRank = Math.max(...teamRanks);
            const minRank = Math.min(...teamRanks);
            const diff = maxRank - minRank;
            if (diff < bestDiff) {
                bestDiff = diff;
                bestTeams = combination;
            }
        }
    
        this.teams = bestTeams.map(team => team.map(id => this.players.find(p => p.wechat_name === id)));
        return this.teams;
    }
    
    getCombinations(arr, size) {
        const result = [];
        const helper = (start, combo) => {
            if (combo.length === size) {
                result.push([...combo]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                combo.push(arr[i]);
                helper(i + 1, combo);
                combo.pop();
            }
        };
        helper(0, []);
        return result;
    }
    
    getTeamCombinations(combinations, numTeams) {
        const result = [];
        const helper = (start, current, usedPlayers) => {
            if (current.length === numTeams) {
                result.push([...current]);
                return;
            }
            for (let i = start; i < combinations.length; i++) {
                const team = combinations[i];
                // 检查是否有玩家被重复使用
                if (team.some(player => usedPlayers.has(player))) {
                    continue;
                }
                // 标记当前队伍的玩家为已使用
                team.forEach(player => usedPlayers.add(player));
                current.push(team);
                helper(i + 1, current, usedPlayers);
                current.pop();
                // 回溯时移除标记
                team.forEach(player => usedPlayers.delete(player));
            }
        };
        helper(0, [], new Set());
        return result;
    }

    // 打印赛程
    printSchedule() {
        this.schedule.forEach((round, roundIndex) => {
            console.log(`第 ${roundIndex + 1} 轮:`);
            round.forEach(match => {
                console.log(
                    `${match.teamA.map(player => player.wechat_name).join(", ")} vs ${match.teamB.map(player => player.wechat_name).join(", ")}`
                );
            });
        });
    }
}

game = new BO1();
game.players = [
    new Player("p1", 6.0), 
    new Player("p2", 5.3), new Player("p3", 4.9), new Player("p4", 4.7), 
    new Player("p5", 4.2), new Player("p6", 3.9), 
    new Player("p7", 2.1), new Player("p8", 1.2),
    new Player("p9", 1.1), new Player("p10", 0.9),
    new Player("p11", 5.2), new Player("p12", 0.7),
    new Player("p13", 3.6), new Player("p14", 2.5),
    new Player("p15", 1.8)
];
game.createGroups(["p2", "p3"]);
game.joinGroups("p4", "p2");
game.createGroups(["p5", "p6"]);
game.createGroups(["p7", "p8"]);
game.createGroups(["p9", "p10"]);
game.createGroups(["p11", "p13", "p15"]);
game.randomTeams(3);
// 打印队伍
game.teams.forEach((team, index) => {
    console.log(`队伍${index + 1}:`, team.map(player => player.wechat_name));
    console.log(`平均rank:`, team.reduce((sum, player) => sum + player.rank, 0) / team.length);
});

game.createSchedule(game.teams);
// 打印赛程
game.printSchedule();
