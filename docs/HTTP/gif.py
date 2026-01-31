import asyncio
import os
import glob
import subprocess
import shutil
from playwright.async_api import async_playwright

# 設定
PAGES_DIR = './pages'
TEMP_SCREENSHOTS_DIR = './temp_screenshots' # 一時スクリーンショット保存用ディレクトリ
VIEWPORT_WIDTH = 1200  # ブラウザのビューポート幅
VIEWPORT_HEIGHT = 800  # ブラウザのビューポート高さ
NUM_FRAMES = 5         # GIFを作成するためのスクリーンショット枚数
SCREENSHOT_INTERVAL_SECONDS = 0.2 # スクリーンショット間の待機時間 (秒)
GIF_FRAME_DELAY_HUNDREDTHS = 20 # GIFのアニメーション速度 (100分の1秒単位)。20で0.2秒/フレーム

async def create_gif_for_page(browser, html_file_path, output_gif_path):
    """
    指定されたHTMLファイルから複数枚のスクリーンショットを撮影し、GIFを作成します。
    """
    page = await browser.new_page(viewport={'width': VIEWPORT_WIDTH, 'height': VIEWPORT_HEIGHT})
    
    # ローカルファイルをブラウザで開くには 'file://' プロトコルと絶対パスが必要
    await page.goto(f"file://{os.path.abspath(html_file_path)}")

    # 一時スクリーンショット保存用ディレクトリを作成
    os.makedirs(TEMP_SCREENSHOTS_DIR, exist_ok=True)

    screenshot_paths = []
    print(f"  - Capturing {NUM_FRAMES} frames for {os.path.basename(html_file_path)}...")
    for i in range(NUM_FRAMES):
        temp_screenshot_path = os.path.join(TEMP_SCREENSHOTS_DIR, f"frame_{i:02d}.png")
        # ページ全体のスクリーンショットを撮影
        await page.screenshot(path=temp_screenshot_path, full_page=True)
        screenshot_paths.append(temp_screenshot_path)
        if i < NUM_FRAMES - 1: # 最後のフレームの後は待たない
            await asyncio.sleep(SCREENSHOT_INTERVAL_SECONDS) # 次のスクリーンショットまで待機

    await page.close()

    if not screenshot_paths:
        print(f"  Warning: No screenshots taken for {html_file_path}. Skipping GIF creation.")
        return

    # ImageMagickの 'convert' コマンドを使ってGIFを作成
    # Windows環境での 'convert' コマンドの競合を避けるため 'magick convert' を使用
    # -delay: 各フレームの表示時間 (100分の1秒)
    # -loop 0: 無限ループ
    command = [
        'magick', 'convert', # <-- ここを 'magick convert' に変更
        '-delay', str(GIF_FRAME_DELAY_HUNDREDTHS),
        '-loop', '0', 
        *screenshot_paths, # 全てのスクリーンショットファイル
        output_gif_path
    ]
    
    try:
        # サブプロセスとしてImageMagickを実行
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"  GIF created: {output_gif_path}")
    except FileNotFoundError:
        # 'magick' コマンドが見つからない場合のメッセージも修正
        print("\nError: ImageMagick 'magick' command not found.")
        print("Please ensure ImageMagick is installed and its 'magick' executable is accessible in your system's PATH.")
        print("  e.g., 'brew install imagemagick' (macOS), 'sudo apt-get install imagemagick' (Linux).")
        print("  For Windows, verify ImageMagick is installed and its folder (e.g., C:\\Program Files\\ImageMagick-7.X.X-Q16) is in PATH.")
    except subprocess.CalledProcessError as e:
        # UnicodeDecodeError を避けるため、エラーメッセージのデコード時に errors='replace' を使用
        error_output = e.stderr.decode(errors='replace') 
        print(f"  Error creating GIF for {html_file_path} (Exit Status {e.returncode}):")
        print(f"    Command: {' '.join(command)}")
        print(f"    Error output:\n{error_output.strip()}")
    except Exception as e:
        print(f"  An unexpected error occurred during GIF creation for {html_file_path}: {e}")
    finally:
        # 一時スクリーンショットを削除
        for path in screenshot_paths:
            if os.path.exists(path):
                os.remove(path)

async def main():
    if not os.path.exists(PAGES_DIR):
        print(f"Error: Directory '{PAGES_DIR}' not found.")
        print("Please run 'main.py' first to generate HTML pages.")
        return

    html_files = glob.glob(os.path.join(PAGES_DIR, '*.html'))
    if not html_files:
        print(f"No HTML files found in '{PAGES_DIR}'.")
        return

    print(f"Found {len(html_files)} HTML files to process in '{PAGES_DIR}'.")

    async with async_playwright() as p:
        browser = await p.chromium.launch() # Chromiumブラウザを起動
        print("Browser launched.")

        for html_file in html_files:
            base_name = os.path.basename(html_file) # ファイル名 (例: SuccessfulResponses-200.html)
            gif_name = base_name.replace('.html', '.gif') # GIFファイル名 (例: SuccessfulResponses-200.gif)
            output_gif_path = os.path.join(PAGES_DIR, gif_name) # GIFの出力パス

            # print(f"Processing '{html_file}'...") # 冗長になるのでコメントアウト
            await create_gif_for_page(browser, html_file, output_gif_path)
        
        await browser.close()
        print("Browser closed.")
    
    # 全ての処理が終わった後、一時スクリーンショットディレクトリを削除
    if os.path.exists(TEMP_SCREENSHOTS_DIR):
        try:
            shutil.rmtree(TEMP_SCREENSHOTS_DIR) # ディレクトリと内容を完全に削除
            print(f"Cleaned up temporary directory: {TEMP_SCREENSHOTS_DIR}")
        except OSError as e:
            print(f"Warning: Could not remove temporary directory {TEMP_SCREENSHOTS_DIR}: {e}")

if __name__ == "__main__":
    asyncio.run(main())