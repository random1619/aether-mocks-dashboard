import os
import json
import re

root_dir = r"c:\Users\gagan\Downloads\Finally\public"
mocks = []

# Regex patterns to clean up filenames
pattern_prefix = re.compile(r'^@the_solvers_', re.IGNORECASE)
pattern_suffix = re.compile(r'_\d{4,6}$', re.IGNORECASE)  # e.g., _9855, _78055

def clean_name(name):
    # Strip extension
    name_no_ext, _ = os.path.splitext(name)
    # Strip prefix
    name_clean = pattern_prefix.sub('', name_no_ext)
    # Strip suffix
    name_clean = pattern_suffix.sub('', name_clean)
    # Clean underscores and hyphens
    name_clean = name_clean.replace('_', ' ').replace('-', ' ')
    # Clean double spaces
    name_clean = re.sub(r'\s+', ' ', name_clean).strip()
    return name_clean

def get_subject(category, name):
    cat_lower = category.lower()
    name_lower = name.lower()
    
    if any(k in cat_lower or k in name_lower for k in ['quant', 'math', 'calc', 'mixt', 'allig', 'ratio', 'percent', 'prop']):
        return 'Quant'
    elif any(k in cat_lower or k in name_lower for k in ['reasoning', 'analog', 'odd one']):
        return 'Reasoning'
    elif any(k in cat_lower or k in name_lower for k in ['english', 'vocab', 'grammar']):
        return 'English'
    elif any(k in cat_lower or k in name_lower for k in ['gs', 'gk', 'history', 'geography', 'polity', 'science', 'current', 'affairs', 'banking']):
        return 'General Studies'
    elif any(k in cat_lower or k in name_lower for k in ['full mock', 'pre mock', 'tier 1', 'tier 2', 'live mock']):
        return 'Full Mock'
    return 'General'

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.lower().endswith('.html') and file.lower() != 'index.html':
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, root_dir).replace('\\', '/')
            parts = rel_path.split('/')
            
            provider = parts[0]
            category = "/".join(parts[1:-1]) if len(parts) > 2 else (parts[1] if len(parts) > 1 else "General")
            
            cleaned = clean_name(file)
            subject = get_subject(category, cleaned)
            
            mocks.append({
                "path": rel_path,
                "name": cleaned,
                "provider": provider,
                "category": category,
                "subject": subject
            })

# Sort by provider, then category, then name
mocks.sort(key=lambda x: (x['provider'], x['category'], x['name']))

# Write as JSON-P or standard JS module variable for direct use in index.html
js_content = f"// Generated Mock Data\nconst MOCK_DATA = {json.dumps(mocks, indent=2)};"

output_file = os.path.join(root_dir, "mocks-data.js")
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Successfully generated {output_file} with {len(mocks)} mocks.")
