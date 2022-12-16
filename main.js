window.boxEl = document.querySelector('.box')
const CacheChioceStorageKey = '_virtual_list_from_scratch_'
const pathShowInput = ['05virtual-list-extended', '06virtual-list-optimized']

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
  if (pathShowInput.includes(val)) {
    document.querySelector('.config').style.display = 'flex'
  } else {
    document.querySelector('.config').style.display = 'none'
  }
}
