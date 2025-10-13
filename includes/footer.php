<?php
// footer.php
?>
</main>
<footer class="site-footer">
    <p>&copy; <?= date("Y") ?> Elza • All rights reserved.</p>
</footer>

<!-- Reusable slideshow module -->
<script type="module">
import {
    initSlideshows
} from "/assets/js/script.js";
document.addEventListener("DOMContentLoaded", () => initSlideshows());

// If you later add SPA navigation, re-run initSlideshows after route changes:
window.addEventListener("hashchange", () => initSlideshows());
window.addEventListener("app:navigate", () => initSlideshows());
</script>
</body>

</html>