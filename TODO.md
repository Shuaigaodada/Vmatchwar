# TODO

客户端方面需要发送以下信息
- 微信数据 头像 & 名称
- 游戏名称(考虑到借号方面 因此可以暂时留空 确定赛程后必须在比赛开始前一小时内填写名称 否则替换至替补席位)
- 奖品收货地址(金钱类 wx/zfb 奖品类 收货地址)
- 玩家真实段位
- 玩家组队状况(是否有固定队友, 空缺系统自动匹配)

服务端方面需要发送以下信息
- 比赛奖品
- 比赛分组
- 比赛机制(BO1, BO3, BO5, BAN_BO, Repechage, Team Competition)
- 赛程时间(默认周六至周日 具体时间发起人设定)
- 赛程分队(将每个玩家空缺位置进行匹配, 根据段位分差值来进行比赛分组)
- 赛程多冠模式(低分段赛程将不会和高分段匹配)
- 比赛报名截止时间
- 比赛玩家最大限制
- 替补席位限制
- 比赛技术人员(解说员, 主持人, 维护人员, 管理员)
- 赛程数量(可能因为模式不同而改变)
- 赛程是否同时进行(如Team A vs. Team C和 Team B vs. Team D是否同时开始进行比赛)

# 流程
由于此程序为内部程序不公开使用因此考虑群聊效果，
创建者发起比赛->玩家报名->截至后将比赛分配数据返回给发起者->发起者/管理员修改->
生成玩家分组海报->开始比赛->(未来将会在某个客户端读取包来确定比赛信息来实时显示数据)->
比赛结束->显示结果

# 问题考虑
- 玩家A,B是双排匹配，而赛程中唯一比赛剩余位置和双排并不匹配，是否拆散AB玩家？
- 玩家因某些事需要替补, 替补池内没有可用替补该如何处理?
- 替补处理逻辑是随机选择还是先报名的替补获得优先替补权？