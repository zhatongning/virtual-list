window.boxEl = document.querySelector('.box')

let lastEvenListener

document.querySelector('.selectors').addEventListener('click', (e) => {
  const target = e.target
  if (target.getAttribute('name') === 'wayToWork') {
    if (lastEvenListener) {
      lastEvenListener()
    }
    import(`./${target.value}.js`).then(function({ removeAllListeners }) {
      lastEvenListener = removeAllListeners
    })

    reset()
  }
})

function reset() {

}


