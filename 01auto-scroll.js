import { generateData, removeAllChildren } from "./utils.js"

removeAllChildren(boxEl)

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
    child.textContent = dataSource[i].title
    child.dataset.index = dataSource[i].idx
    frag.appendChild(child)
  }
  parent.appendChild(frag)
}

initRender()


// boxEl.addEventListener('scroll', function(e) {

//   // _topOffset =
//   rerenderByTopOffset(this.scrollTop)
// })

function scrollHanlder() {
  console.log('scroll in 01')
  renderChildren(container)
}

boxEl.addEventListener('scroll', scrollHanlder)

export function removeAllListeners() {
  boxEl.removeEventListener('scroll', scrollHanlder)
}




