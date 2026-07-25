import os
import re

files_to_process = [
    "app/dashboard/cashin/page.tsx",
    "app/dashboard/cashout/page.tsx",
    "app/dashboard/pix/page.tsx"
]

for file_path in files_to_process:
    with open(file_path, 'r') as f:
        content = f.read()

    # Import CurrencyInput
    if "CurrencyInput" not in content:
        content = content.replace("import { Input } from '@/components/ui/input'", "import { Input } from '@/components/ui/input'\nimport { CurrencyInput } from '@/components/ui/currency-input'")

    # Change useState from useState('') to useState<number | string>('') for amount fields
    content = re.sub(r'const \[([a-zA-Z]+Amount), set([a-zA-Z]+Amount)\] = useState\((.*?)\)', r'const [\1, set\2] = useState<number | string>(\3)', content)

    # Change <Input type="number"... to <CurrencyInput ...
    content = re.sub(r'<Input\s+id="([a-zA-Z]+Amount)"\s+type="number"\s+step="0\.01"\s+min="0\.01"\s+max=\{balance\}\s+value=\{([a-zA-Z]+Amount)\}\s+onChange=\{\(e\) => set([a-zA-Z]+Amount)\(e\.target\.value\)\}',
                     r'<CurrencyInput\n                      id="\1"\n                      value={\2}\n                      onValueChange={set\3}', content)
    
    content = re.sub(r'<Input\s+id="([a-zA-Z]+Amount)"\s+type="number"\s+step="0\.01"\s+min="0\.01"\s+value=\{([a-zA-Z]+Amount)\}\s+onChange=\{\(e\) => set([a-zA-Z]+Amount)\(e\.target\.value\)\}',
                     r'<CurrencyInput\n                        id="\1"\n                        value={\2}\n                        onValueChange={set\3}', content)

    # In cashout, sometimes the ID is not there or the spacing is different. Let's do a more generic regex for the Input tag
    
    # Actually, a simpler regex to replace the specific block:
    # <Input id="pixAmount" type="number" step="0.01" min="0.01" value={pixAmount} onChange={(e) => setPixAmount(e.target.value)}
    input_regex = r'<Input\s+id="([^"]+Amount)"\s+type="number"\s+step="0\.01"\s+min="0\.01"\s*(max=\{[^}]+\})?\s*value=\{([^}]+)\}\s+onChange=\{\(e\) => set[a-zA-Z]+\(e\.target\.value\)\}'
    
    def repl_input(match):
        id_str = match.group(1)
        max_str = match.group(2)
        val_str = match.group(3)
        setter = "set" + val_str[0].upper() + val_str[1:]
        max_attr = f"\n                        {max_str}" if max_str else ""
        return f'<CurrencyInput\n                        id="{id_str}"{max_attr}\n                        value={{{val_str}}}\n                        onValueChange={{{setter}}}'
    
    content = re.sub(input_regex, repl_input, content)

    # Replace Math.round(parseFloat(xxxAmount) * 100) -> Number(xxxAmount)
    content = re.sub(r'Math\.round\(parseFloat\(([a-zA-Z]+Amount)\)\s*\*\s*100\)', r'Number(\1)', content)
    
    # Replace Math.round(amount * 100) -> Number(amount)
    content = re.sub(r'Math\.round\(([a-zA-Z]+Amount)\s*\*\s*100\)', r'Number(\1)', content)
    # in cashout/page.tsx: Math.round(amount * 100)
    content = re.sub(r'Math\.round\(amount\s*\*\s*100\)', r'Number(amount)', content)

    # write back
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"Processed {file_path}")
