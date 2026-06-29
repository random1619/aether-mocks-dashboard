import os
import sys

def clean_duplicate_widgets(root_dir):
    print(f"Scanning directory: {root_dir}")
    print("=" * 60)
    
    html_files_count = 0
    fixed_files_count = 0
    skipped_files_count = 0
    error_files_count = 0
    
    widget_marker = "<!-- Fullscreen Widget Inject -->"
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if not file.endswith('.html'):
                continue
            
            html_files_count += 1
            filepath = os.path.join(root, file)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                occurrences = content.count(widget_marker)
                
                if occurrences < 2:
                    skipped_files_count += 1
                    continue
                
                # We have 2 or more occurrences. We need to remove the first one.
                start_idx = content.find(widget_marker)
                if start_idx == -1:
                    skipped_files_count += 1
                    continue
                
                # Find the next closing </script> tag after the start index
                end_tag = "</script>"
                end_idx = content.find(end_tag, start_idx)
                
                if end_idx == -1:
                    print(f"  WARNING: Found marker but no closing </script> in {filepath}")
                    error_files_count += 1
                    continue
                
                end_idx += len(end_tag)
                
                # Slice out the duplicate widget
                new_content = content[:start_idx] + content[end_idx:]
                
                # Verify that we now have 1 less occurrence
                new_occurrences = new_content.count(widget_marker)
                if new_occurrences != occurrences - 1:
                    print(f"  ERROR: Slicing failed to correctly reduce occurrences in {filepath}")
                    error_files_count += 1
                    continue
                
                # Write back the cleaned content
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                fixed_files_count += 1
                rel_path = os.path.relpath(filepath, root_dir)
                print(f"  FIXED: {rel_path} (reduced occurrences from {occurrences} to {new_occurrences})")
                
            except Exception as e:
                print(f"  ERROR processing {filepath}: {e}")
                error_files_count += 1
                
    print("=" * 60)
    print(f"Total HTML files analyzed: {html_files_count}")
    print(f"Files successfully fixed : {fixed_files_count}")
    print(f"Files skipped            : {skipped_files_count}")
    print(f"Files with errors/warns  : {error_files_count}")

if __name__ == "__main__":
    target_path = os.path.join(os.getcwd(), 'public')
    clean_duplicate_widgets(target_path)
