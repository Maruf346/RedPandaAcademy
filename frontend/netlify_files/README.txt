RED PANDA ACADEMY — NETLIFY DEPLOY

1. Go to app.netlify.com → Add new site → Deploy manually
   → drag this WHOLE FOLDER in (not just index.html).
2. The app works immediately: Learn, Drills, Quizzes, Ranks.
3. To turn on the Panda Bot + Grade My Call (AI):
   - Site configuration → Environment variables → Add:
       Key:   ANTHROPIC_API_KEY
       Value: your API key from console.anthropic.com
   - Redeploy the site once after adding the key.
4. Progress: reps save/restore with their progress code (Home screen).
   Real accounts + team dashboard = Phase 2 (see the master prompt doc).

ADDING DOCUMENTS TO THE FIELD KIT:
1. Drop the PDF into the docs/ folder of this package.
2. Add one line for it in docs/manifest.json (name, file, desc).
3. Re-deploy by dragging the zip/folder onto Netlify's Deploys page.
(The Home Value Report isn't included yet — drop HO_HomeValueReport.pdf
into docs/ and add its manifest line, or send it to Claude to bundle.)
