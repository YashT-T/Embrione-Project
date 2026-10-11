# Embrione: Meet The Team

A 3-page onboarding and moderation system for the Embrione club at PES University (RR campus), built for the Web Dev recruitment challenge.

**Live site:** https://yashwanth-embrione-task.vercel.app (update this if your URL is different)

## Pages

| Route       | What it does                                                                                                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/register` | Member form with a live preview card. The photo is converted to WebP in the browser, uploaded to Supabase Storage, and the profile is saved with `status: 'pending'`. Duplicate SRNs are rejected. |
| `/admin`    | Login-protected review desk. Shows Total / Pending / Approved counters and the pending members, with Approve, Reject and Delete buttons.                                                           |
| `/team`     | Public directory. Shows only `approved` members, with Domain and Position filters. 5 mock profiles are pre-seeded.                                                                                 |

## Tech stack

- React + Vite
- Tailwind CSS v4
- react-router-dom
- react-hot-toast
- Supabase (Postgres database + Storage)
- Vercel (deployment)

## Setup (run it locally)

1. Clone the repo and install packages:

   ```bash
   git clone <your-repo-url>
   cd <repo-folder>
   npm install
   ```

2. Create a Supabase project, then create a `.env` file in the project root (same folder as `package.json`):

   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   Use the **anon / public** key, never the `service_role` key.

3. In the Supabase SQL Editor, run this to create the table and policies:

   ```sql
   create table public.members (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     domain text not null,
     position text not null,
     srn text not null,
     email text not null,
     linkedin_url text,
     github_url text,
     branch text not null,
     semester integer not null,
     bio text,
     photo_url text not null,
     status text not null default 'pending', -- 'pending', 'approved', 'rejected'
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   alter table public.members enable row level security;
   create policy "Allow public insert" on public.members for insert with check (true);
   create policy "Allow public read" on public.members for select using (true);
   create policy "Allow admin updates" on public.members for update using (true);
   create policy "Allow admin deletes" on public.members for delete using (true);
   ```

4. Create a Storage bucket named `member-photos` and tick **Public bucket**. Then run:

   ```sql
   create policy "Allow public upload photos" on storage.objects for insert to public with check (bucket_id = 'member-photos');
   create policy "Allow public read photos" on storage.objects for select to public using (bucket_id = 'member-photos');
   update storage.buckets set public = true where id = 'member-photos';
   ```

5. (Optional) Add mock members: insert rows into `members` with `status = 'approved'`. Their photos live in `public/team/*.webp` and are referenced as `/team/<name>.webp`.

6. Start the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

## Admin login

- Username: `admin@embrione.pes.edu`
- Password: `EmbrioneAdmin@2026`

## Deployment

Deployed on Vercel. Add the two `VITE_` environment variables in Vercel under Project Settings > Environment Variables before deploying. `vercel.json` rewrites every route to `index.html` so refreshing `/admin` or `/team` works.

## Security note

The admin login is a client-side check against fixed credentials, and the Supabase row-level-security policies are fully open. This is acceptable for this challenge only. A real project would use Supabase Auth and stricter policies.

## AI assistance

This project was built with AI assistance (Claude) and was reviewed and understood by the author.
