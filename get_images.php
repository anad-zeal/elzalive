<?php

// The folder where your images are located.
// Make sure this path is correct relative to the location of this PHP script.
$imageFolder = 'images/';

// An array to hold the image data.
$imageData = [];

// Get all files from the image folder.
$files = glob($imageFolder . '*.{jpg,jpeg,png,gif}', GLOB_BRACE);

foreach ($files as $file) {
    // Get image dimensions.
    list($width, $height) = getimagesize($file);

    // Initialize title and description.
    $title = '';
    $description = '';

    // Attempt to read EXIF/IPTC metadata.
    // Note: This requires the exif extension to be enabled in your PHP configuration.
    $exif = @exif_read_data($file);

    if (!empty($exif['ImageDescription'])) {
        $description = $exif['ImageDescription'];
    }

    if (!empty($exif['DocumentName'])) {
        $title = $exif['DocumentName'];
    } else {
        // Fallback to using the filename as the title if no metadata is found.
        $title = basename($file);
    }

    // Add the image data to our array.
    $imageData[] = [
        'path' => $file,
        'title' => $title,
        'description' => $description,
        'width' => $width,
        'height' => $height
    ];
}

// Set the content type header to application/json.
header('Content-Type: application/json');

// Output the image data as a JSON object.
echo json_encode($imageData);