"""Wrap src/app.html (the same file published as the claude.ai artifact) into public/index.html for Vercel."""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'src' / 'app.html').read_text()
i = src.index('<style>')
head_bits, body = src[:i], src[i:]
page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#e6e2e2">
<meta name="robots" content="noindex">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" href="/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
{head_bits.strip()}
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
</head>
<body>
{body}
</body>
</html>
'''
(root / 'public' / 'index.html').write_text(page)
print('wrote public/index.html', len(page))
