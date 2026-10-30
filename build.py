"""Build the portfolio's static pages. Run: python build.py  (pass --offline to reuse the cached GitHub heatmap)."""
import datetime
import html
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
SITE = 'https://unorfl.github.io/portfolio/'
EMAIL = 'improvised30@gmail.com'
GITHUB = 'https://github.com/UnoRfl'
e = html.escape

PROJECTS = [
    dict(slug='tpn-os', title='TPN OS', year='2026', cats='web', tags=['Supabase', 'Android', 'ESC/POS'],
         card='Point-of-sale, kitchen and invoicing system built to replace a paid POS in a real restaurant.',
         short='Point-of-sale and kitchen system running in a real restaurant.',
         lede='A point-of-sale, kitchen and invoicing system built to replace a paid POS at a real restaurant.',
         role='Design &amp; development', tools='Supabase · Android · ESC/POS',
         link=('https://unorfl.github.io/tpn-os/', 'unorfl.github.io/tpn-os'),
         problem=('Orders, the kitchen and the paperwork all lived in different places.',
                  'The restaurant was paying a yearly fee for a POS it barely used, and invoices were written by hand from a booklet only when a customer asked. The owners needed one system the counter staff could learn in minutes, and one they could afford to keep.'),
         built=('A Supabase-backed web app that runs on the restaurant’s iMin counter terminals through two small Android apps I wrote, TPN Counter and TPN Kitchen. Every order prints a receipt for the guest and a ticket on the kitchen’s network printer, guests can order from a QR menu at their table, and the counter keeps taking orders when the internet drops.',
                ['Counter and kitchen apps on iMin terminals', 'Receipts and kitchen tickets over ESC/POS', 'QR table menu, offline mode and BIR-ready invoices']),
         result=('A POS the restaurant owns, not rents.',
                 'No yearly licence fee, and every money rule is guarded by 220 automated database checks.',
                 'real users find every edge case within a week. Building for a busy counter taught me to make the common action one tap and keep everything else out of the way.'),
         shots=[('tpn-shot-1', 'Website home'), ('tpn-shot-2', 'Online menu'), ('tpn-shot-3', 'Restaurant page'), ('tpn-shot-4', 'Ordering on mobile')]),
    dict(slug='orbit', title='Orbit', year='2026', cats='web', tags=['Preact', 'Supabase', 'MapLibre'],
         card='Student social and scheduling app with plans, chat and a live map of friends on campus.',
         short='Student social and scheduling app with live location.',
         lede='A social and scheduling app that shows students when their friends are free, and where.',
         role='Design &amp; development', tools='Preact · Supabase · MapLibre',
         link=('https://unorfl.github.io/Orbit/', 'unorfl.github.io/Orbit'),
         problem=('Classmates kept missing each other between classes.',
                  'Free periods, study groups and lunch plans were scattered across group chats, and nobody could tell who was free right now or where they were on campus.'),
         built=('An installable web app with no build step: Preact and Supabase served straight from GitHub Pages. Students share their class schedule, make plans, chat, and can opt in to a live map that shows friends on campus. The app checks how capable the phone is before the first paint, so cheaper phones get a lighter version instead of a laggy one.',
                ['Plans, chat and shared class schedules', 'Opt-in live location on a campus map', 'Device tiers so low-end phones stay smooth']),
         result=('My first public app.',
                 'Orbit went live in July 2026 and is where I learned Supabase, row-level security and realtime.',
                 'privacy has to be designed in from the start. Live location only works if people trust exactly who can see them and when.'),
         shots=[('orbit-shot-1', 'Sign-in screen'), ('orbit-shot-2', 'App preview')]),
    dict(slug='mochi-print', title='Mochi Print', year='2026', cats='web hw', tags=['Web Bluetooth', 'Canvas'],
         card='Prints photos and doodles to a tiny Bluetooth camera-printer, straight from a phone browser.',
         short='A cute web app that prints to a Bluetooth thermal printer.',
         lede='A cute web app that prints photos, notes and doodles to a tiny Bluetooth thermal printer.',
         role='Design &amp; development', tools='Web Bluetooth · Canvas',
         link=('https://unorfl.github.io/mochi-print/', 'unorfl.github.io/mochi-print'),
         problem=('A tiny printer that deserved a friendlier app.',
                  'A kids’ instant-print camera came with a clunky companion app. A family member wanted to print photos and little notes from their phone without fighting it.'),
         built=('A single-page web app that talks to the printer directly over Web Bluetooth. I worked out the printer’s protocol packet by packet, then built photo, note and doodle modes with frames and captions. Images are dithered on a canvas down to the printer’s 384-pixel line.',
                ['Speaks the printer’s Bluetooth protocol directly', 'Photo, note and doodle modes with frames', 'Works on iPhone through a Bluetooth browser']),
         result=('Prints from a phone in a couple of taps.',
                 'No install and no account: open the page, connect, print.',
                 'hardware lies. The printer reported "no paper" when it was really in webcam mode, and every print came out upside down until I flipped the image.'),
         shots=[('mochi-shot-1', 'Print studio'), ('mochi-shot-2', 'App screen')]),
    dict(slug='pocket-nova', title='Pocket Nova', year='2026', cats='hw', tags=['ESP32', 'C++', 'BLE'],
         card='A pixel pet on a 5×5 LED matrix that doubles as a Bluetooth media remote and a TV remote.',
         short='A pocket-sized pixel pet that doubles as a remote.',
         lede='A pixel pet on a 5×5 LED matrix that doubles as a Bluetooth media remote and a TV remote.',
         role='Firmware &amp; PC app', tools='ESP32 · C++ · BLE · Python',
         link=('https://github.com/UnoRfl/PocketNova', 'github.com/UnoRfl/PocketNova'),
         problem=('One button, a 24 mm screen, and too many remotes.',
                  'I wanted a keychain-sized device that was fun to carry and actually useful: something to skip a song, change the volume or turn off a TV without hunting for the right remote.'),
         built=('Custom firmware for an ESP32 Atom Matrix. A pet called Nova lives on the home screen; hold the button for the menu, double-tap for the last app. It has 11 apps, three Bluetooth pairing slots and an infrared TV remote for 20 brands, with every code cross-checked against several public databases. A small PC panel opens by itself when it is plugged in.',
                ['Pixel pet home screen and 11 one-button apps', 'Bluetooth media keys with three pairing slots', 'IR TV remote for 20 brands plus a find-my-TV sweep']),
         result=('A remote I actually carry.',
                 'It survives restarts, reconnects on its own and updates from the PC panel.',
                 'a one-button interface forces you to cut every feature down to the essential gesture.'),
         shots=[('pocket-shot-1', 'Pocket-sized'), ('pocket-shot-2', 'One button. Everything.')]),
    dict(slug='3d-motion', title='3D & Motion', year='2026', cats='3d', tags=['Blender', 'Python', 'Canvas'],
         card='Parametric jewelry models in Blender and story-driven product ads rendered from code.',
         short='Parametric jewelry and story-driven product ads.',
         lede='Parametric jewelry models in Blender and story-driven product ads rendered from code.',
         role='Modelling, rendering &amp; animation', tools='Blender · Python · Canvas',
         link=None,
         problem=('Making things look real without a studio.',
                  'Jewelry needs exact measurements and believable metal, and a product ad needs a story. Doing either by hand, frame by frame, would take weeks.'),
         built=('Everything is generated by scripts. The clover bracelet is built in Blender with Python: five motifs, 42 cable links that thread without touching, and a working clasp, rendered in Cycles. The ads run a canvas animation through headless Chrome, composite it onto a 3D laptop in Blender and add a synthesized soundtrack and narration.',
                ['Parametric bracelet and ring models with real dimensions', 'Cycles renders with studio lighting', 'Code-rendered ads: canvas → Blender → narrated video']),
         result=('Renders that pass for product photos.',
                 'Changing a size or a motif is an edit and a re-run, not a remodel.',
                 'a story beats effects. The first ad was a reel of animations; the one that worked told one small story.'),
         shots=[('3d-shot-1', 'Clover motif'), ('3d-shot-2', 'Clasp detail'), ('3d-shot-3', 'Flat lay'), ('3d-shot-4', 'Cable chain')]),
]
FILTERS = [('all', 'All'), ('web', 'Web Apps'), ('hw', 'Hardware'), ('3d', '3D &amp; Motion')]
SKILLS = [
    ('Frontend', ['HTML', 'CSS', 'JavaScript', 'Preact', 'PWA', 'Android']),
    ('Backend &amp; Data', ['Supabase', 'PostgreSQL', 'Python', 'Realtime']),
    ('Games', ['Roblox Studio', 'Luau', 'Minecraft datapacks']),
    ('Hardware', ['ESP32', 'Arduino', 'Web Bluetooth', 'ESC/POS printers']),
    ('3D &amp; Motion', ['Blender', 'Cycles', 'Canvas animation', 'Puppeteer']),
]
TIMELINE = [
    ('Sept 2025', 'Started building', 'Began teaching myself to build for the web, one small project at a time.'),
    ('SY 2026–27', 'BSIT Game Development, UPHSD', 'First year of BS Information Technology, Game Development track, at the University of Perpetual Help System DALTA.'),
    ('Jul 2026', 'Orbit', 'My first public app: student scheduling with a live campus map.'),
    ('Aug 2026', 'TPN OS begins', 'Started a point-of-sale system to replace a restaurant’s paid POS.'),
    ('Sept 2026', 'NOVA goes open source', 'Released my voice console for Claude Code under the MIT licence.'),
    ('Oct 2026', 'Hardware and games', 'Shipped Pocket Nova and Mochi Print, and started Steal a Spellbook on Roblox.'),
]

