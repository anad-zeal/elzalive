<footer class="site-footer">
    <p>&copy; 2025 elzalive • All rights reserved.</p>
</footer>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slideshow .slide');
    const prevBtn = document.querySelector('.prev-arrow button');
    const nextBtn = document.querySelector('.next-arrow button');

    // Config
    const intervalTime = 5000; // 5 seconds between slides
    let slideInterval;
    let currentSlide = 0;

    // 1. Function to change slides
    const goToSlide = (index) => {
        // Remove active class from current slide
        if (slides[currentSlide]) {
            slides[currentSlide].classList.remove('active');
        }

        // Update index (handle wrapping)
        currentSlide = (index + slides.length) % slides.length;

        // Add active class to new slide
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

    // 2. Start Automation
    const startSlideInterval = () => {
        // Clear existing to prevent duplicates
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, intervalTime);
    };

    // 3. Stop Automation (when user interacts)
    const resetTimer = () => {
        clearInterval(slideInterval);
        startSlideInterval();
    };

    // 4. Event Listeners
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

    // 5. Initialization
    if (slides.length > 0) {
        // Check if you manually added "active" to a slide in HTML
        let startingIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));

        // If not found, default to 0 and add the class
        if (startingIndex === -1) {
            startingIndex = 0;
            slides[startingIndex].classList.add('active');
        }

        // Sync the counter
        currentSlide = startingIndex;

        // Start timer
        startSlideInterval();
    }
});
</script>

</body>

</html>
