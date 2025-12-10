<?php
// 1. Load Header FIRST (Starts the html/body tags)
require __DIR__ . "/includes/header.php";

// 2. Load Menu SECOND (So it sits nicely inside the body)
require __DIR__ . "/includes/menu.php";

// 3. Content & Footer
require __DIR__ . "/includes/content.php";
require __DIR__ . "/includes/footer.php";
?>
