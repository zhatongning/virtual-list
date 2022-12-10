import {
  generateData,
  removeAllChildren,
  randomInt,
  totalCount
} from "./utils.js";

const container = document.createElement("div");
const itemSizeCache = (window.itemSizeCache = new Map());
let lastMeasureIndex = -1;
let overscan = 10;
const boxHeight = boxEl.clientHeight;
const dataSource = generateData(totalCount, false);
const eslimateHeight = randomInt(31, 30);
console.log("当前随机的 eslimateHeight:", eslimateHeight);
let eslimateTotalHeight = eslimateHeight * totalCount;

const elCache = new Map()

function initContainer() {
  removeAllChildren(boxEl);
    
  container.className = "container";
  container.style.width = "500px";
  container.style.position = "relative";
  container.style.height = `${eslimateTotalHeight}px`;
  boxEl.appendChild(container);
}

function offsetTopChangeHandler (e) {
  boxEl.scrollTop = e.target.value;
}

function overscanChangeHandler (e) {
  overscan = e.target.value;
}

function initConfig() {
  boxEl.scrollTop = document.querySelector("#offset-top").value;

  document.querySelector("#offset-top").addEventListener("input", offsetTopChangeHandler);
  document.querySelector("#overscan").addEventListener("input", overscanChangeHandler);

}

initContainer()
initConfig()


/**
 * @func getNextTop 获取index的下一个item的top值
 * @param index {number} 索引值
 */
function getNextTop(index) {
  if (!itemSizeCache.has(index)) {
    return 0;
  }
  let cache = itemSizeCache.get(index);
  return cache.top + cache.height;
}

function calcStartIndex(offsetTop) {
  if (itemSizeCache.size === 0) {
    return 0;
  }
  // const begin = performance.now()
  let _start = calcStartIndex_binarySerach(offsetTop)
  // console.log(performance.now() - begin)
  return Math.max(_start - 1, 0);
}

function calcStartIndex_binarySerach(offsetTop, start = 0, end = itemSizeCache.size - 1) {
  if (itemSizeCache.size > 0 && itemSizeCache.has(end) && itemSizeCache.get(end).top < offsetTop) {    
    return exponentialSearch(end, offsetTop)
  }
  while(start <= end) {
    let mid = start + ((end - start) >> 1)
    if (itemSizeCache.get(mid).top >= offsetTop) {
      end = mid - 1
    } else {
      start = mid + 1
    }
  }
  return end
}

function exponentialSearch(index, offsetTop) {
  let interval = 1
  while(index < dataSource.length && getTopByIndex_unload(index) < offsetTop) {
    index += interval
    index *= 2
  }
  return calcStartIndex_binarySerach(offsetTop, Math.min(index, dataSource.length - 1), Math.floor(index / 2))
}

function getTopByIndex_unload(index) {
  let start = itemSizeCache.size, end = index
  const lastMeasured = itemSizeCache.get(start - 1)
  let startTop = lastMeasured.top + lastMeasured.height
  for (let i = start; i <= end; i++) {
    const item = renderItem(container, dataSource[i], startTop)
    const itemHeight = item.clientHeight
    if (!itemSizeCache.has(i)) {
      container.style.height = `${(eslimateTotalHeight +=
        itemHeight - eslimateHeight)}px`;
      itemSizeCache.set(i, { height: itemHeight, top: startTop })
    }
    startTop += itemHeight
  }
  console.log('index', index, itemSizeCache.get(end).top)
  return itemSizeCache.get(end).top
}

function calcStopIndex(startIndex) {
  let stop = startIndex;
  // 从开始显示的item的下一个开始算top 这样能保证 在没有添加overscan时 保证大多数机器不会出现白屏
  const startTop = getNextTop(startIndex);
  // 左闭右开
  while (
    itemSizeCache.has(stop) &&
    itemSizeCache.get(stop)?.top - startTop < boxHeight
  ) {
    stop++;
  }
  return Math.min(stop, totalCount - 1);
}

function rerenderByTopOffset(offsetTop) {
  let _startCached = calcStartIndex(offsetTop);
  if (lastMeasureIndex === _startCached) {
    return;
  }
  lastMeasureIndex = _startCached;
  if (offsetTop + boxHeight === container.clientHeight) {
    return;
  }
  // 通过缓存的数据
  removeAllChildren(container);
  let stopCached = calcStopIndex(_startCached);
  if (stopCached - _startCached > 0) {
    const frag = document.createDocumentFragment();
    for (let i = _startCached; i < stopCached; i++) {
      renderItem(frag, dataSource[i], itemSizeCache.get(i).top);
    }
    container.appendChild(frag);
  }

  let _start$ = stopCached;
  const _stopTop = getNextTop(_startCached);
  let total = getNextTop(stopCached - 1);
  let count = 0;

  do {
    const item = renderItem(container, dataSource[_start$], total);
    const itemHeight = item.clientHeight;
    // 这里存储 top 是为了有缓存时，通过offset计算startIndex方便
    if (!itemSizeCache.has(_start$)) {
      // 动态修改container的height，当所以数据加载完成时，height已调整完毕
      container.style.height = `${(eslimateTotalHeight +=
        itemHeight - eslimateHeight)}px`;
      itemSizeCache.set(_start$, { height: itemHeight, top: total });
    }
    total += itemHeight;
    _start$++;
  } while (
    _start$ < totalCount &&
    (total - _stopTop < boxHeight || count++ < overscan)
  );
}

function renderItem(target, card, top) {
  console.log(card.idx)
  if (elCache.has(card.idx)) {
    const itemEl = elCache.get(card.idx)
    target.appendChild(itemEl)
    return itemEl
  }
  console.log('renderItem')
  const item = document.createElement("div");
  item.textContent = card.title;
  item.style.position = "absolute";
  item.style.width = "100%";
  item.style.top = `${top}px`;
  item.dataset.index = card.idx;
  item.style.backgroundColor = card.backgroundColor;
  target.appendChild(item)
  elCache.set(card.idx, item)
  return item;
}

rerenderByTopOffset(0);

function scrollHanlder(e) {
  rerenderByTopOffset(this.scrollTop);
}

boxEl.addEventListener("scroll", scrollHanlder);

export function removeAllListeners() {
  boxEl.removeEventListener("scroll", scrollHanlder);

  document.querySelector("#offset-top").removeEventListener("input", offsetTopChangeHandler);
  document.querySelector("#overscan").removeEventListener("input", overscanChangeHandler);
}

