import os

def delete_migration_files(root_dir):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if os.path.basename(dirpath) == "migrations":
            for file in filenames:
                if file.endswith(".py") and file != "__init__.py":
                    file_path = os.path.join(dirpath, file)
                    os.remove(file_path)

delete_migration_files("./backend")