GH_ICON = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>'
MENU_ICON = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="14" y2="17"/></svg>'
CLOSE_ICON = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
NAV = [('index.html', 'Home', 'home'), ('work.html', 'Work', 'work'), ('about.html', 'About', 'about'), ('contact.html', 'Contact', 'contact')]


def nav_items(active, cls=''):
    out = []
    for href, label, key in NAV:
        on = key == active
        out.append(f'<li><a{" class=\"on\"" if on else ""} href="{href}"{" aria-current=\"page\"" if on else ""}>{label}</a></li>')
    return '\n'.join(out)


def page(name, title, desc, active, body, after=''):
    full_title = 'Juan Rafael — Web Developer // Game Developer' if name == 'index.html' else f'{title} — Uno'
    year = datetime.date.today().year
    doc = f'''<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{full_title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#121212">
<meta property="og:type" content="website">
<meta property="og:title" content="{full_title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{SITE}assets/img/og.jpg">
<meta property="og:url" content="{SITE}{'' if name == 'index.html' else name}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
<div class="quake" aria-hidden="true"><div class="quake-lens"><div class="quake-field"></div></div></div>
<div class="shell">
<aside class="side" aria-label="Site">
<div class="side-in">
<a class="logo" href="index.html" aria-label="Home"><img src="assets/img/uno-ink-dark.webp" alt="" width="57" height="160"></a>
<nav class="nav" aria-label="Main"><ul>
{nav_items(active)}
</ul></nav>
<div class="side-foot">
<ul class="soc"><li><a href="{GITHUB}" aria-label="GitHub">{GH_ICON}</a></li></ul>
<p class="copy">© {year} Uno<br>All rights reserved</p>
</div>
</div>
</aside>
<main id="content">
<div class="mtop">
<a class="logo" href="index.html" aria-label="Home"><img src="assets/img/uno-ink-dark.webp" alt="" width="57" height="160"></a>
<button type="button" class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="drawer" data-open-menu>{MENU_ICON}</button>
</div>
{body}
</main>
</div>
<div class="drawer" id="drawer" aria-hidden="true">
<div class="drawer-top">
<a class="logo" href="index.html" aria-label="Home" style="width:40px;height:40px;border-radius:12px"><img src="assets/img/uno-ink-dark.webp" alt="" width="57" height="160"></a>
<button type="button" class="menu-btn" aria-label="Close menu" data-close-menu>{CLOSE_ICON}</button>
</div>
<nav aria-label="Mobile"><ul>
{nav_items(active)}
</ul></nav>
<div class="side-foot">
<ul class="soc"><li><a href="{GITHUB}" aria-label="GitHub">{GH_ICON}</a></li></ul>
<p class="copy">© {year} Uno</p>
</div>
</div>
{after}<script src="assets/js/site.js" defer></script>
</body>
</html>
'''
    (ROOT / name).write_text(doc, encoding='utf-8')
    print('wrote', name)


