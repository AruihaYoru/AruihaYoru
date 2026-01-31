import json
import os
import re

def main():
    # 1. HTMLテンプレートの読み込み
    try:
        with open('template.html', 'r', encoding='utf-8') as f:
            template_html = f.read()
    except FileNotFoundError:
        print("Error: template.html not found. Please make sure it's in the same directory.")
        return
    except Exception as e:
        print(f"Error reading template.html: {e}")
        return

    # 2. template.cssの読み込み
    template_css_content = ""
    try:
        with open('template.css', 'r', encoding='utf-8') as f:
            template_css_content = f.read()
        print("template.css loaded successfully.")
    except FileNotFoundError:
        print("Warning: template.css not found. No base CSS will be embedded.")
    except Exception as e:
        print(f"Error reading template.css: {e}")
        
    # 3. Blueprint.jsonの読み込み
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

    # 4. 出力ディレクトリの作成
    output_dir = './pages'
    os.makedirs(output_dir, exist_ok=True)
    print(f"Output directory '{output_dir}' ensured.")

    # 5. 各ステータスコード情報に基づいてHTMLファイルを生成
    for item in blueprint_data:
        try:
            number = item['number']
            category = item['category']
            reason_phrase = item['reason_phrase']
            description = item['description']
            
            # オプションフィールド
            # Blueprint.jsonのstylesは、template.cssの後に適用される
            item_styles = item.get('styles', '') 
            og_description = item.get('og_description', description) # og_descriptionがなければdescriptionを使用

            # ファイル名、OGP画像名に使用するためのサニタイズされた文字列
            # categoryはファイル名に使用するため、英数字以外を除去
            category_sanitized_for_filename = re.sub(r'[^a-zA-Z0-9]+', '', category)

            # image_filename は Blueprint.json にある場合はそれを使用し、ない場合は自動生成
            # 例: "100-continue.gif"
            default_image_filename = f"{number}-{reason_phrase.replace(' ', '-').lower()}.gif"
            image_filename = item.get('image', default_image_filename)

            # OGP/Twitter Cardの画像URLは絶対パス
            base_ogp_path = "https://aruihayoru.github.io/AruihaYoru/HTTP/"
            ogp_image_url = f"{base_ogp_path}{image_filename}"

            # OGP URLも出力ファイル名形式に合わせる
            ogp_url = f"{base_ogp_path}{category_sanitized_for_filename}-{number}.html"

            # プレースホルダの置換
            generated_html = template_html

            # タイトルとOGP/Twitterタイトル
            generated_html = generated_html.replace("HTTP Status Code: 000 PLACEHOLDER", f"HTTP Status Code: {number} {reason_phrase}")
            
            # OGP/Twitter Cardのメタデータ
            generated_html = generated_html.replace(
                'property="og:url" content="https://aruihayoru.github.io/AruihaYoru/HTTP/PLACEHOLDER-000.html"',
                f'property="og:url" content="{ogp_url}"'
            )
            generated_html = generated_html.replace(
                'property="og:image" content="https://aruihayoru.github.io/AruihaYoru/HTTP/PLACEHOLDER-000.gif"',
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
            
            # カスタムスタイル (template.cssの内容 + Blueprint.jsonのstyles)
            combined_styles = template_css_content
            if item_styles: # Blueprint.jsonのstylesが空でなければ追加
                if combined_styles: # template_css_contentも空でなければ間に改行を入れる
                    combined_styles += "\n\n/* Additional styles from Blueprint.json */\n"
                combined_styles += item_styles
            
            # <link rel="stylesheet" href="template.css"> を削除し、スタイルを直接埋め込む
            generated_html = re.sub(r'<link rel="stylesheet" href="template\.css">\n\s*', '', generated_html)
            generated_html = generated_html.replace("{{STYLES}}", combined_styles)

            # ページ本文のコンテンツ
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
                f'<span class="reason-phrase-glitch-text">{reason_phrase.upper()}</span>' # テンプレートの形式に合わせて大文字化
            )

            # 出力ファイル名
            output_filename = os.path.join(output_dir, f"{category_sanitized_for_filename}-{number}.html")

            # HTMLファイルの保存
            with open(output_filename, 'w', encoding='utf-8') as f:
                f.write(generated_html)

            print(f"Generated: {output_filename}")

        except KeyError as ke:
            print(f"Error: Missing key '{ke}' in item: {item}")
        except Exception as e:
            print(f"Error processing item {item.get('number', 'unknown')}: {e}")

if __name__ == "__main__":
    main()