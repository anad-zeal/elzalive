<?php
$page_title = "Artworks | aepaints";
$active_page = "artworks";
require __DIR__ . "/includes/header.php";
require __DIR__ . "/includes/hero.php";
?>

<main id="main" class="page-content-wrapper">
    <section class="body-paragraphs" aria-labelledby="artworks-page-heading">
        <h2 id="artworks-heading" class="visually-hidden">Artworks</h2>

        <p><a href="/black-white.php" class="dropcap" data-gallery="black-and-white"
                aria-label="Go to the Black and White Gallery">B</a>lack and White Gallery —
            It is a long established fact that a reader will be distracted by the readable content of a page when
            looking at
            its layout.
            The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to
            using
            “Content here, content here”, making it look like readable English.
        </p>

        <p><a href="/decorative-painting.php" class="dropcap" data-gallery="decorative"
                ria-label="Go to Decorative Painting">D</a>ecorative Painting —
            It is a long established fact that a reader will be distracted by the readable content of a page when
            looking at
            its layout.
            The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to
            using
            “Content here, content here”, making it look like readable English.
        </p>

        <p>
            <a href="/artworks.php?showSlideshow=true" class="dropcap" data-gallery="artworks"
                aria-label="Go to Artworks">A</a>
            rtworks — It is a long established fact that a reader will be distracted...
               
        </p>

    </section>
    <?php require __DIR__ . "/includes/footer.php"; ?>>