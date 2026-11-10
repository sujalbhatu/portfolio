# Sujal Bhatu — portfolio

Personal site of Sujal Bhatu. Hand-built: one HTML file, one stylesheet, one script, no framework, no build step, no trackers.

## What's on the page

| Section | What it shows |
|---|---|
| Hero | One-line pitch, and real screenshots of OpenForge and RollOne running in production, with two measured results. |
| Proof row | Four measured numbers: Recall@5 87%, 2.2× face throughput, 0.7 s median scan, 99.60% IrisAuth accuracy. |
| Case studies | RollOne and OpenForge: the problem, what I built, and a tabbed panel with the architecture, the before/after results and a product screenshot. |
| Research | GGCS (22 EEG channels, 5 kept) and IrisAuth (live iris with Daugman segmentation rings). |
| How I work, About, Contact | Three working habits with real examples, timeline, skills, and contact with a copy-email button. |

Dark and light themes, a ⌘K command menu, and `prefers-reduced-motion` support.
Every number on the page is a measured one from the projects (see the résumé).
A "Résumé" button appears automatically once a `resume.pdf` is added next to `index.html`.

## Run locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Deploy (Oracle VM, nginx)

```bash
sudo mkdir -p /var/www/portfolio
sudo cp -r index.html styles.css main.js og.jpg assets /var/www/portfolio/
sudo cp deploy/nginx-portfolio.conf /etc/nginx/sites-available/portfolio
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d portfolio.openforge.online
```

DNS: an `A` record for `portfolio` pointing at the server's public IP.
