import asyncio
import os
import json
import subprocess
import shutil
from playwright.async_api import async_playwright

PAGES_DIR = './pages'
TEMP_SCREENSHOTS_DIR = './temp_screenshots'
BLUEPRINT_PATH = 'blueprint.json'
VIEWPORT_WIDTH = 1200
VIEWPORT_HEIGHT = 800
NUM_FRAMES = 5
SCREENSHOT_INTERVAL_SECONDS = 0.1
GIF_FRAME_DELAY_HUNDREDTHS = 10
MAX_CONCURRENT_PAGES = 5

async def create_gif_for_page(semaphore, browser, html_file_path, output_gif_path):
    """
    並列実行数を制限しつつ、HTMLから透過・クロップ済みGIFを作成します。
    """
    async with semaphore:
        page = await browser.new_page(viewport={'width': VIEWPORT_WIDTH, 'height': VIEWPORT_HEIGHT})
        abs_path = os.path.abspath(html_file_path)
        await page.goto(f"file://{abs_path}")

        page_id = os.path.basename(html_file_path).replace('.', '_')
        page_temp_dir = os.path.join(TEMP_SCREENSHOTS_DIR, page_id)
        os.makedirs(page_temp_dir, exist_ok=True)

        screenshot_paths = []
        print(f"  - Capturing: {os.path.basename(html_file_path)}")
        
        for i in range(NUM_FRAMES):
            temp_path = os.path.join(page_temp_dir, f"frame_{i:02d}.png")
            await page.screenshot(path=temp_path)
            screenshot_paths.append(temp_path)
            if i < NUM_FRAMES - 1:
                await asyncio.sleep(SCREENSHOT_INTERVAL_SECONDS)

        await page.close()

        command = [
            'magick', 'convert',
            '-delay', str(GIF_FRAME_DELAY_HUNDREDTHS),
            '-loop', '0',
            *screenshot_paths,
            '-fill', 'none', 
            '-draw', 'color 0,0 floodfill',
            '-trim',
            '+repage',
            output_gif_path
        ]
        
        try:
            process = await asyncio.create_subprocess_exec(
                *command, stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )
            await process.communicate()
            print(f"  GIF created: {os.path.basename(output_gif_path)}")
        except Exception as e:
            print(f"  Error creating GIF for {html_file_path}: {e}")
        finally:
            if os.path.exists(page_temp_dir):
                shutil.rmtree(page_temp_dir)

async def main():
    if not os.path.exists(BLUEPRINT_PATH):
        print(f"Error: '{BLUEPRINT_PATH}' not found.")
        return
    
    with open(BLUEPRINT_PATH, 'r', encoding='utf-8') as f:
        blueprint_data = json.load(f)

    if not os.path.exists(PAGES_DIR):
        print(f"Error: Directory '{PAGES_DIR}' not found.")
        return

    if os.path.exists(TEMP_SCREENSHOTS_DIR):
        shutil.rmtree(TEMP_SCREENSHOTS_DIR)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_PAGES)
        
        tasks = []
        for item in blueprint_data:
            category = item.get('category', '')
            number = item.get('number', '')
            html_file_path = os.path.join(PAGES_DIR, f"{category}-{number}.html")
            gif_name = item.get('image')

            if gif_name and os.path.exists(html_file_path):
                output_gif_path = os.path.join(PAGES_DIR, gif_name)
                tasks.append(create_gif_for_page(semaphore, browser, html_file_path, output_gif_path))
            else:
                print(f"  Skip/Warning: {html_file_path} issue.")

        await asyncio.gather(*tasks)
        await browser.close()
    
    print("All processes completed.")

if __name__ == "__main__":
    asyncio.run(main())