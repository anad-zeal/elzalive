<?php

// get_images.php

header('Content-Type: application/json');

// 1. Get the folder name from the AJAX request, default to empty
$requestedFolder = isset($_GET['folder']) ? $_GET['folder'] : '';

// 2. SECURITY: Prevent directory traversal (trying to go up directories with ../)
if (strpos($requestedFolder, '..') !== false || strpos($requestedFolder, '/') !== false || strpos($requestedFolder, '\\') !== false) {
    echo json_encode(['error' => 'Invalid folder name']);
    exit;
}

// 3. Define base path (Based on your tree, images are in root/images/)
$basePath = 'images/';
$targetFolder = $basePath . $requestedFolder;

// 4. Check if directory exists
if (!is_dir($targetFolder) || empty($requestedFolder)) {
    echo json_encode(['error' => 'Folder not found: ' . $targetFolder]);
    exit;
}

$imageData = [];

// 5. Get files
$files = glob($targetFolder . '/*.{jpg,jpeg,png,gif}', GLOB_BRACE);

if ($files) {
    foreach ($files as $file) {
        list($width, $height) = getimagesize($file);

        // EXIF logic (kept from your original code)
        $title = basename($file);
        $description = '';
        $exif = @exif_read_data($file);

        if ($exif) {
            if (!empty($exif['ImageDescription'])) {
                $description = $exif['ImageDescription'];
            }
            if (!empty($exif['DocumentName'])) {
                $title = $exif['DocumentName'];
            }
        }

        $imageData[] = [
            // Send back the path relative to the website root
            'path' => $file,
            'title' => $title,
            'description' => $description,
            'width' => $width,
            'height' => $height
        ];
    }
}

echo json_encode($imageData);
