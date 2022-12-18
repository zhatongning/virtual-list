import { generateData, removeAllChildren } from "./utils.js"

removeAllChildren(boxEl)
document.title = 'auto-scroll'

const dataSource = generateData(10000)

let container

function initRender() {
  container = document.createElement('div')
  renderChildren(container)
  boxEl.appendChild(container)
}

function renderChildren(parent) {
  removeAllChildren(parent)
  const frag = document.createDocumentFragment()
  for(let i = 0; i < dataSource.length; i++) {
    const child = document.createElement('div')
    child.innerText = dataSource[i].title
    child.dataset.index = dataSource[i].idx
    frag.appendChild(child)
  }
  parent.appendChild(frag)
}

initRender()


function scrollHanlder() {
  console.log('scroll in 01')
  renderChildren(container)
}

boxEl.addEventListener('scroll', scrollHanlder)

export function removeAllListeners() {
  boxEl.removeEventListener('scroll', scrollHanlder)
}




