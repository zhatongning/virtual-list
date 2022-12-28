import { generateData, FixedHeight, removeAllChildren } from './utils.js'

removeAllChildren(boxEl)
boxEl.scrollTop = 0
document.title = 'virtual-list-fixed-height'



const totalCount = 10000
const dataSource = generateData(totalCount)
const ItemCountShown = Math.ceil(boxEl.offsetHeight / FixedHeight)


function initContainer() {
  const container = document.createElement('div')
  container.className = 'container'
  container.style.width = '500px'
  const totalHeight = totalCount * FixedHeight
  container.style.height = `${totalHeight}px`
  container.style.position = 'relative'
  boxEl.appendChild(container)
  return container
}

const container = initContainer()

function rerenderByTopOffset(offsetTop) {
  let _start = Math.max((offsetTop / FixedHeight) >> 0, 0)
  removeAllChildren(container)

  const fragment = document.createDocumentFragment()
  for (let i = _start; i < Math.min(ItemCountShown + _start, totalCount); i++) {
    renderItem(fragment, dataSource[i], dataSource[i].idx * FixedHeight)
  }
  container.appendChild(fragment)

}

export function renderItem(container, itemInfo, top) {
  const item = document.createElement('div')
  item.textContent = itemInfo.title
  item.style.position = 'absolute'
  item.style.width = '100%'
  item.style.backgroundColor = `${itemInfo.backgroundColor}`
  item.style.height = `${itemInfo.height}px`
  item.style.top = `${ top }px`
  item.dataset.index = itemInfo.idx
  container.appendChild(item)
  return item
}

rerenderByTopOffset(0)

function scrollHanlder(e) {
  console.log(e.target)
  rerenderByTopOffset(this.scrollTop)
}

boxEl.addEventListener('scroll', scrollHanlder)


export function removeAllListeners() {
  boxEl.removeEventListener('scroll', scrollHanlder)
}
