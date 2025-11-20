<main id="main-content">
    <!-- The Title changes based on the menu click -->
    <h2 id="gallery-title">Select a gallery from the menu</h2>

    <!-- Wrapper for the slideshow -->
    <!-- The style="display:none" hides it until an image loads -->
    <div id="slideshow-wrapper" style="display:none;">

        <!-- PREVIOUS BUTTON -->
        <button id="prev-btn" class="nav-btn">&#10094;</button>

        <!-- IMAGE AREA -->
        <div id="slide-display">
            <img id="current-image" src="" alt="Gallery Image">
            <div id="caption-box">
                <h3 id="slide-title"></h3>
                <p id="slide-desc"></p>
            </div>
        </div>

        <!-- NEXT BUTTON -->
        <button id="next-btn" class="nav-btn">&#10095;</button>

    </div>
</main>
