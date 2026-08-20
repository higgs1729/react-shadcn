# GameHub stats Worker

The Worker stores one hourly play bucket per game in Cloudflare D1 and exposes
the period totals consumed by the static GameHub page.

Create the database once, then put its ID in
`stats-worker/wrangler.jsonc` locally or in the
`GAMEHUB_STATS_D1_DATABASE_ID` GitHub Actions secret:

```sh
npx wrangler d1 create react-shadcn-gamehub-stats
npm -w apps/gamehub run stats:migrate:remote
npm -w apps/gamehub run stats:deploy
```

The deploy workflow expects these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `GAMEHUB_STATS_D1_DATABASE_ID`

After the first deployment, set the repository variable
`GAMEHUB_STATS_API_URL` to the Worker URL printed by Wrangler. The pages build
then enables live counts; without that variable the GameHub intentionally uses
the checked-in initial values.
