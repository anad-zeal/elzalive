<?php
header("Content-Type: application/json");

// 1. Get the folder name from the AJAX request
// $requestedFolder = isset($_GET["folder"]) ? "drip-series-paintings" : "";

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
$basePath = "images/";
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
    foreach ($files as $file) {
        [$width, $height] = getimagesize($file);

        // EXIF logic to get titles/descriptions
        $title = basename($file);
        $description = "";
        $exif = @exif_read_data($file);

        if ($exif) {
            if (!empty($exif["ImageDescription"])) {
                $description = $exif["ImageDescription"];
            }
            if (!empty($exif["DocumentName"])) {
                $title = $exif["DocumentName"];
            }
        }

        $imageData[] = [
            "path" => $file,
            "title" => $title,
            "description" => $description,
            "width" => $width,
            "height" => $height,
        ];
    }
}

echo json_encode($imageData);
?>
