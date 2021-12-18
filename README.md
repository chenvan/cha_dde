# 框架

## 监控单元(Mon): 如回潮单元, 加料单元, 切烘单元

跟踪数据(TraceData): 跟踪单元里重要数据的变化, 发生变化时修改 Unit 自身的属性 或者 Service 的属性

服务(Service): 服务就是单元需要实现的功能, 如加料单元需要监控出柜. Service 是否处于活动状态由跟踪数据决定

更新(updateAll): 用来更新 跟踪数据 和 活动服务 的数据

## Service: 如出柜监控, 语音加载

状态: 是否处于活动状态

更新: 更新数据, 完成 服务(Service) 的功能

## TraceData

更新: 更新数据, 判断数据是否发生改变, 发生变化后, 做出 init 的判断

### init 失败的情况: 

1. init 时, fetch 不到数据 // 修改fetch 函数, 拿不到数据时至少拿多两次

2. init 时, 得到错误的数据(不在 config 中)

## Util

### 检查参数

### 加载语音

## 其他

### 不同 Service 的更新频率
以 10s 作为单位间隔时间, Service 可以使用 10s, 20s, 30, 40s, 50s, 60s 的频率更新

次数 3 * 4 * 5 = 60

### init 的情况
首先只会在TraceData中

# 服务

## 加料单元

### 参数检查
1. 水分仪检查
2. 加料缸下限检查

参数检查是否能结合语音提醒来做

还是分开?

如果是结合在一起做, 那么需要对数据结构进行考虑

如需要对料缸下限进行设置, 需要首先知道选的料缸号(三个布尔量), 通过缸号然后获取下限值

# 错误处理

## Mon

### updateTraceData 使用 catch error

traceData 出问题不会让 isChange 变成 true 


service init 出问题会让 init 不成功. 解决方法 service 使用 isInitSuceess 来跟踪 init 是否成功, 如果不成功会在 service update 中重新进行 init

## updateService

service update 出问题没有问题, 把变状态的语句放到 fetch 语句之后, 这样下一次 update 还能进行

# 问题

## netdde 返回的数据有可能是空值

首先 netdde 返回的数据类型是 string, 采不到数据时会是空字符串

## netdde 不支持中文

当选择 Constants.dataType.CF_TEXT 时, 数据传输使用的编码应该是 gbk, 但是 netdde 在中间似乎把编码弄乱了, 现在暂时通过修改 src\helper.js 中的 decodeFormat 函数, 支持了中文读取. netdde 具体如何处理编码还没有弄清楚 

## 更改 netdde advise 时触发的事件名字
程序本来只用 "advise" 这一个事件名字, 现在换成 itemName
修改 src\client\client.js 中的 _onDDEAdvise 函数

## 如果 intouch 的界面是空字符串, 那么从 netDDE 返回的似乎是带三个空格的字符串, 但是使用trim的方法无法移除这些空格, 怀疑这些空格是全角空格

## netdde 有时候会出现采数据丢失的情况, 丢失时返回值为空字符串
修改 FetchDDE 函数, 如果出现丢失情况, 那么会再请求三次, 得到非空字符串立即返回. 如果三次后还是空字符串, 那么就返回这个空字符串

## netdde 无法一直成功获取筒生产状态, 电子秤运行状态
第一次 request 的时候是能获得值的, 但是后面就不行了, 知道值变化后才能获取.

怀疑布尔量都不能一直间歇获取(未证实), 使用 advice 倒是可以获取