def media(src, alt, cls='', eager=False, sizes=''):
    loading = 'eager" fetchpriority="high' if eager else 'lazy'
    return f'<div class="media {cls}"><img src="assets/img/{src}.webp" alt="{alt}" loading="{loading}" decoding="async"></div>'


def card(p, tag='h3', eager=False):
    tags = ''.join(f'<li>{e(t)}</li>' for t in p['tags'])
    return f'''<a class="card reveal" href="{p['slug']}.html" data-cats="{p['cats']}">
<div class="cover media"><img src="assets/img/{cover_name(p)}-cover.webp" alt="{e(p['title'])}" loading="{'eager' if eager else 'lazy'}" decoding="async"><span class="view">View project →</span></div>
<div class="card-meta">
<div class="card-title"><{tag}>{e(p['title'])}</{tag}><span class="year">{p['year']}</span></div>
<p>{p['short'] if tag == 'h3' else p['card']}</p>
<ul class="tags">{tags}</ul>
</div>
</a>'''


def cover_name(p):
    return {'tpn-os': 'tpn', 'orbit': 'orbit', 'mochi-print': 'mochi', 'pocket-nova': 'pocket', '3d-motion': '3d'}[p['slug']]


def build_home():
    cards = '\n'.join(card(p, eager=True) for p in PROJECTS[:3])
    body = f'''<div class="wrap">
<section class="hero">
<div class="eyebrow reveal"><span>Web Developer // Game Developer</span></div>
<h1 class="display reveal" style="--d:.06s">Juan Rafael</h1>
<p class="lede reveal" style="--d:.12s">I build web apps, games and tools that real people use.</p>
<div class="actions reveal" style="--d:.18s">
<a class="btn btn-p" href="work.html">See my work <span class="arr">→</span></a>
<a class="btn btn-s" href="contact.html">Contact</a>
</div>
</section>
<section class="section">
<div class="section-head reveal">
<div><span class="kicker">01 — Selected work</span><h2 class="h2">Built for real use</h2></div>
<a class="link" href="work.html">All projects →</a>
</div>
<div class="grid-cards" data-stagger>
{cards}
</div>
</section>
<section class="section focus-sec">
<div class="section-head reveal"><div><span class="kicker">02 — What I’m into</span><h2 class="h2">Always trying something new</h2></div></div>
<div class="focus" data-stagger>
<div class="stat reveal"><span class="idx">01</span><h3>Web development</h3><p>Sites and apps that feel quick, clear and simple to use.</p></div>
<div class="stat reveal"><span class="idx">02</span><h3>Game development</h3><p>Worlds, mechanics and the small details that make them fun.</p></div>
<div class="stat reveal"><span class="idx">03</span><h3>Whatever’s next</h3><p>Hardware, 3D and motion. If I haven’t tried it yet, it’s on the list.</p></div>
</div>
</section>
<section class="cta reveal">
<h2 class="h2">Have something that needs building?</h2>
<a class="btn btn-p" href="contact.html">Get in touch <span class="arr">→</span></a>
</section>
</div>'''
    page('index.html', 'Home', 'Juan Rafael (Uno) is an aspiring web and game developer who builds web apps, games and tools that real people use.', 'home', body)


