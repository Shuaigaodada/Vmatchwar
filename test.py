from itertools import combinations

def split_teams(players, groups):
    """
    将玩家分成两个队伍，使得两个队伍的平均rank尽量接近，同时尽量不拆散组拍。
    
    :param players: List[Tuple[int, int]] 玩家列表，每个元素是 (玩家ID, rank)
    :param groups: List[List[int]] 组拍列表，每个元素是一个玩家ID的列表
    :return: Tuple[List[int], List[int]] 两个队伍的玩家ID列表
    """
    n = len(players)
    if n != 10:
        raise ValueError("必须有10名玩家")
    
    # 提取玩家ID和rank
    player_ids = [p[0] for p in players]
    ranks = {p[0]: p[1] for p in players}
    
    # 检查组拍是否冲突
    for group in groups:
        if not set(group).issubset(set(player_ids)):
            raise ValueError("组拍中的玩家ID必须在玩家列表中")
    
    # 生成所有可能的分组
    all_combinations = list(combinations(player_ids, 5))
    best_diff = float('inf')
    best_teams = None
    
    for team1 in all_combinations:
        team2 = list(set(player_ids) - set(team1))
        
        # 检查组拍是否被拆散
        valid = True
        for group in groups:
            if not (set(group).issubset(set(team1)) or set(group).issubset(set(team2))):
                valid = False
                break
        if not valid:
            continue
        
        # 计算两个队伍的平均rank差异
        rank1 = sum(ranks[player] for player in team1)
        rank2 = sum(ranks[player] for player in team2)
        diff = abs(rank1 - rank2)
        
        # 更新最优解
        if diff < best_diff:
            best_diff = diff
            best_teams = (list(team1), list(team2))
    
    return best_teams

# 示例数据
players = [
    (1, 6.0), (2, 5.3), (3, 4.9), (4, 4.7), (5, 4.2),
    (6, 3.9), (7, 2.1), (8, 1.2), (9, 1.1), (10, 0.9)
]
groups = [[2, 7, 5], [3, 4], [6, 10, 9]]  # 组拍：玩家1、2、3尽量不拆散

team1, team2 = split_teams(players, groups)
print("队伍1:", team1)
print("队伍2:", team2)

# 计算两个队伍的平均rank
rank1 = sum(players[i-1][1] for i in team1) / len(team1)
rank2 = sum(players[i-1][1] for i in team2) / len(team2)
print("队伍1平均rank:", rank1)
print("队伍2平均rank:", rank2)