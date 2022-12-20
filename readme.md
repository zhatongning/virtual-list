# 最容易懂的虚拟列表实现

## 从自然滚动开始

如果容器的宽度或者高度固定，当内容的在某个方向上的度量大于容器时，同时给容器添加 `overflow: auto` 或者 `overflow: scroll`时， 就会在该方向上出现滚动条。

![图1](assets/scroll.drawio.svg)

如上图，蓝色背景的容器，其内容的高度比容器本身要高，所以内部就出现了滚动条。滚动时，我们所能看到的内容就是容器在内容上的正交投影内的区域，也是内容的**可视区域**。


## 自然滚动：内容撑开

自然滚动在代码实现上也是很基础的

- 首先需要一个容器

```html
<div class="box"></div>
```

```css
.box {  
  width: 500px;
  /* 固定高度：可视区域的高度 */
  height: 600px;
  border: 1px solid #d1d1d1;
   /* 滚动条 */
  overflow: auto;
}
```

- 然后创建一个`container`元素，作为内容的容器。

```js
  const container = document.createElement('div')
```

- 动态生成一些数据，作为长列表的内容。将数据都生成元素追加到`container`内

```js
{
  idx: 0,  // 索引
  height: 30, // 先固定高度
  backgroundColor: generateHexColor(), // 给个背景颜色，区分块
  title: `title 0`,
}
```

```js
// 生成一万条数据
const dataSource = generateData(10000)

const frag = document.createDocumentFragment()
for(let i = 0; i < dataSource.length; i++) {
  const child = document.createElement('div')
  child.textContent = dataSource[i].title
  child.dataset.index = dataSource[i].idx
  frag.appendChild(child)
}
container.appendChild(frag)
```

- 将 `container` 追加至 `box`内。

这样就有了自然滚动。