def build_work():
    pills = ''.join(f'<button type="button" class="pill" data-filter="{k}" aria-pressed="{"true" if k == "all" else "false"}">{v}</button>' for k, v in FILTERS)
    cards = '\n'.join(card(p, tag='h2', eager=i < 2) for i, p in enumerate(PROJECTS))
    body = f'''<div class="wrap">
<header class="page-head">
<div class="eyebrow reveal"><span>Work · <span class="count">{len(PROJECTS):02d} projects</span></span></div>
<h1 class="h1 reveal" style="--d:.06s">Things I’ve made</h1>
<p class="body reveal" style="--d:.12s">Web apps, hardware and 3D work. Most of it was built for a real person with a real problem: a restaurant, a classroom, a family member.</p>
</header>
<div class="filters reveal" style="--d:.18s" role="group" aria-label="Filter projects">{pills}</div>
<section class="grid-cards work-grid" aria-label="Projects" data-stagger>
{cards}
</section>
</div>'''
    page('work.html', 'Work', 'Web apps, hardware and 3D work by Uno, most of it built for a real person with a real problem.', 'work', body)


def build_project(i, p):
    nxt = PROJECTS[(i + 1) % len(PROJECTS)]
    c = cover_name(p)
    link = f'<a class="link always" href="{p["link"][0]}">{p["link"][1]} ↗</a>' if p['link'] else '<span>Renders on request</span>'
    letters = 'ABC'
    bullets = ''.join(f'<li><span>{letters[k]}</span>{e(b)}</li>' for k, b in enumerate(p['built'][1]))
    shots = ''.join(
        f'<button type="button" class="shot media reveal" data-full="assets/img/{s}.webp" data-cap="{e(cap)}" aria-label="Open screenshot: {e(cap)}"><img src="assets/img/{s}.webp" alt="" loading="lazy" decoding="async"></button>'
        for s, cap in p['shots'])
    body = f'''{media(c + '-hero', e(p['title']), 'p-hero', eager=True)}
<div class="wrap">
<header class="p-head">
<a class="link reveal" href="work.html">← All work</a>
<h1 class="h1 reveal" style="--d:.06s">{e(p['title'])}</h1>
<p class="lede reveal" style="--d:.12s">{p['lede']}</p>
</header>
<dl class="p-meta reveal">
<div><dt>Role</dt><dd>{p['role']}</dd></div>
<div><dt>Year</dt><dd>{p['year']}</dd></div>
<div><dt>Tools</dt><dd>{p['tools']}</dd></div>
<div><dt>Link</dt><dd>{link}</dd></div>
</dl>
<section class="p-sec reveal">
<h2>01 — The problem</h2>
<div><p class="big">{p['problem'][0]}</p><p class="body">{p['problem'][1]}</p></div>
</section>
<section class="p-sec reveal">
<h2>02 — What I built</h2>
<div><p class="body">{p['built'][0]}</p><ul class="p-list">{bullets}</ul></div>
</section>
<section class="shots-sec">
<div class="shots-head reveal"><h2>03 — Screenshots</h2><span class="year">Click to enlarge</span></div>
<div class="shots" data-stagger>{shots}</div>
</section>
<section class="p-sec reveal">
<h2>04 — Result</h2>
<div><p class="big">{p['result'][0]}</p><p class="body">{p['result'][1]}</p><p class="body"><span class="learned">What I learned:</span> {p['result'][2]}</p></div>
</section>
<a class="next reveal" href="{nxt['slug']}.html">
<span><span class="kicker">Next project</span><span class="name">{e(nxt['title'])}</span></span>
<span class="arrow" aria-hidden="true">→</span>
</a>
</div>'''
    lb = f'''<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Screenshot viewer" aria-hidden="true">
<button type="button" class="lb-btn lb-close" aria-label="Close">{CLOSE_ICON}</button>
<img src="" alt="">
<div class="lb-bar"><button type="button" class="lb-btn" data-prev>← Prev</button><span data-lb-cap></span><button type="button" class="lb-btn" data-next>Next →</button></div>
</div>
'''
    page(f"{p['slug']}.html", p['title'], f"{p['title']}: {p['card']}", 'work', body, lb)


