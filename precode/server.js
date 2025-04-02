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
        // 退火算法
        const n = this.players.length;
        if(n % numTeams !== 0) {
            throw new Error("玩家数量必须能被队伍数量整除");
        }
        const teamSize = n / numTeams;
    
        // 提取玩家id和rank
        const playerIds = this.players.map(p => p.wechat_name);
        const ranks = Object.fromEntries(this.players.map(p => [p.wechat_name, p.rank]));
    
        // 初始化队伍
        let currentTeams = this.initializeRandomTeams(playerIds, numTeams, teamSize);
        let bestTeams = currentTeams;
        let bestScore = this.calculateScore(currentTeams, ranks);
    
        // 模拟退火参数
        let temperature = 100; // 初始温度
        const coolingRate = 0.99; // 降温速率
        const minTemperature = 0.1; // 最低温度
    
        while(temperature > minTemperature) {
            // 生成新解（随机交换两个玩家）
            const newTeams = this.generateNeighbor(currentTeams, playerIds, teamSize);
            const newScore = this.calculateScore(newTeams, ranks);
    
            // 如果新解更优，接受新解
            if(newScore < bestScore) {
                bestTeams = newTeams;
                bestScore = newScore;
            }
    
            // 根据概率接受次优解
            if(Math.random() < Math.exp((bestScore - newScore) / temperature)) {
                currentTeams = newTeams;
            }
    
            // 降温
            temperature *= coolingRate;
        }
    
        // 转换队伍格式
        this.teams = bestTeams.map(team => team.map(id => this.players.find(p => p.wechat_name === id)));
        return this.teams;
    }
    
    // 初始化随机队伍
    initializeRandomTeams(playerIds, numTeams, teamSize) {
        const shuffled = [...playerIds];
        this.shuffle(shuffled);
        return Array.from({ length: numTeams }, (_, i) =>
            shuffled.slice(i * teamSize, (i + 1) * teamSize)
        );
    }
    
    // 计算分组得分（目标函数）
    calculateScore(teams, ranks) {
        const teamAverages = teams.map(team =>
            team.reduce((sum, id) => sum + ranks[id], 0) / team.length
        );
        return Math.max(...teamAverages) - Math.min(...teamAverages);
    }
    
    // 生成邻居解（随机交换两个玩家）
    generateNeighbor(teams, playerIds, teamSize) {
        const newTeams = teams.map(team => [...team]);
        const team1Index = Math.floor(Math.random() * newTeams.length);
        const team2Index = Math.floor(Math.random() * newTeams.length);
    
        if(team1Index !== team2Index) {
            const player1Index = Math.floor(Math.random() * newTeams[team1Index].length);
            const player2Index = Math.floor(Math.random() * newTeams[team2Index].length);
    
            // 交换两个玩家
            const temp = newTeams[team1Index][player1Index];
            newTeams[team1Index][player1Index] = newTeams[team2Index][player2Index];
            newTeams[team2Index][player2Index] = temp;
        }
    
        return newTeams;
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
    new Player("p15", 1.8), new Player("p16", 0.6),
    new Player("p17", 4.5), new Player("p18", 4.0),
    new Player("p19", 3.8), new Player("p20", 3.5)
];
game.createGroups(["p2", "p3"]);
game.joinGroups("p4", "p2");
game.createGroups(["p5", "p6"]);
game.createGroups(["p7", "p8"]);
game.createGroups(["p9", "p10"]);
game.createGroups(["p11", "p13", "p15"]);

// 开始时间
let startTime = new Date();
game.randomTeams(game.players.length / 5);
let endTime = new Date();
console.log(`分组耗时: ${(endTime - startTime) / 1000}s`);
// 打印队伍
game.teams.forEach((team, index) => {
    console.log(`队伍${index + 1}:`, team.map(player => player.wechat_name));
    console.log(`平均rank:`, team.reduce((sum, player) => sum + player.rank, 0) / team.length);
});

game.createSchedule(game.teams);
// 打印赛程
game.printSchedule();
