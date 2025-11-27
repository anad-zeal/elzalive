<footer class="site-footer">
    <p>&copy; 2025 elzalive • All rights reserved.</p>
</footer>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slideshow .slide');
    const prevBtn = document.querySelector('.prev-arrow button');
    const nextBtn = document.querySelector('.next-arrow button');

    // Config
    const intervalTime = 5000; // 5 seconds
    let slideInterval;
    let currentSlide = 0;

    // 1. Function to change slides
    const goToSlide = (index) => {
        if (slides[currentSlide]) {
            slides[currentSlide].classList.remove('active');
        }
        currentSlide = (index + slides.length) % slides.length;
        if (slides[currentSlide]) {
            slides[currentSlide].classList.add('active');
        }
    };

    const nextSlide = () => {
        goToSlide(currentSlide + 1);
    };
    const prevSlide = () => {
        goToSlide(currentSlide - 1);
    };

    // 2. Automation
    const startSlideInterval = () => {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, intervalTime);
    };

    const resetTimer = () => {
        clearInterval(slideInterval);
        startSlideInterval();
    };

    // 3. Listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetTimer();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetTimer();
        });
    }

    // 4. Initialization
    if (slides.length > 0) {
        let startingIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
        if (startingIndex === -1) {
            startingIndex = 0;
            slides[startingIndex].classList.add('active');
        }
        currentSlide = startingIndex;
        startSlideInterval();
    }
});
</script>

</body>

</html>
