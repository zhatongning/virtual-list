import { generateData, totalCount, FixedHeight, removeAllChildren } from "./utils.js"

removeAllChildren(boxEl)
document.title = 'absolute-auto-scroll'

const dataSource = generateData(totalCount)

let container

function initRender() {
  container = document.createElement('div')
  container.style.position = 'relative'
  container.style.height = `${ totalCount * FixedHeight }px`
  renderChildren(container)
  boxEl.appendChild(container)
}

function renderChildren(parent) {
  removeAllChildren(parent)
  const frag = document.createDocumentFragment()
  for(let i = 0; i < dataSource.length; i++) {
    const child = document.createElement('div')
    child.style.position = 'absolute'
    child.style.height = `${dataSource[i].height}px`
    child.style.top = `${i * FixedHeight}px`    
    child.innerText = dataSource[i].title
    child.dataset.index = dataSource[i].idx
    frag.appendChild(child)
  }
  parent.appendChild(frag)
}

initRender()


function scrollHanlder() {
  renderChildren(container)
}

boxEl.addEventListener('scroll', scrollHanlder)

export function removeAllListeners() {
  boxEl.removeEventListener('scroll', scrollHanlder)
}




