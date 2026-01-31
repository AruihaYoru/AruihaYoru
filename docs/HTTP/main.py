import json
import os
import re

def main():
    try:
        with open('template.html', 'r', encoding='utf-8') as f:
            template_html = f.read()
    except Exception:
        return

    template_css_content = ""
    try:
        with open('template.css', 'r', encoding='utf-8') as f:
            template_css_content = f.read()
    except Exception:
        pass
        
    # blueprint.json または Blueprint.json を読み込む
    blueprint_path = 'blueprint.json'
    if not os.path.exists(blueprint_path):
        blueprint_path = 'Blueprint.json'

    try:
        with open(blueprint_path, 'r', encoding='utf-8') as f:
            blueprint_data = json.load(f)
    except Exception:
        return

    output_dir = './pages'
    os.makedirs(output_dir, exist_ok=True)

    for item in blueprint_data:
        try:
            number = item['number']
            category = item['category']
            reason_phrase = item['reason_phrase']
            description = item.get('description', '')
            item_styles = item.get('styles', '') 

            category_sanitized_for_filename = re.sub(r'[^a-zA-Z0-9]+', '', category)
            default_image_filename = f"{number}-{reason_phrase.replace(' ', '-').lower()}.gif"
            image_filename = item.get('image', default_image_filename)

            base_ogp_path = "https://aruihayoru.github.io/AruihaYoru/HTTP/pages/"
            ogp_image_url = f"{base_ogp_path}{image_filename}"
            ogp_url = f"{base_ogp_path}{category_sanitized_for_filename}-{number}.html"

            generated_html = template_html

            generated_html = generated_html.replace("HTTP Status Code: 000 PLACEHOLDER", f"HTTP Status Code: {number} {reason_phrase}")
            generated_html = generated_html.replace('property="og:title" content="HTTP Status Code: 000 PLACEHOLDER"', f'property="og:title" content="HTTP Status Code: {number} {reason_phrase}"')
            generated_html = generated_html.replace('name="twitter:title" content="HTTP Status Code: 000 PLACEHOLDER"', f'name="twitter:title" content="HTTP Status Code: {number} {reason_phrase}"')
            
            generated_html = generated_html.replace(
                'property="og:url" content="https://aruihayoru.github.io/AruihaYoru/HTTP/pages/PLACEHOLDER-000.html"',
                f'property="og:url" content="{ogp_url}"'
            )
            generated_html = generated_html.replace(
                'property="og:image" content="https://aruihayoru.github.io/AruihaYoru/HTTP/pages/PLACEHOLDER-000.gif"',
                f'property="og:image" content="{ogp_image_url}"'
            )
            generated_html = generated_html.replace(
                'name="twitter:image" content="PLACEHOLDER-000.gif"',
                f'name="twitter:image" content="{ogp_image_url}"'
            )
            
            # スタイルの置換
            combined_styles = template_css_content
            if item_styles:
                combined_styles += item_styles
            
            generated_html = re.sub(r'<link rel="stylesheet" href="template\.css">\n\s*', '', generated_html)
            generated_html = generated_html.replace("{{STYLES}}", combined_styles)

            # ボディ内テキストの置換
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

            generated_html = generated_html.replace(
                '<div id="description">このページは、まだ具体的なHTTPステータスコードが割り当てられていないプレースホルダーです</div>',
                f'<div id="description">{description}</div>'
            )

            output_filename = os.path.join(output_dir, f"{category_sanitized_for_filename}-{number}.html")

            with open(output_filename, 'w', encoding='utf-8') as f:
                f.write(generated_html)
            
            print(f"Generated: {output_filename}")

        except Exception:
            continue

if __name__ == "__main__":
    main()