def heatmap():
    cache = ROOT / 'build-cache' / 'github.json'
    if '--offline' not in sys.argv:
        q = '{user(login:"UnoRfl"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{contributionLevel date}}}}}}'
        try:
            raw = subprocess.run(['gh', 'api', 'graphql', '-f', f'query={q}'], capture_output=True, text=True, check=True).stdout
            cache.parent.mkdir(exist_ok=True)
            cache.write_text(raw, encoding='utf-8')
        except (OSError, subprocess.CalledProcessError) as err:
            print('heatmap: using cache,', err)
    cal = json.loads(cache.read_text(encoding='utf-8'))['data']['user']['contributionsCollection']['contributionCalendar']
    lv = {'NONE': 0, 'FIRST_QUARTILE': 1, 'SECOND_QUARTILE': 2, 'THIRD_QUARTILE': 3, 'FOURTH_QUARTILE': 4}
    months, weeks, prev = [], [], None
    for w, week in enumerate(cal['weeks']):
        first = datetime.date.fromisoformat(week['contributionDays'][0]['date'])
        months.append(f'<span>{first.strftime("%b") if w and first.month != prev else ""}</span>')
        prev = first.month
        cells = ''.join(f'<i class="l{lv[d["contributionLevel"]]}" title="{d["date"]}"></i>' for d in week['contributionDays'])
        weeks.append(f'<div class="heat-week" style="--w:{w}">{cells}</div>')
    return cal['totalContributions'], ''.join(months), ''.join(weeks), datetime.date.today()


