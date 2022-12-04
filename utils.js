const HeightRange = [20, 25, 30, 35, 40]
export const FixedHeight = 30

const ColorAtomForHex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']

function randomInt(limit) {
  return Math.floor(Math.random() * limit)
}

const generateHexColor = function() {
  let res = '#'
  for(let i = 0; i < 6; i++) {
    res += ColorAtomForHex[randomInt(16)]
  }
  return res
}

export function generateData(totalCount, dynamicHeight) {
  const dataSource = []
  for (let i = 0; i < totalCount; i++) {
    dataSource.push({
      title: `title ${i}`,
      idx: i,
      height: dynamicHeight ? HeightRange[randomInt(5)] : FixedHeight,
      backgroundColor: generateHexColor()
    })
  }
  return dataSource
}

export function removeAllChildren(container) {
  const len = container.children.length
  for (let i = len - 1; i >= 0; i--) {
    container.removeChild(container.children[i])
  }
}
