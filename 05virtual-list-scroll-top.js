import { generateData, FixedHeight as EslimateHeight, removeAllChildren } from './utils.js'

removeAllChildren(boxEl)
boxEl.scrollTop = 0


const boxHeight = boxEl.clientHeight
const totalCount = 500
const dataSource = generateData(totalCount, false)
const eslimateHeight = 30

const container = document.createElement('div')
container.className = 'container'
container.style.width = '500px'
container.style.position = 'relative'
const eslimateTotalHeight =  eslimateHeight * totalCount
container.style.height = `${ eslimateTotalHeight }px`
boxEl.appendChild(container)

const itemSizeCache = window.itemSizeCache = new Map()
let lastMeasureIndex = -1

function calcStartIndex(offsetTop) {   
  if (itemSizeCache.size === 0) {
    return 0
  }
  let _start = 0
  while(itemSizeCache.has(_start) && (itemSizeCache.get(_start).top < offsetTop)) {
    _start++
  }

  return Math.max(_start - 1, 0)
}

const Target_Dis = boxHeight + 66 * 3

function calcStopIndex(startIndex) {
  let stop = startIndex
  const startTop = itemSizeCache.get(startIndex)?.top || 0
  // 左闭右开
  while(itemSizeCache.has(stop) && (itemSizeCache.get(stop).top - startTop < Target_Dis)) {
    stop++
  }  
  return Math.min(stop, totalCount - 1)
}

let lastOffsetTop

function rerenderByTopOffset(offsetTop) {
  let _startCached = calcStartIndex(offsetTop)
  if (lastMeasureIndex === _startCached) {
    return
  }  
  lastMeasureIndex = _startCached
  if (offsetTop + boxHeight === container.clientHeight) {
    return
  }
  // 通过缓存的数据
  removeAllChildren(container)
  let stopCached = calcStopIndex(_startCached)  
  if (stopCached - _startCached > 0) {
    const frag = document.createDocumentFragment()
    for (let i = _startCached; i < stopCached; i++) {
      renderItem(frag, dataSource[i], itemSizeCache.get(i).top)
    }
    container.appendChild(frag)    
  }
  
  // todo: 100通过参数设置
  let _start$ = stopCached
  const _stopTop =  itemSizeCache.get(_startCached)?.top ?? 0
  let total = (itemSizeCache.get(stopCached - 1)?.top + itemSizeCache.get(stopCached - 1)?.height) || 0

  do {    
    const item = renderItem(container, dataSource[_start$], total)
    const itemHeight = item.clientHeight    
    // 这里存储 top 是为了有缓存时，通过offset计算startIndex方便
    if (!itemSizeCache.has(_start$)) {
      container.style.height = `${eslimateTotalHeight + itemHeight - eslimateHeight}px`
      itemSizeCache.set(_start$, { height: itemHeight, top: total })          
    }    
    total += itemHeight
    _start$++
  } while(_start$ < totalCount && total - _stopTop < Target_Dis)

  function renderItem(target, card, top) {
    const item = document.createElement('div')
    item.textContent = card.title
    item.style.position = 'absolute'
    item.style.width = '100%'
    item.style.top = `${ top }px`
    item.dataset.index = card.idx
    item.style.backgroundColor = card.backgroundColor
    target.appendChild(item)    
    return item
  }
  

}

rerenderByTopOffset(0)

function scrollHanlder(e) {
  rerenderByTopOffset(this.scrollTop)
  
}

boxEl.addEventListener('scroll', scrollHanlder)


export function removeAllListeners() {
  boxEl.removeEventListener('scroll', scrollHanlder)
}
