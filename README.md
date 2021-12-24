# 思路

把监控点分拆成单元, 单元内划分服务

单元通过监控"换批", "电子秤流量"控制服务的开启与结束

- 回潮

  - 切片机监控: 监控出料电眼?

- 加料

  - 出柜监控: 尾料时正常转高速; 底带频率设置恰当

  - 暂存仓电眼监控: 监控电眼是否长时间处于同一状态

  - 参数检查: 水分仪状态; 料罐低限

  - 语音提示: 一些无法检测的情况通过语音进行提示, 如关闭翻板门, 入柜情况

  - 参数监控: 出口温度; 出口水分

- 切烘

  - 出柜监控: 尾料时正常转高速; 底带频率设置恰当

  - 暂存仓电眼监控(切丝机前): 监控电眼是否长时间处于同一状态

- 加香

# 类(Class)

## 监控单元

监控单元下,各服务的运行频率不一致, 我们以10s为一个单位来控制各功能的更新检查频率

### 加料单元

利用"电子秤运行状态", "换批"来控制各功能的开始, 结束

创建各种服务

## 服务

基于逻辑(如出柜监控)或性质(如电眼监控)创建的用于管理的类, 我们称之为服务.

功能有自己的更新频率, 并由单元控制自己的运行

### 出柜监控

监控出柜号的更新, 出柜号出现更新, 即立刻更新出柜信息

间隙获取电子秤的累计量, 但柜信息的重量与电子秤累计量的差值到达某个条件时, 查看该柜的半柜电眼的情况, 判断出柜是否成功转高速

### 电眼状态控制



## 基础数据结构

### RequestData

轮询查询类型(request): 只关注发生变化, 对何时变化不关心

- Common: 离散 -> 离散

- TraceSetting: 模拟 -> 转换 -> 离散

被间隙性调用 RequestData.updateAndJudgeChange 函数判断变化, 并根据变化做出相应应对

### AdviseData

主动告知(advise): 需要知道变化以及变化的时间, 如电眼某状态的持续时间

- ElectEye


# 程序运行过程

## 主程序

1. 创建所有控制单元

2. 使用 setInterval 函数, 间隙运行各控制单元的 update 函数


# 错误处理

## Mon

### updateTraceData 使用 catch error

traceData 出问题不会让 isChange 变成 true 


service init 出问题会让 init 不成功. 解决方法 service 使用 isInitSuceess 来跟踪 init 是否成功, 如果不成功会在 service update 中重新进行 init

## updateService

service update 出问题没有问题, 把变状态的语句放到 fetch 语句之后, 这样下一次 update 还能进行

# 错误


# 问题

### netdde 不支持中文

当选择 Constants.dataType.CF_TEXT 时, 数据传输使用的编码应该是 gbk, 但是 netdde 在中间似乎把编码弄乱了, 现在暂时通过修改 src\helper.js 中的 decodeFormat 函数, 支持了中文读取. netdde 具体如何处理编码还没有弄清楚 

### 更改 netdde advise 时触发的事件名字

程序本来只用 "advise" 这一个事件名字, 现在换成 itemName
修改 src\client\client.js 中的 _onDDEAdvise 函数

### 如果 intouch 的界面是空字符串, 那么从 netDDE 返回的似乎是带三个空格的字符串, 但是使用trim的方法无法移除这些空格, 怀疑这些空格是全角空格

使用 slice 剪去尾巴的空格

### netdde 有时候会出现采数据丢失的情况, 丢失时返回值为空字符串

修改 FetchDDE 函数, 如果出现丢失情况, 那么会再请求三次, 得到非空字符串立即返回. 如果三次后还是空字符串, 那么就返回这个空字符串

### netdde 无法一直成功获取筒生产状态, 电子秤运行状态

第一次 request 的时候是能获得值的, 但是后面就不行了, 知道值变化后才能获取.

怀疑布尔量都不能一直间歇获取(未证实), 使用 advice 倒是可以获取

### 出现 Timeout waitting for answer of request ID 后, fetchDDE 中的 Advice 和 request 函数都无法获得数据, request 会出现 Not connected 的问题

1. timeout 从默认的 10000 设置到 30000

2. fetchDDE 函数捕捉到 connect error, 需要把 connectServers 中保存的 client 删除掉, 并继续抛出错误

3. EyeDetect Service 需要重启

