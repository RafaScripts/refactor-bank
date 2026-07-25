import os
import re

file_path = "app/dashboard/crypto/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# Import CurrencyInput
if "CurrencyInput" not in content:
    content = content.replace("import { Input } from '@/components/ui/input'", "import { Input } from '@/components/ui/input'\nimport { CurrencyInput } from '@/components/ui/currency-input'")

# Change useState from useState('') to useState<number | string>('') for buyAmountBRL
content = re.sub(r'const \[buyAmountBRL, setBuyAmountBRL\] = useState\(\'\'\)', r'const [buyAmountBRL, setBuyAmountBRL] = useState<number | string>(\'\')', content)

# Change <Input type="number"... to <CurrencyInput ... for buyAmountBRL
input_regex = r'<Input\s+id="buyAmount"\s+type="number"\s+step="0\.01"\s+min="10"\s*(max=\{[^}]+\})?\s*value=\{buyAmountBRL\}\s+onChange=\{\(e\) => setBuyAmountBRL\(e\.target\.value\)\}'

def repl_input(match):
    max_str = match.group(1)
    max_attr = f"\n                      {max_str}" if max_str else ""
    return f'<CurrencyInput\n                      id="buyAmount"{max_attr}\n                      value={{buyAmountBRL}}\n                      onValueChange={{setBuyAmountBRL}}'

content = re.sub(input_regex, repl_input, content)

# Remove parseFloat
content = re.sub(r'parseFloat\(buyAmountBRL\)', r'Number(buyAmountBRL)', content)

# write back
with open(file_path, 'w') as f:
    f.write(content)

print(f"Processed {file_path}")
