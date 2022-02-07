# 问题

## DDE

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

第一次 request 的时候是能获得值的, 但是后面就不行了, 直到值变化后才能获取.

怀疑布尔量都不能一直间歇获取(未证实), 使用 advice 倒是可以获取

### 出现 Timeout waitting for answer of request ID 后, fetchDDE 中的 Advice 和 request 函数都无法获得数据, request 会出现 Not connected 的问题

1. timeout 从默认的 10000 设置到 30000

2. fetchDDE 函数捕捉到 connect error, 需要把 connectServers 中保存的 client 删除掉, 并继续抛出错误

3. EyeDetect Service 需要重启

### advice 的初次数据获取不到

先后顺序的问题, 应该先设置 listener, 后设置 advice


## Mobx

### Device 中的 makeObservable 的设置不知到正确不


## Terminal

### blessed, blessed-contrib 无法展示中文
[解决方法](https://github.com/chjj/blessed/issues/377)

### UI开始显示的时候会报电子秤的监控电眼是 undefined
在 init 没有完成的时候, autorun 会自己先跑一次, 因此会出现一些 device 没有 init 完成的情况



