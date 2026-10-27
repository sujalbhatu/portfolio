# Sujal Bhatu — portfolio

Personal site of Sujal Bhatu. Hand-built: one HTML file, one stylesheet, one script, no framework, no build step, no trackers.

## What's on the page

| Section | Visual | Built from |
|---|---|---|
| Hero | An iris drawn line by line; the pupil follows the cursor; click it to "scan". Below it, the same iris unrolled to a rubber sheet and encoded as bits. | IrisAuth (Daugman IrisCode + ResNet fusion) |
| Work index | Four rows, one real number each; hover shows a tiny preview. | — |
| RollOne | A rotating QR token, and a 120-seat lecture hall that fills in as students check in (illustrative replay). | Attendance platform |
| OpenForge | 123 book spines (one per Act) with the top 5 lighting up, a streamed answer with a citation, and old-vs-new bars from the eval set. | Legal RAG assistant |
| Research | 22 EEG channels drift behind the section; as you scroll, 17 fade and the 5 kept by GGCS stay. | GGCS channel selection |
| Contact | A smaller iris that keeps looking at you. | — |

Every number on the page is a measured one from the projects (see the résumé).
Motion respects `prefers-reduced-motion`, and the page reads fine without JavaScript.

## Run locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Deploy (Oracle VM, nginx)

```bash
sudo mkdir -p /var/www/portfolio
sudo cp index.html styles.css main.js og.jpg /var/www/portfolio/
sudo cp deploy/nginx-portfolio.conf /etc/nginx/sites-available/portfolio
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d portfolio.openforge.online
```

DNS: an `A` record for `portfolio` pointing at the server's public IP.
