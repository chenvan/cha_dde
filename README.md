# 框架
pub / sub 的框架

### pub 结构
数据源, 获得数据的方式, trigger 的条件
### sub 结构



### class 的结构

把功能分拆成class

举例监控出柜

换柜时, 先检查高频和低频的出柜设置
监控下游电子秤的累计量, 当累计量与柜的储量达到一定差值的时候, 检查半柜电眼

CabinetOutputMonitor
advice serverName & itemName

CabinetInfo
半柜电眼

10 个 NetDDE Server

如何统一数据

语音提醒

检测

## 检测数据的方式不一样
数据符合某种条件时进行操作. 这种条件可能来自数据本身的变化(如换批, 筒的状态变化), 也可能需要先做转换后才知道(如对电子秤到达某个重量). 对于第一种情况, 可以通过 advise 的方法. 而第二种则需要定时的 request.

advice 的数据

筒的状态, 语音提示, 分能检测的部分和不能检测的部分

转批时数据的检测(某些容易忘记的参数是否有设)



# 问题
### 启动多个client
把连接不成功的放进一个 array 里, 然后重复连接

### netdde 不支持中文

当选择 Constants.dataType.CF_TEXT 时, 数据传输使用的编码应该是 gbk, 但是 netdde 在中间似乎把编码弄乱了, 现在暂时通过修改 src\helper.js 中的 decodeFormat 函数, 支持了中文读取. netdde 具体如何处理编码还没有弄清楚 