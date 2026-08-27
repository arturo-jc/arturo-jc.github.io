# personal-website

Jekyll portfolio and blog, served by GitHub Pages at <https://arturojc.dev/>.

## How the site is served

- Repo `arturo-jc/arturo-jc.github.io`. The name is load-bearing — see footguns.
- Pages builds Jekyll from `master`, path `/`. HTTPS enforced.
- Custom domain `arturojc.dev`, held in the `CNAME` file at the repo root.
- `https://arturo-jc.github.io/` and `www.arturojc.dev` both 301 to `https://arturojc.dev/`.

DNS lives at Namecheap on BasicDNS:

| Type  | Host  | Value |
| ----- | ----- | ----- |
| A     | `@`   | `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` |
| AAAA  | `@`   | `2606:50c0:8000::153` through `:8003::153` |
| CNAME | `www` | `arturo-jc.github.io.` |

## Tooling

Serving config is managed from this repo, not the web dashboards:

- **GitHub Pages** — `gh` CLI, authenticated. Read and write config with
  `gh api repos/arturo-jc/arturo-jc.github.io/pages`.
- **DNS** — the Namecheap MCP, pinned in `.mcp.json`.

Reach for the dashboards only for the two cases below that the APIs cannot cover.

## Local development

```sh
bundle install
bundle exec jekyll serve
```

## Footguns

### The repo name is what puts the site at the domain root

GitHub serves a repo named `<user>.github.io` at `/`, and every other repo at
`/<repo>/`. `baseurl` is `""` and asset links are root-absolute
(`/assets/css/styles.css`), which is only correct at the root. Renaming the repo
or setting a non-empty `baseurl` makes every stylesheet and script 404 while the
HTML itself still loads — so the site looks broken rather than missing.

### The Namecheap MCP cannot see or delete URL Redirect records

`dns_records_get` reports them only under `omittedRecords`, and
`dns_records_delete` cannot match them. This matters because a parking URL
Redirect on `@` also publishes an extra apex A record (`162.255.119.83`), which
DNS returns *alongside* the GitHub IPs: a fraction of visitors get a parking
redirect, and Let's Encrypt validation fails intermittently against it.

Always compare `total` against the length of `items`. If they differ, remove the
remainder in the dashboard: Domain List → Manage → Advanced DNS. The record list
is truncated by default — click **SHOW MORE** or the URL Redirect row stays
hidden.

### Setting the domain and enforcing HTTPS must be two separate calls

Passing both at once fails, because enforcement needs a certificate that does not
exist until the domain is attached:

```
gh api -X PUT .../pages -f cname=arturojc.dev -F https_enforced=true
→ 404 The certificate does not exist yet
```

Set `cname` first, wait for the certificate, then `PUT https_enforced=true`.

### A certificate that will not issue: detach and re-attach the domain

If the domain is attached while DNS is still wrong, GitHub does not retry to any
useful schedule — the certificate stayed unissued for 18 minutes after DNS was
corrected. `PUT {"cname":null}`, then `PUT` the cname again; it was approved
about a minute later. Each toggle commits or deletes the `CNAME` file, so `git
pull` afterwards.

### `.dev` is HSTS-preloaded, so a browser is a bad diagnostic

Browsers refuse plain HTTP to `arturojc.dev`. Between attaching the domain and
the certificate issuing, the site is unreachable in a browser even though
`curl http://arturojc.dev/` returns 200. Check the certificate directly:

```sh
openssl s_client -connect arturojc.dev:443 -servername arturojc.dev </dev/null 2>/dev/null \
  | openssl x509 -noout -subject
```

`CN=*.github.io` is GitHub's default wildcard, meaning the certificate has not
issued yet. `CN=arturojc.dev` means it has.

### Disqus: leave Trusted Domains empty

Comments run on the Disqus shortname `arturojc`, embedded from
`_layouts/post.html` (`embed.js`) and `_layouts/default.html` (`count.js`).
Threads are keyed by `{{ site.url }}{{ page.url }}`, so changing `url` in
`_config.yml` orphans every existing thread.

**Trusted Domains** in Disqus → Settings → Advanced is intentionally blank, which
permits every origin. Adding `arturojc.dev` there looks like an easy hardening
win, but the list is exhaustive — it would stop comments loading under
`bundle exec jekyll serve`. If it is ever populated, `localhost` has to go in
alongside the domain.

Only the Disqus account that owns a forum can administer it, and ownership is not
recoverable from the site side: the previous forum, `https-arturojc-com`, was
created under a different login and returns "insufficient privileges" to the
current one.

## Verifying the served site

Asset paths break silently, so check the served URLs rather than the build:

```sh
for p in / /blog /assets/css/styles.css /js/index.js /feed.xml; do
  printf '%-28s ' "$p"; curl -sL -o /dev/null -w '%{http_code}\n' "https://arturojc.dev$p"
done
```
