"""
Fix English Madhyam Mock Files — Strip Embedded HTML from Options

Root cause: The options[] and correct_option fields in testData contain
leftover scraped HTML (<input> radio buttons, <span> checkmarks) that
collide with the quiz engine's own radio inputs, breaking answer selection.

This script:
1. Finds the `const testData = {...};` JSON blob in each HTML file
2. Parses it, strips embedded HTML from options + correct_option
3. Writes the cleaned JSON back in-place
"""

import os
import re
import json
import sys

# Patterns to strip from option strings
# Matches: \n<input class="question_optionsN" name="..." type="radio" value="..."/>
INPUT_PATTERN = re.compile(
    r'\s*<input[^>]*class=\\"question_options\d+\\"[^>]*/>\s*',
    re.DOTALL
)

# Matches: \n<span class="checkmark radio_checkN"></span>
SPAN_PATTERN = re.compile(
    r'\s*<span[^>]*class=\\"checkmark\s+radio_check\d+\\"[^>]*>\s*</span>\s*',
    re.DOTALL
)

# Also handle variants without escaped quotes (in case of different encoding)
INPUT_PATTERN_UNESCAPED = re.compile(
    r'\s*<input[^>]*class="question_options\d+"[^>]*/>\s*',
    re.DOTALL
)

SPAN_PATTERN_UNESCAPED = re.compile(
    r'\s*<span[^>]*class="checkmark\s+radio_check\d+"[^>]*>\s*</span>\s*',
    re.DOTALL
)

# Match the testData JSON assignment in the HTML
TEST_DATA_PATTERN = re.compile(
    r'(const\s+testData\s*=\s*)(\{.*?\})\s*;',
    re.DOTALL
)


def clean_option_text(text):
    """Strip embedded HTML fragments from an option string."""
    cleaned = text
    # Strip input tags
    cleaned = INPUT_PATTERN.sub('', cleaned)
    cleaned = INPUT_PATTERN_UNESCAPED.sub('', cleaned)
    # Strip span checkmark tags  
    cleaned = SPAN_PATTERN.sub('', cleaned)
    cleaned = SPAN_PATTERN_UNESCAPED.sub('', cleaned)
    # Clean up any trailing/leading whitespace and newlines
    cleaned = cleaned.strip()
    # Remove trailing \n sequences
    cleaned = re.sub(r'\\n\s*$', '', cleaned).strip()
    return cleaned


def fix_file(filepath):
    """Fix a single HTML file by cleaning its testData options."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if file has the embedded HTML problem
    if 'question_options' not in content:
        return False, "No embedded HTML found"
    
    # Find the testData JSON blob
    match = TEST_DATA_PATTERN.search(content)
    if not match:
        return False, "No testData found"
    
    prefix = match.group(1)  # "const testData = "
    json_str = match.group(2)  # The JSON object
    
    # Parse the JSON
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        return False, f"JSON parse error: {e}"
    
    # Track if we actually changed anything
    changes = 0
    
    for question in data.get('questions', []):
        # Clean each option
        if 'options' in question:
            new_options = []
            for opt in question['options']:
                cleaned = clean_option_text(opt)
                if cleaned != opt:
                    changes += 1
                new_options.append(cleaned)
            question['options'] = new_options
        
        # Clean correct_option
        if 'correct_option' in question:
            cleaned = clean_option_text(question['correct_option'])
            if cleaned != question['correct_option']:
                changes += 1
            question['correct_option'] = cleaned
    
    if changes == 0:
        return False, "No changes needed"
    
    # Serialize back to JSON (compact, matching original style)
    new_json = json.dumps(data, ensure_ascii=False)
    
    # Replace in the HTML content
    new_assignment = f"{prefix}{new_json};"
    new_content = content[:match.start()] + new_assignment + content[match.end():]
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True, f"Fixed {changes} option fields"


def main():
    target_dir = os.path.join(
        'public', 'English Madhyam', 'Chapter Wise PYQS'
    )
    
    if not os.path.isdir(target_dir):
        print(f"ERROR: Directory not found: {target_dir}")
        sys.exit(1)
    
    html_files = sorted([
        f for f in os.listdir(target_dir) if f.endswith('.html')
    ])
    
    print(f"Found {len(html_files)} HTML files in {target_dir}")
    print("=" * 60)
    
    fixed = 0
    skipped = 0
    errors = 0
    
    for filename in html_files:
        filepath = os.path.join(target_dir, filename)
        try:
            success, message = fix_file(filepath)
            if success:
                fixed += 1
                print(f"  FIXED: {filename[:60]:<60} | {message}")
            else:
                skipped += 1
                # Only print skips that are unexpected
                if "No embedded HTML" not in message:
                    print(f"  SKIP:  {filename[:60]:<60} | {message}")
        except Exception as e:
            errors += 1
            print(f"  ERROR: {filename[:60]:<60} | {e}")
    
    print("=" * 60)
    print(f"DONE: {fixed} fixed, {skipped} skipped, {errors} errors out of {len(html_files)} total")


if __name__ == '__main__':
    main()
