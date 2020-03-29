import IntersectionObserver from 'intersection-observer'
class PageObserver {
  static BEFOREUNWATCH = 0
  static FIRSTSHOW = 1
  static FIRSTLEAVE = 2
  constructor (cb) {
    this.watchInfo = {} // 返回对象
    this.cb = cb // 回调函数
    this.uniqueProp = '' // 唯一区分ID
    this.pageTime = 0 // 页面停留时长
    this.triggerTime = 0 // 回调触发类型
    this.entries = null // 监听对象
    this.config = { // 监听粒度，暂不支持可配置
      threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
    }
    this.observer = this._init(this.config)
  }
  getKey (img) {
    return img.getAttribute(this.uniqueProp)
  }
  initDuration (entries) {
    if (Object.keys(this.watchInfo).length) return
    this.entries = entries
    entries.forEach((item, idx) => {
      let key = this.getKey(item.target)
      key = `${idx}_${key}`
      this.watchInfo[key] = {}
    })
  }
  _init (config) {
    return new IntersectionObserver((entries) => {
      this.initDuration (entries)
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) { // 如果当前元素在可视区
          this.triggerTime === PageObserver.FIRSTSHOW && this.cb && this.cb('firstshow')
          this.countTime(entry) // 
        } else {
          this.endCountTime(entry)
        }
      })
    }, config)
  }
  countTime (entry) { // 开始计时
    let entryKey = this.getKey(entry.target)
    Object.keys(this.watchInfo).some(item => {
      if (item.includes(entryKey)) {
        if (this.watchInfo[item].start === undefined) { // 未初始化，则初始化
          this.watchInfo[item] = {
            start: new Date(),
            duration: 0,
            maxScroll: 0,
            watchTimes: 0,
          }
        } else { // 已初始化，则更新maxscroll
          this.updateDuration(item)                
          this.watchInfo[item].start = new Date()
          this.watchInfo[item].maxScroll = 
            Math.max(this.watchInfo[item].maxScroll, entry.intersectionRatio)
        }
        return true
      }
    })
  }
  updateDuration (item) {
    if (this.watchInfo[item].start) {
      this.watchInfo[item].duration += (new Date() - this.watchInfo[item].start)
    }
  }
  endCountTime (entry) { // 结束计时
    let entryKey = this.getKey(entry.target)
    Object.keys(this.watchInfo).some(item => {
      if (item.includes(entryKey)) {
        if (this.watchInfo[item].duration === undefined) return true
        this.triggerTime === PageObserver.FIRSTLEAVE && this.cb && this.cb('endcounttime')
        this.updateDuration(item)
        this.watchInfo[item].maxScroll = Math.max(entry.intersectionRatio, this.watchInfo[item].maxScroll)
        this.watchInfo[item].start = null
        if (this.watchInfo[item].duration) {
          this.watchInfo[item].watchTimes += 1 
        }
        return true
      }
    })
  }
  isNotDOMNode (domElements) {
    let typeStr = Object.prototype.toString.call(domElements)
    return typeStr.indexOf('NodeList') === -1
      && typeStr.indexOf('Element') === -1
      && typeStr.indexOf('HTMLCollection') === -1
  }
  /**
   * @param { Array } domElements dom对象数组
   * @param { string } uniqueProp 各监听dom之间区分的属性，比如class， id等
   * @param { function } cb 回调函数，希望在执行中触发的函数
   * @param { number } triggerTime 触发的时间 0: 停止监听时触发 1: 进入视野就触发，2: 离开视野触发 
  */
  watch (domElements, uniqueProp, cb, triggerTime=0) {
    // NodeList, Element
    if (this.isNotDOMNode(domElements)) {
      throw '待监听数据格式有误'
    }
    if (!uniqueProp || typeof uniqueProp !== 'string') {
      throw '待监听数据的唯一属性应是非空的字符串'
    }
    if (triggerTime !== 0 && triggerTime !== 1 && triggerTime !== 2) {
      throw '回调函数触发类型设置不正确'
    }
    this.cb = cb
    this.uniqueProp = uniqueProp
    this.triggerTime = triggerTime
    this.pageTime = new Date()
    const nodeLists = [...domElements]
    nodeLists && nodeLists.forEach(node => { // 做监听
      this.observer.observe(node)
    })
  }
  unWatch () {
    if (this.entries) {
      this.entries.forEach(entry => {
        this.observer.unobserve(entry.target);
      })
      this.watchInfo.pageTime = new Date() - this.pageTime
      this.cb && this.triggerTime === PageObserver.BEFOREUNWATCH && this.cb('unwatch:')
      return this.watchInfo
    }
  }
}
export default PageObserver