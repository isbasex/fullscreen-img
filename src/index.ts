export function previewImageInFullscreen(
  imgEl: HTMLImageElement,
  options = {
    maskBackgroundColor: 'rgba(0,0,0,0.8)',
  },
) {
  const KEY_PREVIEWED = 'data-previewed-in-fullscreen'
  if (imgEl.getAttribute(KEY_PREVIEWED)) {
    return
  }

  const imgIndex = 999
  const prevBodyOverflow = document.body.style.overflow
  const prevHtmlOverflow = document.documentElement.style.overflow

  const imageWidth = imgEl.width
  const imageHeight = imgEl.height
  const maxWidth = window.innerWidth
  const maxHeight = window.innerHeight

  const widthRatio = maxWidth / imageWidth
  const heightRatio = maxHeight / imageHeight

  let ratio = widthRatio

  if (widthRatio * imageHeight > maxHeight) {
    ratio = heightRatio
  }

  // 放大后的宽高
  const scaledWidth = imageWidth * ratio
  const scaledHeight = imageHeight * ratio

  // 图片当前坐标（放大和偏移之前）
  const imgRect = imgEl.getBoundingClientRect()

  // 放大后的坐标
  const scaledX = imgRect.left - (scaledWidth - imageWidth) / 2
  const scaledY = imgRect.top - (scaledHeight - imageHeight) / 2

  // 居中的坐标
  const centerX = maxWidth / 2 - scaledWidth / 2
  const centerY = maxHeight / 2 - scaledHeight / 2

  // 最终偏移量（图片要垂直水平居中）
  const offsetX = centerX - scaledX
  const offsetY = centerY - scaledY

  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'

  const mask = document.createElement('div')
  mask.style.position = 'fixed'
  mask.style.left = '0'
  mask.style.top = '0'
  mask.style.right = '0'
  mask.style.bottom = '0'
  mask.style.backgroundColor = options.maskBackgroundColor
  mask.style.zIndex = String(imgIndex - 1)
  mask.style.opacity = '0'
  mask.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0, 1) 0s'
  document.body.appendChild(mask)
  window.requestAnimationFrame(() => {
    // 在下一帧再触发动画，避免 transitionend 事件不触发
    mask.style.opacity = '1'
    mask.style.cursor = 'zoom-out'
    mask.ontransitionend = () => {
      mask.ontransitionend = null
      mask.onclick = close
    }
  })

  // img 标签的内联样式
  const inlineStyle = imgEl.style
  // 这里不能直接 prevStyle = { ...imgEl.style }；否则碰上没有内联样式的标签会得到空对象，影响后面恢复样式
  const prevStyle: Partial<CSSStyleDeclaration> = {
    // 如果当前内联样式没有设置对应的属性，会得到空字符
    transition: inlineStyle.transition,
    position: inlineStyle.position,
    zIndex: inlineStyle.zIndex,
    cursor: inlineStyle.cursor,
    transform: inlineStyle.transform,
  }
  imgEl.setAttribute(KEY_PREVIEWED, '1')
  imgEl.style.transition = `transform 0.4s cubic-bezier(0.4, 0, 0, 1) 0s`
  imgEl.style.position = 'relative'
  imgEl.style.cursor = 'zoom-out'
  imgEl.style.zIndex = String(imgIndex)
  imgEl.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0px) scale(${ratio}, ${ratio})`

  imgEl.ontransitionend = () => {
    imgEl.ontransitionend = null
    imgEl.addEventListener('click', close)
    window.addEventListener('keydown', onPressEsc)
  }

  function close() {
    mask.style.opacity = '0'
    mask.ontransitionend = () => {
      mask.ontransitionend = null
      document.body.removeChild(mask)
    }

    imgEl.style.cursor = prevStyle.cursor || ''
    imgEl.style.transform = 'none'
    imgEl.ontransitionend = () => {
      imgEl.ontransitionend = null
      // 直接给 imgEl.style.xxx 赋值 undefined 的话没有任何效果，赋值空字符才能删掉此属性
      imgEl.style.transition = prevStyle.transition || ''
      imgEl.style.position = prevStyle.position || ''
      imgEl.style.zIndex = prevStyle.zIndex || ''
      imgEl.style.transform = prevStyle.transform || ''
      imgEl.removeAttribute(KEY_PREVIEWED)
    }

    document.body.style.overflow = prevBodyOverflow
    document.documentElement.style.overflow = prevHtmlOverflow

    imgEl.removeEventListener('click', close)
    window.removeEventListener('keydown', onPressEsc)
  }

  function onPressEsc(evt: KeyboardEvent) {
    if (evt.key === 'Escape' || evt.keyCode === 27) {
      window.removeEventListener('keydown', onPressEsc)
      close()
    }
  }
}
