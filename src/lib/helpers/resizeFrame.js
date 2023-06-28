// trigger iframe resize when loading atom in article template
setTimeout(() => {
	if (window.resize) {  
	  const html = document.querySelector('html')
	  const body = document.querySelector('body')
	
	  html.style.overflow = 'hidden'
	  html.style.margin = '0px'
	  html.style.padding = '0px'
	
	  body.style.overflow = 'hidden'
	  body.style.margin = '0px'
	  body.style.padding = '0px'
	
	  window.resize()
	}
}, 100);