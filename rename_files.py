import os

folder_path = "~Website_Projects/elzalive/assets/images/restoration-projects"

try:
    # Expand user path if needed
    folder_path = os.path.expanduser(folder_path)

    # Check if the folder exists
    if not os.path.isdir(folder_path):
        print(f"Folder not found: {folder_path}")
    else:
        for filename in os.listdir(folder_path):
            old_path = os.path.join(folder_path, filename)
            if os.path.isfile(old_path) and " " in filename:
                new_filename = filename.replace(" ", "-")
                new_path = os.path.join(folder_path, new_filename)
                try:
                    os.rename(old_path, new_path)
                    print(f"Renamed: {filename} → {new_filename}")
                except Exception as e:
                    print(f"Failed to rename {filename}: {e}")
except Exception as e:
    print(f"Error accessing folder: {e}")
