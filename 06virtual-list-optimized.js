import {
  generateData,
  removeAllChildren,
  randomInt,
  totalCount
} from "./utils.js";

const container = document.createElement("div");
const itemSizeCache = (window.itemSizeCache = new Map());
let lastStartIndex = -1;
let overscan = 10;
const boxHeight = boxEl.clientHeight;
const dataSource = generateData(totalCount, false);
const eslimateHeight = randomInt(31, 30);
console.log("当前随机的 eslimateHeight:", eslimateHeight);
let eslimateTotalHeight = eslimateHeight * totalCount;

function initContainer() {
  removeAllChildren(boxEl);
    
  container.className = "container";
  container.style.width = "100%";
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

// 记录itemSizeCache缓存的最近的子项信息 
let lastMeasureIndex = -1

function calcStartIndex(offsetTop, start = 0, end = lastMeasureIndex) {
  if (itemSizeCache.size === 0) {
    return Math.floor(offsetTop / eslimateHeight)
  }

  if (itemSizeCache.size > 0 && itemSizeCache.has(end) && itemSizeCache.get(end).top <= offsetTop) {    
    return exponentialSearch(end, offsetTop)
  }
  return calcStartIndex_binarySerach(offsetTop, start, end)
}

function getOffsetByIndex(index) {
  if (itemSizeCache.size === 0) {
    return 0
  }
  if (index < lastMeasureIndex) {
    return itemSizeCache.get(index).top
  }
  let start = lastMeasureIndex + 1, end = index
  let lastMeasureItem = itemSizeCache.get(lastMeasureIndex)
  let currentOffset = lastMeasureItem.top + lastMeasureItem.height
  while (
    start <= end
  ) {
    const item = renderItem(container, dataSource[start], currentOffset);
    const itemHeight = item.clientHeight;
    // 这里存储 top 是为了有缓存时，通过offset计算startIndex方便
      // 动态修改container的height，当所以数据加载完成时，height已调整完毕
    if (!itemSizeCache.has(start)) {
      container.style.height = `${(eslimateTotalHeight +=
        itemHeight - eslimateHeight)}px`;      
      itemSizeCache.set(start, { height: itemHeight, top: currentOffset });
      lastMeasureIndex = start
    }
    item.remove()
    currentOffset += itemHeight;
    start++;
  }
  return itemSizeCache.get(lastMeasureIndex).top
}

function calcStartIndex_binarySerach(offsetTop, start, end) {
  while(start <= end) {

    let mid = start + ((end - start) >> 1)
    if (getOffsetByIndex(mid) >= offsetTop) {
      end = mid - 1
    } else {
      start = mid + 1
    }
  }
  return Math.max(end - 2, 0);
}

function exponentialSearch(index, offsetTop) {
  let interval = 1
  while(index < totalCount && getOffsetByIndex(index) < offsetTop) {

    index += interval
    index *= 2
  }
  return calcStartIndex_binarySerach(offsetTop, Math.floor(index / 2), Math.min(index, totalCount - 1))
}

function rerenderByTopOffset(scrollTop) {   
  let _startCached = calcStartIndex(scrollTop);
  if (lastStartIndex === _startCached) {     
    return;
  }

  if (scrollTop + boxHeight >= container.height) {
    return
  }

  lastStartIndex = _startCached;
  
  // 通过缓存的数据
  removeAllChildren(container);

  let _start$ = _startCached;
  const _stopTop = getOffsetByIndex(Math.max(0, _start$));
  let currentOffset = _stopTop
  let count = 0;
  do {
    const item = renderItem(container, dataSource[_start$], currentOffset);
    const itemHeight = item.clientHeight;
    // 这里存储 top 是为了有缓存时，通过offset计算startIndex方便
      // 动态修改container的height，当所以数据加载完成时，height已调整完毕
    if (!itemSizeCache.has(_start$)) {
      container.style.height = `${(eslimateTotalHeight +=
        itemHeight - eslimateHeight)}px`;      
      itemSizeCache.set(_start$, { height: itemHeight, top: currentOffset });
      lastMeasureIndex = _start$
    }
    currentOffset += itemHeight;
    _start$++;
  } while (
    _start$ < totalCount &&
    (currentOffset - _stopTop < boxHeight || count++ < overscan)
  );

}

function renderItem(target, card, top) {
  const item = document.createElement("div");
  item.textContent = card.title;
  item.style.position = "absolute";
  item.style.width = "100%";
  item.style.top = `${top}px`;
  item.dataset.index = card.idx;
  item.style.backgroundColor = card.backgroundColor;
  target.appendChild(item)
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

