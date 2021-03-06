# 获取数据
使用 [NetDDE Server](https://github.com/chrisoldwood/NetDDE) 与 [NetDDE Clinet JS Version](https://github.com/st-one-io/netdde) 从 Intouch View 中获取数据

DDE 获取数据的方式是 fetch 和 set advice, 为了方便开发需要在 test 环境下返回假数据

用 DDE 获取数据并不稳定, View 二级界面的数据需要打开后才能被获取

## 升级

待中控升级后, 看是否能够改用支持UA架构的Lib, 更改获取数据的方法

# 监视逻辑


## 遇到错误后的重新连接

由于 DDE 先天不足, 可能会出现无法连接的情况, 因此需要健壮的重连逻辑

### 重连逻辑

#### 方法1：

在各个 mon 单元更新前，需要对各 server 进行连接测试(获取秒数), 如果某个 server 出现连接失败， 那么需要对 server 对应的 mon 进行重新连接

#### 方法2：

在 mon 的 update 函数里，弄一个 try ... catch  的语句，出现错误后，把 mon 的状态转到“出错”，然后在“出错”状态里，尝试获取 server 的秒数，然后进行 reConnect，把状态转到“准备”

# UI显示

使用 [blessed](https://github.com/chjj/blessed#windows-compatibility) 和 [blessed-contrib](https://github.com/yaronn/blessed-contrib) 来展示UI

对于每一个监控单元传递一个box, 然后监控单元里, 使用 mobx 的 autorun 输出监控单元的状态


# Bug

## 加料

### 当加料机完成停机(可能还包含其他条件), 监控单元再进行初始化，加料会转移到“准备完成”的状态。当进行换批后 reaction 没法从”准备完成“跳转到“准备”

在 reaction 中去除 this.state 的条件