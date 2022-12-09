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
  let begin = performance.now()
  
  let _start = 0;
  while (
    itemSizeCache.has(_start) &&
    itemSizeCache.get(_start).top < offsetTop
  ) {
    _start++;
  }
  console.log(performance.now() - begin)
  return Math.max(_start - 1, 0);
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

  function renderItem(target, card, top) {
    const item = document.createElement("div");
    item.textContent = card.title;
    item.style.position = "absolute";
    item.style.width = "100%";
    item.style.top = `${top}px`;
    item.dataset.index = card.idx;
    item.style.backgroundColor = card.backgroundColor;
    target.appendChild(item);
    return item;
  }
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
