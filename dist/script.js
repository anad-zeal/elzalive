window.addEventListener("load",() => {
	let ss = new Slideshow(".ss");
});

class Slideshow {
	// el: slideshow element
	constructor(el) {
		let parent = document.querySelector(el),
			btns = parent.querySelectorAll(".ss__btn");
		
		this.current = 0;
		this.imgs = parent.querySelectorAll(".ss__entry");
	
		// add listeners to buttons
		btns[0].addEventListener("click",() => { this.prev(); });
		btns[1].addEventListener("click",() => { this.next(); });

		this.updateEntry();
	}
	// show which entry should be active
	updateEntry() {
		let activeClass = "ss__entry--active";
		this.imgs.forEach(img => {
			img.classList.remove(activeClass);
		});
		this.imgs[this.current].classList.add(activeClass);
	}
	// go to previous entry
	prev() {
		--this.current;
		if (this.current < 0)
			this.current = this.imgs.length - 1;
		this.updateEntry();
	}
	// go to next entry
	next() {
		++this.current;
		if (this.current == this.imgs.length)
			this.current = 0;
		this.updateEntry();
	}
}