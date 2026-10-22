# How to install the Login + Admin system

Copy the files from this `artifacts` folder into your existing Next.js frontend project:

```
artifacts/
├── app/
│   ├── page.tsx                          ← replace your existing page.tsx
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   ├── me/route.ts
│       │   └── add-admin/route.ts
│       └── save_positions/route.ts       ← replace existing
├── components/
│   └── SvgMap.tsx                        ← replace existing
├── lib/
│   └── auth.ts                           ← new
├── data/
│   └── users.json                        ← new (contains default admin)
└── HOW_TO_EDIT.md                        ← documentation for non-technical users
```

### Folder mapping (from your project screenshot)

Put files like this:

- `artifacts/app/page.tsx`                  → `frontend/app/page.tsx`
- `artifacts/app/api/...`                   → `frontend/app/api/...`
- `artifacts/components/SvgMap.tsx`         → `frontend/components/SvgMap.tsx`
- `artifacts/lib/auth.ts`                   → `frontend/lib/auth.ts`
- `artifacts/data/users.json`               → `frontend/data/users.json`
- `artifacts/HOW_TO_EDIT.md`                → project root or `frontend/`

### Default login

- **Username:** `admin`
- **Password:** `admin123`

Passwords are stored as SHA-256 hashes with a salt (`iitgn_salt_2024`).

### Important

- The `data/` folder must be writable by the Next.js server (for adding new admins).
- The `public/layouts/` folder must be writable (for saving box positions).
- After copying, restart the Next.js dev server (`npm run dev` or `yarn dev`).

No extra npm packages are required. Everything uses Node’s built-in `crypto` and `fs`.
