import os
import re

file_path = "components/dashboard/sidebar.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# I want to add more icons to lucide-react import
content = content.replace("Settings,", "Settings,\n  Shield,\n  Building2,\n  Activity,\n  Database,")

# Now find the admin links block
admin_links = """
            <Link
              href="/dashboard/admin"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard/admin'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Shield className="w-5 h-5" />
              Painel Geral
            </Link>
            <Link
              href="/dashboard/admin/users"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard/admin/users'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Users className="w-5 h-5" />
              Usuários
            </Link>
            <Link
              href="/dashboard/admin/accounts"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard/admin/accounts'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Building2 className="w-5 h-5" />
              Contas
            </Link>
            <Link
              href="/dashboard/admin/statements"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard/admin/statements'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Activity className="w-5 h-5" />
              Movimentações
            </Link>
            <Link
              href="/dashboard/admin/virtual-accounts"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard/admin/virtual-accounts'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Database className="w-5 h-5" />
              Contas Virtuais
            </Link>
"""

old_admin_link_regex = r"""<Link\s+href="/dashboard/admin"\s+onClick=\{\(\) => setMobileOpen\(false\)\}\s+className=\{cn\(\s+'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',\s+pathname === '/dashboard/admin'\s+\?\s+'bg-primary text-primary-foreground'\s+:\s+'text-muted-foreground hover:text-foreground hover:bg-accent'\s+\)\}\s+>\s+<Users className="w-5 h-5" />\s+Painel Admin\s+</Link>"""

content = re.sub(old_admin_link_regex, admin_links.strip(), content)

with open(file_path, 'w') as f:
    f.write(content)

print(f"Patched {file_path}")
