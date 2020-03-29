# 页面滚动监听

使用方式：

```js
let pgWatch = new PageObserver()

// 开始监听
pgWatch.watch(document.querySelectAll('.img'), 'name', _ => console.log('cb'), 0)

pg.unWatch() // 解除监听
```
