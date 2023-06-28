function updateScrollbarWidth() {
	// Detect vertical scrollbar width and assign to css variable for sizing full viewport width elements
    // This fixes a bug where a horizontal scrollbar appears when scrollbars are set to "always" in Mac OS
    const documentWidth = document.documentElement.clientWidth;
    if (documentWidth <= 0) {
        return;
    }

    let scrollBarWidth = 0;

    // disable behaviour for Android
    if (!document.body.classList.contains("android")) {
        scrollBarWidth = window.innerWidth - documentWidth;
    }
    
    document.documentElement.style.setProperty('--scrollbar-width', scrollBarWidth + "px");
    document.documentElement.style.setProperty('--half-scrollbar-width', (scrollBarWidth / 2) + "px");
}

window.addEventListener("resize", updateScrollbarWidth);
window.addEventListener("load", updateScrollbarWidth);
