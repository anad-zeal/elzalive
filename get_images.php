<?php

// --- PRODUCTION-READY SCRIPT ---

// Turn OFF error reporting to the browser to ensure valid JSON output.
ini_set('display_errors', 0);
error_reporting(0);

// Set the header at the very beginning.
header('Content-Type: application/json');

// Use the __DIR__ constant for a reliable absolute path.
$baseImageDir = __DIR__ . '/images/';

// --- SECURITY & SETUP ---
$validFolders = array_map('basename', glob($baseImageDir . '*', GLOB_ONLYDIR));

$selectedFolder = null;
if (isset($_GET['folder']) && in_array($_GET['folder'], $validFolders)) {
    $selectedFolder = $_GET['folder'];
}

// --- DATA GATHERING ---
$imageData = [];

if ($selectedFolder) {
    $imageFolderPath = $baseImageDir . $selectedFolder . '/';

    // Check for both lowercase and uppercase file extensions.
    $files = glob($imageFolderPath . '*.{jpg,jpeg,png,gif,JPG,JPEG,PNG,GIF}', GLOB_BRACE);

    foreach ($files as $file) {
        $imageInfo = @getimagesize($file);
        if (!$imageInfo) {
            continue;
        }
        list($width, $height) = $imageInfo;

        $title = '';
        $description = '';
        $exif = @exif_read_data($file);

        if (!empty($exif['ImageDescription'])) {
            $description = $exif['ImageDescription'];
        }

        if (!empty($exif['DocumentName'])) {
            $title = $exif['DocumentName'];
        } else {
            $title = basename($file);
        }

        // Create a browser-friendly relative path.
        $relativePath = 'images/' . $selectedFolder . '/' . basename($file);

        $imageData[] = [
            'path' => $relativePath,
            'title' => $title,
            'description' => $description,
            'width' => $width,
            'height' => $height
        ];
    }
}

// --- FINAL OUTPUT ---
echo json_encode($imageData);
