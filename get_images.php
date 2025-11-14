<?php

// --- PRODUCTION-READY SCRIPT ---

// CRITICAL: Turn OFF error reporting to the browser.
// This ensures that only our intended JSON is ever sent as a response.
// Errors will still be logged to the server's error log file for debugging.
ini_set('display_errors', 0);
error_reporting(0);

// Set the correct header to tell the browser it's receiving JSON.
// We do this at the very beginning.
header('Content-Type: application/json');

// Use the robust __DIR__ pathing method for reliability.
$baseImageDir = __DIR__ . '/images/';

// --- SECURITY & SETUP ---
// Get a list of all valid, existing subdirectories.
$validFolders = array_map('basename', glob($baseImageDir . '*', GLOB_ONLYDIR));

// Check if a valid folder was requested.
$selectedFolder = null;
if (isset($_GET['folder']) && in_array($_GET['folder'], $validFolders)) {
    $selectedFolder = $_GET['folder'];
}

// --- DATA GATHERING ---
$imageData = [];

if ($selectedFolder) {
    $imageFolderPath = $baseImageDir . $selectedFolder . '/';

    // Check for both lowercase and uppercase file extensions.
    $files = glob($imageFolderPath . '*.{jpg,jpeg,png,gif,JPG,JPEG}', GLOB_BRACE);

    foreach ($files as $file) {
        $imageInfo = @getimagesize($file);
        if (!$imageInfo) {
            continue;
        }
        list($width, $height) = $imageInfo;

        $title = '';
        $description = '';

        // Use error suppression (@) because some images may not have EXIF data.
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
// Encode the final array into JSON and send it.
// If no folder was selected or no images were found, this will correctly send `[]`.
echo json_encode($imageData);