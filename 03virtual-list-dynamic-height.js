import { generateData, FixedHeight as EslimateHeight, removeAllChildren } from './utils.js'

removeAllChildren(boxEl)
boxEl.scrollTop = 0


const boxHeight = boxEl.clientHeight
const totalCount = 500
const dataSource = generateData(totalCount, true)
// const ItemCountShown = Math.floor(500 / EslimateHeight + 20)

const container = document.createElement('div')
container.className = 'container'
container.style.width = '500px'
let totalHeigh
container.style.position = 'relative'

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

const _last$ = getLastIndex(0)
container.style.height = `${ eslimateTotalHeight(0) }px`


for(let i = 0; i <= _last$; i++) {
  const div = document.createElement('div')
  div.textContent = dataSource[i].title
  div.style.width = '100%'
  div.style.position = 'absolute'
  div.style.top = `${ calcTopByIndex(i) }px`
  div.style.height = `${ dataSource[i].height }px`
  div.style.backgroundColor = dataSource[i].backgroundColor
  div.dataset.index = dataSource[i].idx
  container.appendChild(div)
}

function calcStartIndex(offsetTop) {
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

boxEl.appendChild(container)

function eslimateTotalHeight(index) {
  let total = 0
  for (let i = 0; i < index; i++) {
    total += dataSource[i].height
  }
  total += EslimateHeight * (dataSource.length - index)
  return total
}

let lastOffsetTop

function rerenderByTopOffset(offsetTop) {
  if (offsetTop + boxHeight === container.clientHeight) {
    return
  }
  const _start = calcStartIndex(offsetTop)
  const _last$$ = getLastIndex(_start)
  console.log('rerender', _start, _last$$, offsetTop)

  container.style.height = `${ eslimateTotalHeight(_start) }px`
  const fragment = document.createDocumentFragment()
  for (let i = _start; i <= _last$$; i++) {
    const item = document.createElement('div')
    item.textContent = dataSource[i].title
    item.style.position = 'absolute'
    item.style.width = '100%'
    item.style.height = `${dataSource[i].height}px`
    item.style.top = `${ calcTopByIndex(i) }px`
    item.dataset.index = dataSource[i].idx
    item.style.backgroundColor = dataSource[i].backgroundColor
    fragment.appendChild(item)
  }
  container.appendChild(fragment)

}

function scrollHanlder(e) {
  console.log(e.target)
  rerenderByTopOffset(this.scrollTop)
}

boxEl.addEventListener('scroll', scrollHanlder)


export function removeAllListeners() {
  boxEl.removeEventListener('scroll', scrollHanlder)
}