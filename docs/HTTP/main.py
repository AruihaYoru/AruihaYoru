import json
import os
import re

def main():
    try:
        with open('template.html', 'r', encoding='utf-8') as f:
            template_html = f.read()
    except FileNotFoundError:
        print("Error: template.html not found. Please make sure it's in the same directory.")
        return
    except Exception as e:
        print(f"Error reading template.html: {e}")
        return

    template_css_content = ""
    try:
        with open('template.css', 'r', encoding='utf-8') as f:
            template_css_content = f.read()
        print("template.css loaded successfully.")
    except FileNotFoundError:
        print("Warning: template.css not found. No base CSS will be embedded.")
    except Exception as e:
        print(f"Error reading template.css: {e}")
        
    try:
        with open('Blueprint.json', 'r', encoding='utf-8') as f:
            blueprint_data = json.load(f)
    except FileNotFoundError:
        print("Error: Blueprint.json not found. Please make sure it's in the same directory.")
        return
    except json.JSONDecodeError as e:
        print(f"Error decoding Blueprint.json: {e}")
        return
    except Exception as e:
        print(f"Error reading Blueprint.json: {e}")
        return

    output_dir = './pages'
    os.makedirs(output_dir, exist_ok=True)
    print(f"Output directory '{output_dir}' ensured.")

    for item in blueprint_data:
        try:
            number = item['number']
            category = item['category']
            reason_phrase = item['reason_phrase']
            description = item['description']
            
            item_styles = item.get('styles', '') 
            og_description = item.get('og_description', description)

            category_sanitized_for_filename = re.sub(r'[^a-zA-Z0-9]+', '', category)

            default_image_filename = f"{number}-{reason_phrase.replace(' ', '-').lower()}.gif"
            image_filename = item.get('image', default_image_filename)

            base_ogp_path = "https://aruihayoru.github.io/AruihaYoru/HTTP/pages/"
            ogp_image_url = f"{base_ogp_path}{image_filename}"

            ogp_url = f"{base_ogp_path}{category_sanitized_for_filename}-{number}.html"

            generated_html = template_html

            generated_html = generated_html.replace("HTTP Status Code: 000 PLACEHOLDER", f"HTTP Status Code: {number} {reason_phrase}")
            
            generated_html = generated_html.replace(
                'property="og:url" content="https://aruihayoru.github.io/AruihaYoru/HTTP/pages/PLACEHOLDER-000.html"',
                f'property="og:url" content="{ogp_url}"'
            )
            generated_html = generated_html.replace(
                'property="og:image" content="https://aruihayoru.github.io/AruihaYoru/HTTP/pages/PLACEHOLDER-000.gif"',
                f'property="og:image" content="{ogp_image_url}"'
            )
            generated_html = generated_html.replace(
                'property="og:description" content="This is a placeholder page for an HTTP status code. No specific code is defined here yet."',
                f'property="og:description" content="{og_description}"'
            )
            generated_html = generated_html.replace(
                'name="twitter:image" content="PLACEHOLDER-000.gif"',
                f'name="twitter:image" content="{ogp_image_url}"'
            )
            generated_html = generated_html.replace(
                'name="twitter:description" content="This is a placeholder page for an HTTP status code. No specific code is defined here yet."',
                f'name="twitter:description" content="{og_description}"'
            )
            
            combined_styles = template_css_content
            if item_styles:
                if combined_styles:
                    combined_styles += "\n\n/* Additional styles from Blueprint.json */\n"
                combined_styles += item_styles
            
            generated_html = re.sub(r'<link rel="stylesheet" href="template\.css">\n\s*', '', generated_html)
            generated_html = generated_html.replace("{{STYLES}}", combined_styles)

            generated_html = generated_html.replace(
                '<div id="description">このページは、まだ具体的なHTTPステータスコードが割り当てられていないプレースホルダーです</div>',
                f'<div id="description">{description}</div>'
            )
            generated_html = generated_html.replace(
                '<div class="category">PLACEHOLDER</div>',
                f'<div class="category">{category}</div>'
            )
            generated_html = generated_html.replace(
                '<div class="status-code">000</div>',
                f'<div class="status-code">{number}</div>'
            )
            generated_html = generated_html.replace(
                '<span class="reason-phrase-glitch-text">THERE IS NOTHING</span>',
                f'<span class="reason-phrase-glitch-text">{reason_phrase.upper()}</span>'
            )

            output_filename = os.path.join(output_dir, f"{category_sanitized_for_filename}-{number}.html")

            with open(output_filename, 'w', encoding='utf-8') as f:
                f.write(generated_html)

            print(f"Generated: {output_filename}")

        except KeyError as ke:
            print(f"Error: Missing key '{ke}' in item: {item}")
        except Exception as e:
            print(f"Error processing item {item.get('number', 'unknown')}: {e}")

if __name__ == "__main__":
    main()