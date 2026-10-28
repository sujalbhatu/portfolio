# Sujal Bhatu — portfolio

Personal site of Sujal Bhatu. Hand-built: one HTML file, one stylesheet, one script, no framework, no build step, no trackers.

## What's on the page

| Section | Visual | Built from |
|---|---|---|
| Intro | A full-screen iris painted from ~7,000 strands; the pupil follows the cursor and breathes. Its rubber-sheet unrolling and IrisCode bits sit in the corner. Scrolling dives into the pupil, the statement lights word by word, and the page opens into paper. | IrisAuth (Daugman IrisCode + ResNet fusion) |
| Work index | Four rows, one real number each; hover shows a tiny preview. | — |
| RollOne | A 3D lecture hall: the projector shows a rotating QR token and 120 seats light up as students check in (illustrative replay). | Attendance platform |
| OpenForge | A shelf of 123 law books (one per Act). Each search dims the shelf to its top 5 and pulls out the Act that answers, tagged with its section. Then a streamed answer with a citation, and old-vs-new bars from the eval set. | Legal RAG assistant |
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
