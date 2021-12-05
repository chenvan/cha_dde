# 框架

## 事件触发

### 更新数据: 定义两种类型的数据. 一种是数据的change, 一种是数据符合特定的条件

从 config 文件中读取需要定时获取的数据(serverName, itemName, dataType), 

对更新的数据进行判定事发触发事件


## 事件处理



# Class

## 数据

### SwitchData

- serverName
- itemName ?
- currentValue
- lastValue

### ConditionBaseData

对于不同的判断条件, 创造不同的Class



# ?
1 换柜触发了 event
换柜的 event name 是一样的吗
2 需要出柜号, 生产线, 地点这些数据, 然后从 config 中获得 serverName, ItemName, 生成其他数据, 放到 monDataDict 中
生产线和地点可以结合成一个 key

# 使用 Mobx? 

# 问题

## CabinetOutputData 的 bug

由于出柜和烘丝换批存在时差, CabinetOutputData 创建时读到的秤累计量是上一批的累计量, 符合提醒的条件
把下游的批次号和柜的批次号也放到 CabinetOutputData里

## netdde 返回的数据有可能是空值

首先 netdde 返回的数据类型是 string
弄一个 fetchInt 函数, 测到NaN就 throw Error

fetchDDE 和 connectServer 不应该 catch error(?)

## netdde 不支持中文

当选择 Constants.dataType.CF_TEXT 时, 数据传输使用的编码应该是 gbk, 但是 netdde 在中间似乎把编码弄乱了, 现在暂时通过修改 src\helper.js 中的 decodeFormat 函数, 支持了中文读取. netdde 具体如何处理编码还没有弄清楚 