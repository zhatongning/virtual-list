window.boxEl = document.querySelector('.box')
const CacheChioceStorageKey = '_virtual_list_from_scratch_'

let lastEvenListener

const getTargetPath = (fileName) => {
  return `./${fileName}.js`
}

document.querySelector('.selectors').addEventListener('click', (e) => {
  const target = e.target
  if (target.getAttribute('name') === 'wayToWork') {
    if (lastEvenListener) {
      lastEvenListener()
    }
    window.localStorage.setItem(CacheChioceStorageKey, target.value)
    showConfig(target.value)
    import(getTargetPath(target.value)).then(function({ removeAllListeners }) {
      lastEvenListener = removeAllListeners
    })

  }
})

;(function initFromCache() {
  const cache = window.localStorage.getItem(CacheChioceStorageKey)
  if (cache) {   
    showConfig(cache)
    import(getTargetPath(cache))
    Array.prototype.forEach.call(document.querySelectorAll('input[type=radio]'), function(el) {
      if (el.value === cache) {
        el.setAttribute('checked', true)
      }
    })
  }
})()

function showConfig(val) {
  if (val === '05virtual-list-extended') {
    document.querySelector('.config').style.display = 'flex'
  }
}
