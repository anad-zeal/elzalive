<?php

$page = $_GET["page"] ?? "home";

$map = [
    "home" => "home.php",
    "artworks" => "artworks.php",
    "decorative" => "decorative.php",
    "restoration" => "restoration.php",
];

$file = $map[$page] ?? "home.php";
require __DIR__ . "/$file";
