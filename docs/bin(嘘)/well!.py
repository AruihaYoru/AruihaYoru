import os
from PIL import Image

def generate_favicons(input_path):
    if not os.path.exists(input_path):
        print(f"エラー: {input_path} が見つかりません。")
        return

    # 画像をオープン
    with Image.open(input_path) as img:
        # 1. 正方形にクロップ (中央合わせ)
        width, height = img.size
        min_side = min(width, height)
        left = (width - min_side) / 2
        top = (height - min_side) / 2
        right = (width + min_side) / 2
        bottom = (height + min_side) / 2
        img = img.crop((left, top, right, bottom))

        # 2. 48の倍数で最も近いサイズを計算
        # 例: 50pxなら48pxに、100pxなら96pxに
        target_size = round(min_side / 48) * 48
        if target_size == 0: target_size = 48 # 最低48px
        
        print(f"元のサイズ: {width}x{height} -> ターゲットサイズ: {target_size}x{target_size}")
        
        # リサイズ (高品質フィルター使用)
        img_resized = img.resize((target_size, target_size), Image.LANCZOS)

        # 3. 保存
        # PNG形式 (Google推奨)
        img_resized.save("favicon.png", "PNG")
        # ICO形式 (互換性用)
        img_resized.save("favicon.ico", format="ICO", sizes=[(target_size, target_size)])
        # Apple Touch Icon用 (180x180固定が一般的)
        apple_icon = img.resize((180, 180), Image.LANCZOS)
        apple_icon.save("apple-touch-icon.png", "PNG")

        print("完了しました: favicon.png, favicon.ico, apple-touch-icon.png を生成しました。")

# 実行 (ファイル名を自分の画像に合わせて変えてください)
generate_favicons("icon.jpg")