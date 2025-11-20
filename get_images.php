<?php

header("Content-Type: application/json");

// 1. Get the folder name from the AJAX request
$requestedFolder = isset($_GET["folder"]) ? $_GET["folder"] : "";

// 2. SECURITY: Prevent directory traversal
if (
    strpos($requestedFolder, "..") !== false ||
    strpos($requestedFolder, "/") !== false ||
    strpos($requestedFolder, "\\") !== false
) {
    echo json_encode(["error" => "Invalid folder name"]);
    exit();
}

// 3. Define base path to images
$basePath = "assets/images/";
$targetFolder = $basePath . $requestedFolder;

// 4. Check if directory exists
if (!is_dir($targetFolder) || empty($requestedFolder)) {
    echo json_encode(["error" => "Folder not found."]);
    exit();
}

$imageData = [];

// 5. Get files
$files = glob($targetFolder . "/*.{jpg,jpeg,png,gif}", GLOB_BRACE);

if ($files) {
    // FIX: Natural Sort (so img2.jpg comes before img10.jpg)
    natsort($files);

    foreach ($files as $file) {
        // Verify it's a file, not a directory
        if (!is_file($file)) {
            continue;
        }

        [$width, $height] = getimagesize($file);

        $title = basename($file);
        $description = "";

        // EXIF logic (Wrapped in checks to prevent server errors)
        if (function_exists('exif_read_data')) {
            // Suppress warnings with @ in case exif data is corrupt
            $exif = @exif_read_data($file);

            if ($exif) {
                // Check multiple common fields for description
                if (!empty($exif["ImageDescription"])) {
                    $description = $exif["ImageDescription"];
                } elseif (!empty($exif["Comments"])) {
                    $description = $exif["Comments"];
                }

                // Check multiple common fields for title
                if (!empty($exif["DocumentName"])) {
                    $title = $exif["DocumentName"];
                } elseif (!empty($exif["Title"])) {
                    $title = $exif["Title"];
                }
            }
        }

        $imageData[] = [
            "path" => $file,
            "title" => $title, // Clean up extension if desired: pathinfo($file, PATHINFO_FILENAME)
            "description" => $description,
            "width" => $width,
            "height" => $height,
        ];
    }
}

// Re-index array to ensure JSON comes out as an array [0,1,2] not object {"2":...}
echo json_encode(array_values($imageData));