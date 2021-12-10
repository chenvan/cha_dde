# 框架

## 监控单元(Mon): 如回潮单元, 加料单元, 切烘单元

跟踪数据(TraceData): 跟踪单元里重要数据的变化, 发生变化时修改 Unit 自身的属性 或者 Service 的属性

服务(Service): 服务就是单元需要实现的功能, 如加料单元需要监控出柜. Service 是否处于活动状态由跟踪数据决定

更新(updateAll): 用来更新 跟踪数据 和 活动服务 的数据

## Service: 如出柜监控, 语音加载

状态: 是否处于活动状态

更新: 更新数据, 完成 服务(Service) 的功能

## TraceData

更新: 更新数据, 判断数据是否发生改变

# 服务

## 加料单元

# 错误处理

# 使用 Mobx? 

# 问题

## netdde 返回的数据有可能是空值

首先 netdde 返回的数据类型是 string
弄一个 fetchInt 函数, 测到NaN就 throw Error

fetchDDE 和 connectServer 不应该 catch error(?)

## netdde 不支持中文

当选择 Constants.dataType.CF_TEXT 时, 数据传输使用的编码应该是 gbk, 但是 netdde 在中间似乎把编码弄乱了, 现在暂时通过修改 src\helper.js 中的 decodeFormat 函数, 支持了中文读取. netdde 具体如何处理编码还没有弄清楚 

## 更改 netdde advise 时触发的事件名字
程序本来只用 "advise" 这一个事件名字, 现在换成 itemName
修改 src\client\client.js 中的 _onDDEAdvise 函数