具体代码可以查看[github上的源码auto-scroll](https://github.com/zhatongning/virtual-list/blob/master/01-a-auto-scroll.js)

此时的`container`是没有设置高度的，其高度是由内容撑开。

## 自然滚动：内容绝对定位

首先给 `container` 添加相对定位

```js
container.style.posotion = 'relative'
```

同时给生成的数据根据索引添加`top`字段，该字段表明当前块在`container`的绝对定位的`top`值。


```js
// item
{
  // 索引
  idx: 0,
  // 相对于container的定位top
  // 0: 0, 1: 30
  top: index * 30,
  // 先固定高度
  height: 30,
  // 给个背景颜色，区分块
  backgroundColor: generateHexColor(),
  title: `title 0`,
}
```

给`container`内的每个条目设置绝对定位，同时设置`top`。`container`内的所有子元素都脱硫了文档流，所以此时`container`的高度为`0`，为了让内容正常展示，给`container`添加高度`（10000 * 30）。具体代码可以查看[自然滚动-绝对定位](https://github.com/zhatongning/virtual-list/blob/master/01-b-auto-scroll-absolute.js)。

![auto-scroll-static](./assets/auto-scroll-static.png)

![auto-scroll-static](./assets/auto-scroll-absolute.png)

此时的展示效果跟由内容撑开时自然滚动完全一致。如上图，从`chrome`的任务管理器也能看出，*连续滚动时*的`cpu`和`gpu`消耗也比较接近。但是如果仔细点会发现，这里的`cpu`消耗有点高。[`cpu`数值的具体含义可查看这里](https://developer.chrome.com/docs/extensions/reference/processes/#type-Process)。

## 虚拟列表：减少渲染元素

上述的两种自然滚动时，都需要将内容全部渲染出来，大量的元素渲染导致资源浪费。尤其是在如今`spa`大行其道的年代，频繁的数据变动往往会导致页面重新渲染刷新，而长列表的存在会占用大量资源，从而降低渲染效率，出现页面卡顿等降低用户体验的情况。

如何可以减少要渲染的元素的数量呢？在以绝对定位的方式实现的自然滚动里，`container`内的元素都是以绝对定位的方式排列的，元素并不依赖于其上方元素（对比第一种靠内容撑开的方式）。而所能看到的`container`内的元素只是`box`视口内的元素，如果将视口外的其他元素都不渲染，那需要渲染的元素自然就是极少了。当滚动触发时，实时计算可见范围内需要展示的元素，然后将可视区域外的元素移除，同时渲染最新的视口内元素。 而这就是虚拟列表的核心。

## 虚拟列表的实现

上面说过，只渲染视口内的元素是虚拟列表的核心，而这里会涉及到两类重要信息的获取：

1. 可见范围内需要展示的元素。在滚动时，计算出可展示区域的开始和结束索引，然后将可视区域外的元素移除，同时渲染最新计算得到的视口内元素。
2. 内容容器`container`的高度。因为内容都是绝对定位，所以需要给`container`（视口容器是`box`）设置高度。

下面由易到难，针对不同场景介绍如何计算这两个信息。

### 固定高度

从最简单的固定高度开始。假设`container`内部元素的高度都是固定的（这里为30px）

#### `container`的高度

```js
  const totalHeight = totalCount * FixedHeight
```

#### 可见区域

那么很容易算出视口内可以展示的元素数量为

```js
  // ItemHeight = 30
  const visibleCount = Math.ceil(box.clientHeight / ItemHeight) + 1
```

而根据 `box` 的 `scrollTop` 可以计算得到可见区域的起始索引：

```js
  const startIndex = Math.max(Math.floor(offsetTop  / Height), 0)
```

根据可见数量以及起始索引可得到可见区域的索引范围为: `[startIndex, startIndex + visibleCount)`

完整`demo`代码可见[virtual-list](https://github.com/zhatongning/virtual-list/blob/master/02virtual-list-fixed-height.js)

此时再看下连续滚动时任务管理器的实时数据：

![virtual-list-fixed-height](./assets/virtual-list-fixed-height.png)

相比之前的自然滚动，此时可以看出`cpu`和`gpu`消耗明显下降，避免了资源浪费。


### 变化高度

在固定高度中，`container`内部的元素都是`30`的固定高度，这样的位置计算是简单的。下面将这个高度改成变化的。（这里的变化是指不同元素之间的高度是不同的，特定元素的高度是不变的）。

#### 计算`container`的高度


<img src="assets/dynamic-height.png" alt="idynamic-height.png" style="zoom:40%;" />

<br /> 

上图展示了，针对动态高度时，如何计算每个元素的位置的方法：`用上一个元素的top(索引0为0) + 上一个元素的高度(数据中提供) = 下一个元素的top`，这样就能依次算出所有元素的位置了。

这里可以大致捋一下计算顺序：

- 初次渲染时，`scrollTop` 为 `0`，从`index`为 `0` 开始，依次计算每个元素的`top` 。
- 当某个元素的`top`值大于 `box.clientHeight`时，停止计算，此元素为可展示区域的最后一个元素。将所有元素的高度以及`top`值缓存。
- 当滚动时，从缓存中获取离 `scrollTop` 最近的元素， 然后从该元素开始填充视口；如果元素数据不在缓存中，就根据已缓存的数据计算，同时重新加入缓存中。。。

动态高度的`demo`的代码在[这里](https://github.com/zhatongning/virtual-list/blob/master/03virtual-list-dynamic-height.js)。

### 动态高度之内容撑开

在正常业务场景中，`container`内的元素一般都是由内容撑开的。此时要怎们计算元素的`top`呢?

-  `index`为`0`的元素的`top`为`0`，创建`dom`然后将其挂载到`container`中，挂载之后，就可以通过`dom`获取此元素的高度`h0`

```js
const div = document.createElement('div')
container.appendChild(div)
/*div的高度即为*/ div.clientHeight;
```

- 那么`index`为`1`的元素的`top`即为 `0 + h0`，同时缓存索引`0`元素的信息`{ top: 0, height: h0 }`; 创建`dom`，挂载到`container`中，然后获取索引`1``dom`的的高度`h1`
- 然后可以计算`index`为`2`的元素的`top`为`索引`为`1`的`top` `+ h1`。
- 依次类推...
- 直到计算出的元素`top`大于`box.clientHeight`为止
- 当滚动之后，还是可以利用`二分 + 缓存`先计算出`startIndex`，然后通过上述类似的方法计算可视区域的所有元素

而这里因为缓存的数据是已排序（`top`递增）的，所以根据`scrollTop`计算`startIndex`是可以用二分搜索优化的。`demo`的代码可以查看[`这里`](https://github.com/zhatongning/virtual-list/blob/master/04virtual-list-height-get-from-dom.js)

### overscan + 快速滚动 优化

如果查看上述`demo`会发现，快速滚动可能会出现下方空白的情况。此时可以通过添加`overscan`（概念来源于[react-virtualized](https://github.com/bvaughn/react-virtualized)）。之前的可视范围的计算是元素正好铺满整个区域，为了让出现空白的概率降低可以在算好的可视区域内的元素后面再追加一些额外的元素（在`react-virtualized`源码中这个概念可能解决的问题跟这里不完全一样，但是有类似的效果。要了解更多，可以看[这里。](https://github.com/bvaughn/react-virtualized/blob/master/docs/overscanUsage.md)）。


还有一个问题可以优化。在计算起止位置时，都是从索引为`0`的元素开始计算的，只有计算出索引较小的元素的信息才能计算出索引较大的，并将其信息缓存。上面的这些虚拟列表在计算视口开始位置时，都是基于缓存，然后从`0`开始遍历找到离`scrollTop`值最近的元素。无论是朴素的迭代的方式还是基于二分搜索的查找都是只能找到有缓存的最大的索引。但是如果将滚动条拖拽至下方的某个区域，此时就会出现












