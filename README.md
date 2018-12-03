# dataErrorCache
数据上报异常的情况缓存处理

这个解决方案用的是localStorage的方式处理的，原理为：当某个 请求超时的时候可以调用库里的setData方法设置缓存库并设置下次上传时间。由于没法实时监听需要在页面跳转的时候执行reportData方法。

### 使用方法
```
  import DataErrorCache  from './DataErrorCache'
  
  // DataErrorCache 接收三个参数 isDev 是否为开发环境  localLength 最大缓存长度 localName 缓存库名称
  
  let data = new DataErrorCache();
  
  /**
   * 上报数据
   * @param cb  ajax请求方法或其他方法 arg为可以上报的数据 此方法需要return出一个promise
   * @param time  毫秒 default now time
   */
  data.reportData(cb,time);
  
  /**
   * 获取缓存库内容
   * @returns {Array|Null}
   */
  data.getDataList();
  
  /**
   * 插入上报数据
   * @param params  上报数据
   * @param reportTime  上报时间（毫秒）
   * @returns {Array} 缓存库数组
   */
  data.setData(params, reportTime);
  
  /**
   * 删除上报数据
   * @param id  上报数据ID
   * @returns {Object|null}
   */
  data.deleteData(id);
  
  /**
   * 清空缓存库
   */
  data.deleteAllData();
  
  /**
   * 筛选缓存库数据
   * @param time  时间戳（毫秒）
   * @returns {*}
   */
  data.getAccordWithList(time);
```
