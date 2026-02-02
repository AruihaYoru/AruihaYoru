import itertools

def generate_css():
    css_lines = []

    hex_values = ['0', '3', '6', '9', 'c', 'f']
    colors = [''.join(p) for p in itertools.product(hex_values, repeat=3)]

    for c in colors:
        full_hex = ''.join([char*2 for char in c])
        css_lines.append(f".color{full_hex}{{color:#{full_hex}}}")
        css_lines.append(f".bg-color{full_hex}{{background-color:#{full_hex}}}")

    sizes = {
        "width": ["px", "%", "vw"],
        "height": ["px", "%", "vh"],
        "margin": ["px", "%"],
        "padding": ["px", "%"]
    }

    for prop, units in sizes.items():
        for unit in units:
            limit = 1001 if unit == "px" else 101
            for val in range(limit):
                css_lines.append(f".{prop}{val}{unit}{{{prop}:{val}{unit}}}")

    for i in range(8, 101):
        css_lines.append(f".font-size{i}px{{font-size:{i}px}}")
        
    css_lines.append(".overflow-auto{overflow:auto}")
    css_lines.append(".overflow-hidden{overflow:hidden}")
    css_lines.append(".overflow-scroll{overflow:scroll}")
    css_lines.append(".overflow-x-hidden{overflow-x:hidden}")
    css_lines.append(".overflow-y-hidden{overflow-y:hidden}")

    for i in range(101):
        css_lines.append(f".opacity-{i}{{opacity:{i/100}}}")
    
    css_lines.append(".text-left{text-align:left}")
    css_lines.append(".text-center{text-align:center}")
    css_lines.append(".text-right{text-align:right}")
    css_lines.append(".text-justify{text-align:justify}")

    for i in range(1, 10):
        css_lines.append(f".font-weight-{i*100}{{font-weight:{i*100}}}")
        
    css_lines.append(".cursor-pointer{cursor:pointer}")
    css_lines.append(".cursor-default{cursor:default}")
    css_lines.append(".cursor-not-allowed{cursor:not-allowed}")
    css_lines.append(".cursor-wait{cursor:wait}")
    css_lines.append(".cursor-help{cursor:help}")
    
    css_lines.append(".pos-static{position:static}")
    css_lines.append(".pos-relative{position:relative}")
    css_lines.append(".pos-absolute{position:absolute}")
    css_lines.append(".pos-fixed{position:fixed}")
    css_lines.append(".pos-sticky{position:sticky}")

    for i in range(101):
        css_lines.append(f".z-{i}{{z-index:{i}}}")
        
    css_lines.append(".flex-row{flex-direction:row}")
    css_lines.append(".flex-row-reverse{flex-direction:row-reverse}")
    css_lines.append(".flex-col{flex-direction:column}")
    css_lines.append(".flex-col-reverse{flex-direction:column-reverse}")

    css_lines.append(".flex-wrap{flex-wrap:wrap}")
    css_lines.append(".flex-nowrap{flex-wrap:nowrap}")

    css_lines.append(".justify-start{justify-content:flex-start}")
    css_lines.append(".justify-end{justify-content:flex-end}")
    css_lines.append(".justify-center{justify-content:center}")
    css_lines.append(".justify-between{justify-content:space-between}")
    css_lines.append(".justify-around{justify-content:space-around}")
    css_lines.append(".justify-evenly{justify-content:space-evenly}")

    css_lines.append(".align-start{align-items:flex-start}")
    css_lines.append(".align-end{align-items:flex-end}")
    css_lines.append(".align-center{align-items:center}")
    css_lines.append(".align-baseline{align-items:baseline}")
    css_lines.append(".align-stretch{align-items:stretch}")

    return css_lines

all_styles = generate_css()
with open("wtfTailwind.css", "w") as f:
    f.write("\n".join(all_styles))

print(f"生成完了: {len(all_styles)} 行のスタイルを作成しました。")