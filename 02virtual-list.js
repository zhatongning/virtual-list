import { generateData, FixedHeight as Height, removeAllChildren } from './utils.js'

removeAllChildren(boxEl)
boxEl.scrollTop = 0


const totalCount = 10000
const dataSource = generateData(totalCount)
const ItemCountShown = Math.floor(500 / Height + 20)

const container = document.createElement('div')
container.className = 'container'
container.style.width = '500px'
const totalHeight = totalCount * Height
container.style.height = `${totalHeight}px`
container.style.position = 'relative'
for(let i = 0; i < ItemCountShown; i++) {
  const div = document.createElement('div')
  div.textContent = dataSource[i].title
  div.style.height = `${Height}px`
  div.dataset.index = dataSource[i].idx
  container.appendChild(div)
}

boxEl.appendChild(container)

const Top_Distance = 10 * Height

function rerenderByTopOffset(offsetTop) {
  let _start = Math.max(((offsetTop - Top_Distance)  / Height) >> 0, 0)
  console.log('rerender', offsetTop)
  removeAllChildren(container)

  const fragment = document.createDocumentFragment()
  for (let i = _start; i < Math.min(ItemCountShown + _start, totalCount); i++) {
    const item = document.createElement('div')
    item.textContent = dataSource[i].title
    item.style.position = 'absolute'
    item.style.height = `${Height}px`
    item.style.top = `${ i * 30 }px`
    item.dataset.index = dataSource[i].idx
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