<?php
// header.php
$page_title = $page_title ?? "aepaints";
$active_page = $active_page ?? "home";
?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?= htmlspecialchars($page_title, ENT_QUOTES, "UTF-8") ?></title>
    <!-- Standard favicon -->
    <link rel="icon" href="/favicons/favicon.ico" type="image/x-icon">

    <!-- PNG fallback -->
    <link rel="icon" href="/favicons/favicon.png" type="image/png">

    <!-- SVG for modern browsers -->
    <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml">

    <!-- Apple touch icon -->
    <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png">
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Bonheur+Royale&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Poiret+One&family=Spectral:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
        rel="stylesheet">

    <link rel="stylesheet" href="/assets/css/style.css" />
</head>

<body data-page="<?= htmlspecialchars($active_page, ENT_QUOTES, "UTF-8") ?>" <header class="site-header">
    <div class="top-grid">
        <div class="left">
            <h3 class="title">&nbsp;</h1>
        </div>
        <div class="mid">
            <a href="/">HOME</a>
            <a href="/biography.php">BIOGRAPHY</a>
            <a href="/contact.php">CONTACT</a>
        </div>
        <div id="gallery" class="right">&nbsp;</div>
    </div>
    </header>