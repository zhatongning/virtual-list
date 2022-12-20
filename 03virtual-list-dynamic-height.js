import { generateData, FixedHeight as EslimateHeight, removeAllChildren } from './utils.js'

removeAllChildren(boxEl)
boxEl.scrollTop = 0


const boxHeight = boxEl.clientHeight
const totalCount = 10000
const dataSource = generateData(totalCount, true)

function initContainer() {
  const container = document.createElement('div')
  container.className = 'container'
  container.style.width = '500px'
  const totalHeight = totalCount * EslimateHeight
  container.style.height = `${totalHeight}px`
  container.style.position = 'relative'
  boxEl.appendChild(container)
  return container
}

const container = initContainer()

function calcTopByIndex(index) {
  let total = 0
  for (let i = 0; i < index; i++) {
    total += dataSource[i].height
  }
  return total
}

function getLastIndex(start) {
  let total = 0, last = dataSource.length - 1
  for(let i = start + 1; i < dataSource.length; i++) {
    total += dataSource[i].height
    if (total > boxHeight) {
      last = i
      break
    }
  }
  return last
}

function calcStartIndex(offsetTop) {
  if (offsetTop === 0) {
    return 0
  }
  let sumHeight = 0, start
  for (let i = 0; i < dataSource.length; i ++) {
    sumHeight += dataSource[i].height
    if (sumHeight > offsetTop) {
      start = i
      break
    }

  }
  return start
}


function eslimateTotalHeight(index) {
  let total = 0
  for (let i = 0; i < index; i++) {
    total += dataSource[i].height
  }
  total += EslimateHeight * (dataSource.length - index)
  return total
}

function rerenderByTopOffset(offsetTop) {
  if (offsetTop + boxHeight === container.clientHeight) {
    return
  }
  const _start = calcStartIndex(offsetTop)
  const _last$ = getLastIndex(_start)

  removeAllChildren(container)

  container.style.height = `${ eslimateTotalHeight(_start) }px`
  const fragment = document.createDocumentFragment()
  for (let i = _start; i <= _last$; i++) {
    const item = document.createElement('div')
    item.textContent = dataSource[i].title
    item.style.position = 'absolute'
    item.style.width = '100%'
    item.style.height = `${dataSource[i].height}px`
    item.style.lineHeight = `${dataSource[i].height}px`
    item.style.top = `${ calcTopByIndex(i) }px`
    item.dataset.index = dataSource[i].idx
    item.style.backgroundColor = dataSource[i].backgroundColor
    fragment.appendChild(item)
  }
  container.appendChild(fragment)

}

rerenderByTopOffset(0)

function scrollHanlder(e) {  
  rerenderByTopOffset(this.scrollTop)
}

boxEl.addEventListener('scroll', scrollHanlder)

export function removeAllListeners() {
  boxEl.removeEventListener('scroll', scrollHanlder)
}
