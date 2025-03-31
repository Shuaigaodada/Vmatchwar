class Player {
    constructor(wechat_name) {
        this.wechat_name = wechat_name;
        this.nike_name = "";
        this.rank = 0;
    }

    toString() {
        return this.wechat_name;
    }
}

class BO1 {
    constructor() {
        this.price = "";
        this.players = []; // 二维数组[[p1, p2], [p3], [p4, p5, p6]]
        this.startTime = 0;
        this.endSignUp = 0;
        this.substitute = [];
        this.admins = [];
        this.startBoth = false;
        this.teammateLimit = 20;
        this.schedule = [];
        this.teams = [];
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

    randomTeams() {
        // 1. 按照人数排序队伍
        for(let i = 0; i < this.players.length - 1; i++) {
            let swaped = false;
            for(let j = 0; j < this.players.length - i - 1; j++) {
                if(this.players[j].length < this.players[j + 1].length) {
                    [this.players[j], this.players[j + 1]] = [this.players[j + 1], this.players[j]];
                    swaped = true;
                }
            }
            if(!swaped) break;
        }
        // 2. 计算人数
        let total_players = 0;
        for(let i = 0; i < this.players.length; i++) {
            total_players += this.players[i].length;
        }
        // 3. 分配队伍
        const total_teams = total_players / 5;
        // 创建空队伍
        let teams = [];
        for(let i = 0; i < total_teams; i++) {
            teams.push([]);
        }
        let teamIndex = 0;
        // 分配队伍 TODO: 考虑段位分配
        /**
         * 当前分配：优先分配人数多的队伍在进行补齐，但是不考虑rank
         */
        for(let i = 0; i < this.players.length; i++) {
            if(teams[teamIndex].length + this.players[i].length >= 5) {
                teamIndex++;
                if(teamIndex >= total_teams) {
                    teamIndex = 0;
                }
            }
            for(let j = 0; j < this.players[i].length; j++) {
                if(teams[teamIndex].length < 5) {
                    teams[teamIndex].push(this.players[i][j]);
                } else {
                    if(++teamIndex >= total_teams) {
                        teamIndex = 0;
                    }
                    j--;
                    continue;
                }
            }
        }
        this.teams = teams;
    }

    shuffle(array) {
        for(let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
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
    [new Player("p1")], 
    [new Player("p2"), new Player("p3"), new Player("p4")], 
    [new Player("p5"), new Player("p6")], 
    [new Player("p7"), new Player("p8")], 
    [new Player("p9"), new Player("p10")],
    [new Player("p11"), new Player("p12"), new Player("p13")],
    [new Player("p14")], [new Player("p15")], [new Player("p16")],
    [new Player("p17"), new Player("p18"), new Player("p19")],
    [new Player("p20"), new Player("p21"), new Player("p22"), new Player("p23")],
    [new Player("p24"), new Player("p25")]
];

game.randomTeams();


game.createSchedule(game.teams);
game.createSchedule([game.teams[0], game.teams[2]]);
game.printSchedule();
// console.log(game.schedule);
// console.log(game.teams);