import os
import shutil

def organize_files():
    # Define mapping of keywords to subject folders
    mapping = {
        'English': ['ARTICLES', 'NOUN', 'PRONOUN', 'ADJECTIVE'],
        'Reasoning': ['Analogy', 'Odd One Out'],
        'Mathematics': ['Calculation', 'Mixture', 'Percentage', 'Ratio'],
        'History': ['Prehistoric', 'Sultan', 'Mughal', 'Sufism', 'Ancient', 'History', 'IVC', 'Vedic']
    }
    
    # Create directories if they do not exist
    for folder in mapping.keys():
        if not os.path.exists(folder):
            os.makedirs(folder)
            print(f"Created folder: {folder}")
            
    files = [f for f in os.listdir('.') if f.endswith('.html') and os.path.isfile(f)]
    
    moved_count = 0
    for filename in files:
        target_folder = None
        
        # Determine which folder this file belongs to
        for folder, keywords in mapping.items():
            if any(keyword.lower() in filename.lower() for keyword in keywords):
                target_folder = folder
                break
                
        # Default fallback folder if no keywords match
        if not target_folder:
            target_folder = 'History' # default fallback as many general history quizzes are present
            
        src_path = filename
        dest_path = os.path.join(target_folder, filename)
        
        try:
            # Read and update content stylesheet reference to ../css/style.css
            with open(src_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            updated_content = content.replace('href="css/style.css"', 'href="../css/style.css"')
            
            # Write to temporary file or directly overwrite after moving
            shutil.move(src_path, dest_path)
            
            with open(dest_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
                
            print(f"Moved {filename} -> {target_folder}/")
            moved_count += 1
        except Exception as e:
            print(f"Failed to process {filename}: {e}")
            
    print(f"Successfully organized {moved_count} files into subject folders.")

if __name__ == '__main__':
    organize_files()
