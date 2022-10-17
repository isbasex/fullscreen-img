## Fullscreen Image

demo video：https://cln.sh/nsJGlxmFgT0vdFpzXWZX

## Usages

```javascript
import { previewImageInFullscreen } from 'fullscreen-img'

document.body.addEventListener('click', (evt) => {
  if (evt.target.nodeName === 'IMG') {
    previewImageInFullscreen(target)
  }
})
```

## Options

```javascript
document.body.addEventListener('click', (evt) => {
  if (evt.target.nodeName === 'IMG') {
    previewImageInFullscreen(target, {
      maskBackgroundColor: '#fff'
    })
  }
})
```