def build_about():
    skills = '\n'.join(f'<div class="skill reveal"><h3>{n}</h3><ul class="tags">{"".join(f"<li>{e(t)}</li>" for t in tags)}</ul></div>' for n, tags in SKILLS)
    tl = '\n'.join(f'<li class="reveal"><span class="dot" aria-hidden="true"></span><span class="kicker">{w}</span><span class="t-title">{t}</span><span class="t-text">{x}</span></li>' for w, t, x in TIMELINE)
    total, months, weeks, today = heatmap()
    body = f'''<div class="wrap">
<section class="about-top">
<div class="portrait reveal" role="img" aria-label="うの — Uno in Japanese calligraphy"><img class="mono" src="assets/img/uno-ink-gold.webp" alt="" width="321" height="900"><span class="tag">Web Developer // Game Developer</span></div>
<div class="about-copy">
<div class="eyebrow reveal"><span>About</span></div>
<h1 class="h1 reveal" style="--d:.06s">I like building things that leave the screen.</h1>
<p class="body reveal" style="--d:.12s">I’m Juan Rafael, though most people online know me as Uno. I’m a student who is still figuring out what I want to be great at, and I’m enjoying every step of finding out.</p>
<p class="body reveal" style="--d:.16s">I learn best by making things. When something catches my eye, whether it’s a website, a game or a little gadget, I would rather try building it myself than just read about it.</p>
<p class="body reveal" style="--d:.2s">Every project pushes me a bit further than the last. I’m always looking for something new to try, and new ways to expand my horizons.</p>
<div class="actions reveal" style="--d:.24s"><a class="btn btn-p" href="work.html">See my work <span class="arr">→</span></a><a class="btn btn-s" href="contact.html">Get in touch</a></div>
</div>
</section>
<section class="band section" style="padding-top:120px">
<div class="section-head reveal"><div><span class="kicker">01 — Skills</span><h2 class="h2">Tools I reach for</h2></div></div>
<div class="skills" data-stagger>
{skills}
</div>
</section>
<section class="band timeline-band">
<div class="reveal"><span class="kicker">02 — Timeline</span><h2 class="h2">So far</h2></div>
<ol class="timeline">
{tl}
</ol>
</section>
<section class="band gh" aria-label="GitHub activity">
<div class="section-head reveal"><div><span class="kicker">03 — On GitHub</span><h2 class="h2">{total} contributions this year</h2></div><a class="link always" href="{GITHUB}">@UnoRfl ↗</a></div>
<div class="heat-scroll reveal">
<div class="heat" role="img" aria-label="GitHub contribution heatmap for the last year: {total} contributions">
<div class="heat-months" aria-hidden="true">{months}</div>
<div class="heat-body" aria-hidden="true"><div class="heat-days"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div>{weeks}</div>
</div>
</div>
<div class="gh-foot reveal"><p>Snapshot from {today.day} {today.strftime("%b %Y")}. Most of my code went public in July 2026.</p>
<div class="legend" aria-hidden="true"><span>Less</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>More</span></div></div>
</section>
</div>'''
    page('about.html', 'About', 'About Juan Rafael (Uno): an aspiring web and game developer who loves trying new things.', 'about', body)


def build_contact():
    body = f'''<div class="wrap">
<div class="contact">
<section>
<div class="eyebrow reveal"><span>Contact</span></div>
<h1 class="h1 reveal" style="--d:.06s">Let’s build something</h1>
<p class="body reveal" style="--d:.12s">I’m open to freelance web apps, small-business tools, internships and collaborations on games or hardware.</p>
<a class="mail reveal" style="--d:.18s" href="mailto:{EMAIL}">{EMAIL}</a>
<dl class="c-meta reveal" style="--d:.22s">
<dt>GitHub</dt><dd><a href="{GITHUB}">@UnoRfl ↗</a></dd>
<dt>Replies</dt><dd>Email is fastest</dd>
</dl>
</section>
<form class="form reveal" style="--d:.14s" id="contact-form" data-to="{EMAIL}" aria-label="Contact form" novalidate>
<div class="field"><label for="c-name">Name</label><input id="c-name" name="name" type="text" autocomplete="name" placeholder="Your name" required></div>
<div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" placeholder="you@email.com" required></div>
<div class="field"><label for="c-msg">Message</label><textarea id="c-msg" name="message" rows="5" placeholder="What are you working on?" required></textarea></div>
<button type="submit" class="btn btn-p">Send message <span class="arr">→</span></button>
<p class="form-note" aria-live="polite"></p>
</form>
</div>
</div>'''
    page('contact.html', 'Contact', 'Get in touch with Uno about web apps, small-business tools, internships or game and hardware collaborations.', 'contact', body)


if __name__ == '__main__':
    build_home()
    build_work()
    for i, p in enumerate(PROJECTS):
        build_project(i, p)
    build_about()
    build_contact()
