/**
 * 数据上报失败处理
 * Created by yaer on 2018/11/29;
 * @Email 740905172@qq.com
 **/
const DATA_ERROR_CACHE = 'DATA_ERROR_CACHE';

export default class {
  constructor(isDev, localLength = 100, localName = DATA_ERROR_CACHE) {
    this.localName = localName;
    this.localLength = localLength;

    // 判断是否为开发环境
    if (isDev !== undefined && !isDev) {
      this.isDev = isDev;
    } else {
      let {hostname} = window.location;
      this.isDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
    }

    // 判断是否有缓存库存在了
    if (!getLocalStorage(this.localName)) {
      setLocalStorage([], this.localName);
      judgeDev(this.isDev, () => {
        log('设置缓存库成功')
      });
    }
  }

  /**
   * 上报数据
   * @param cb  ajax请求方法或其他方法 arg为可以上报的数据 此方法需要return出一个promise
   * @param time  毫秒 default now time
   */
  reportData(cb, time) {
    let timer = time ? time : new Date().getTime();
    let local = getLocalStorage(this.localName);
    this.getAccordWithList(timer).forEach(item => {
      cb(item.params).then(() => {
        this.deleteData(item.id);
      }).catch(() => {
        judgeDev(this.isDev, () => {
          log(`数据上报失败:`, 'error');
          console.log(item);
        })
      })
    })
  }


  /**
   * 获取缓存库内容
   * @returns {Array|Null}
   */
  getDataList() {
    judgeDev(this.isDev, () => {
      log('查询缓存库成功，请自行log显示')
    });
    return getLocalStorage(this.localName);
  }

  /**
   * 插入上报数据
   * @param params  上报数据
   * @param reportTime  上报时间（毫秒）
   * @returns {Array} 缓存库数组
   */
  setData(params, reportTime) {
    if (!reportTime) {
      judgeDev(this.isDev, () => {
        log('请传递上报时间,上报时间为毫秒!!', 'error')
      });
      return;
    }
    if (!params) {
      judgeDev(this.isDev, () => {
        log('请传递上报数据', 'error')
      });
      return;
    }

    let local = getLocalStorage(this.localName);
    let reportData = {
      params,
      reportTime,
      id: setId()
    };

    // 把数据放入数组第一条
    local.unshift(reportData);

    // 最大缓存限制
    if (local.length > this.localLength) {
      local = local.slice(0, this.localLength);
      judgeDev(this.isDev, () => {
        log(`超过最大缓存限制（${this.localLength}），保留最新的数据`, 'error');
      });
    }

    // 设置缓存库
    getLocalStorage(this.localName)(local);
    judgeDev(this.isDev, () => {
      log(`设置缓存库成功,插入数据为:`);
      console.log(reportData);
      log(`***********`)
    });
    return local;
  }

  /**
   * 删除上报数据
   * @param id  上报数据ID
   * @returns {Object|null}
   */
  deleteData(id) {
    let local = getLocalStorage(this.localName);

    // 判断缓存库是否有数据
    if (!local.length) {
      judgeDev(this.isDev, () => {
        log('缓存库为空！', 'error');
      })
      return;
    }

    // 查询ID
    let index, deleteData;
    local.forEach((item, i) => {
      if (item.id === id) index = i;
    })

    // 判断是否查询到
    if (index !== null || index !== undefined) {
      deleteData = local.splice(index, 1);
      setLocalStorage(local,this.localName);
      judgeDev(this.isDev, () => {
        log('删除缓存成功：', 'warning');
        console.log(deleteData[0].params);
        log('**********', 'warning');
      })
    } else {
      judgeDev(this.isDev, () => {
        log(`未查询到ID：${id}`, 'error');
      })
    }

    return deleteData && deleteData[0] || null
  }

  /**
   * 清空缓存库
   */
  deleteAllData() {
    setLocalStorage([],this.localName);
    judgeDev(this.isDev, () => {
      log('缓存库清空成功！')
    });
  }

  /**
   * 筛选缓存库数据
   * @param time  时间戳（毫秒）
   * @returns {*}
   */
  getAccordWithList(time) {
    let timer = time ? time : new Date().getTime();
    let local = getLocalStorage(this.localName);

    judgeDev(this.isDev, () => {
      log('查询符合要求的缓存库成功，请自行log显示')
    });
    return local.map((item) => {
      if (item.reportTime <= timer) {
        return item
      }
    }).filter((item) => {
      return !!item
    })
  }
}

/**
 * 获取失败数据
 * @param localName 缓存库名
 * @returns {string}
 */
function getLocalStorage(localName = DATA_ERROR_CACHE) {
  const local = window.localStorage.getItem(localName);
  return local ? JSON.parse(local) : local;
}


/**
 * 设置缓存库
 * @param dataList  错误信息
 * @param localName 缓存库名称
 */
function setLocalStorage(dataList, localName = DATA_ERROR_CACHE) {
  if (!dataList) {
    judgeDev(this.isDev, () => {
      log('请设置缓存信息', 'error')
    });
    return;
  }
  window.localStorage.setItem(DATA_ERROR_CACHE, JSON.stringify(dataList));
}

/**
 * 打印日志
 * @param msg 内容
 * @param type  打印状态  log|warning|error|
 */
function log(msg, type) {
  switch (type) {
    case 'log':
      console.log(`%c${msg}`, `color:#4A90E2`);
      return;
    case 'warning':
      console.log(`%c${msg}`, `color:#F5C223`);
      return;
    case 'error':
      console.log(`%c${msg}`, `color:#FF6074`);
      return;
    default:
      console.log(`%c${msg}`, `color:#4A90E2`);
      return;
  }
}

/**
 * 获取随机数
 * @returns {String}
 */
function setId() {
  return Math.random().toString(32).substr(4)
}

/**
 * 判断开发环境调用的方法
 * @param isDev
 * @param callback
 */
function judgeDev(isDev, callback) {
  if (isDev) {
    callback();
  }
}


