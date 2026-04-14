# Team SouL Archive

Next.js 16 archive site for Team SouL covering legacy eras, roster history, tournament results, and the BGIS 2026 champions gallery.

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Set these in `.env.local`:

- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BLOB_READ_WRITE_TOKEN`

If the admin password was ever shared or committed previously, rotate it before deployment.

## Admin Console

- Route: `/admin_saynam`
- Focus: create upcoming tournaments, complete tournaments, and edit tournament details through UI forms

The admin UI no longer supports raw JSON row editing or runtime blob-mapping writes.

## Data Workflows

Apply the relational schema:

```bash
npm run db:apply-schema:supabase
```

Seed archive data into Supabase:

```bash
npm run db:migrate:supabase
```

Upload the BGMI champions gallery assets:

```bash
npm run upload:bgmi-assets
```

Upload the 4 era story lineup images:

```bash
npm run upload:era-story-images
```

## Notes

- Public tournament pages read from Supabase when configured.
- The era story scroll uses Blob-hosted 16:9 lineup images.
- Admin runtime persistence is Supabase + Blob only.
