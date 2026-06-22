import os
import re

def process_html_files():
    dir_path = '.'
    files = [f for f in os.listdir(dir_path) if f.endswith('.html')]
    
    style_pattern = re.compile(r'<style>[\s\S]*?</style>', re.IGNORECASE)
    
    replacement_tags = (
        '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">\n'
        '    <link rel="stylesheet" href="css/style.css">'
    )
    
    print(f"Found {len(files)} HTML files to process.")
    
    success_count = 0
    for filename in files:
        file_path = os.path.join(dir_path, filename)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if style_pattern.search(content):
                new_content = style_pattern.sub(replacement_tags, content)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Processed: {filename}")
                success_count += 1
            else:
                print(f"No <style> block found in: {filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            
    print(f"Successfully processed {success_count}/{len(files)} files.")

if __name__ == '__main__':
    process_html_files()
