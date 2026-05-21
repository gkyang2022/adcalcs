#!/usr/bin/env python3
"""
AdCalcs Blog Build System
=========================
Generates paginated blog listing pages, category pages, and sitemap.xml
from data/articles.json and HTML templates.

Usage:
    cd D:/laoyang/AI/AdCalcs
    python _scripts/build.py

Supports GitHub Pages deployment -- output is pure static HTML.
"""

import json
import math
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
TEMPLATE_DIR = os.path.join(BASE_DIR, '_templates')
BLOG_DIR = os.path.join(BASE_DIR, 'blog')

SITE_URL = 'https://adcalcs.com'

CATEGORY_NAMES = {
    'youtube': 'YouTube 收益',
    'cpm': 'CPM',
    'rpm': 'RPM',
    'tiktok': 'TikTok 收益',
    'adsense': 'AdSense',
    'guide': '收益指南',
}


# ─── Helpers ─────────────────────────────────────────────

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_template(name):
    path = os.path.join(TEMPLATE_DIR, name)
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def write_file(rel_path, content):
    """Write content to BASE_DIR/rel_path, creating directories as needed."""
    full = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  ++ {rel_path.replace(os.sep, "/")}')


def esc(text):
    """Escape text for embedding in JSON-LD strings."""
    return text.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '')


def fmt_date(date_str):
    """Convert '2026-05-20' → '2026 年 5 月 20 日'"""
    parts = date_str.split('-')
    return f'{parts[0]} 年 {int(parts[1])} 月 {int(parts[2])} 日'


def cat_name(slug):
    return CATEGORY_NAMES.get(slug, slug)


# ─── Renderers ───────────────────────────────────────────

def render_card(article):
    name = cat_name(article['category'])
    date = fmt_date(article['datePublished'])
    return f'''            <article class="blog-card-modern">
              <a href="/blog/{article['slug']}.html" style="text-decoration:none;display:block;">
                <div class="blog-card-cover" style="background:{article['coverGradient']};">{article['coverEmoji']}</div>
                <div class="blog-card-body">
                  <span class="blog-card-category">{name}</span>
                  <h3>{article['title']}</h3>
                  <p>{article['description']}</p>
                  <div class="blog-card-meta">
                    <span>{date}</span>
                    <span>·</span>
                    <span>{article['readingTime']} 分钟阅读</span>
                  </div>
                </div>
              </a>
            </article>'''


def render_pagination(cur, total):
    """Pagination nav HTML with prev/next, page numbers, and disabled states."""
    lines = ['          <nav class="pagination" aria-label="分页导航">']

    # Prev button
    if cur > 1:
        href = '/blog/' if cur == 2 else f'/blog/page/{cur - 1}/'
        lines.append(
            f'            <a href="{href}" class="prev-next" rel="prev" aria-label="上一页">'
            f'<svg width="14" height="14" viewBox="0 0 14 14" fill="none">'
            f'<path d="M9 3L5 7L9 11" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round"/></svg> 上一页</a>'
        )
    else:
        lines.append(
            '            <a href="#" class="prev-next" style="opacity:0.3;pointer-events:none;" '
            'aria-label="上一页"><svg width="14" height="14" viewBox="0 0 14 14" fill="none">'
            '<path d="M9 3L5 7L9 11" stroke="currentColor" stroke-width="2" '
            'stroke-linecap="round" stroke-linejoin="round"/></svg> 上一页</a>'
        )

    # Page numbers
    for i in range(1, total + 1):
        if i == cur:
            href = '/blog/' if i == 1 else f'/blog/page/{i}/'
            lines.append(f'            <a href="{href}" class="active" aria-current="page">{i}</a>')
        else:
            href = '/blog/' if i == 1 else f'/blog/page/{i}/'
            lines.append(f'            <a href="{href}">{i}</a>')

    # Next button
    if cur < total:
        lines.append(
            f'            <a href="/blog/page/{cur + 1}/" class="prev-next" rel="next" '
            f'aria-label="下一页">下一页 '
            f'<svg width="14" height="14" viewBox="0 0 14 14" fill="none">'
            f'<path d="M5 3L9 7L5 11" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
        )
    else:
        lines.append(
            '            <a href="#" class="prev-next" style="opacity:0.3;pointer-events:none;" '
            'aria-label="下一页">下一页 '
            '<svg width="14" height="14" viewBox="0 0 14 14" fill="none">'
            '<path d="M5 3L9 7L5 11" stroke="currentColor" stroke-width="2" '
            'stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
        )

    lines.append('          </nav>')
    return '\n'.join(lines)


def render_rel_links(cur, total):
    """SEO rel=prev / rel=next <link> tags."""
    links = []
    if cur > 1:
        prev_url = f'{SITE_URL}/blog/' if cur == 2 else f'{SITE_URL}/blog/page/{cur - 1}/'
        links.append(f'  <link rel="prev" href="{prev_url}">')
    if cur < total:
        next_url = f'{SITE_URL}/blog/page/{cur + 1}/'
        links.append(f'  <link rel="next" href="{next_url}">')
    return '\n'.join(links)


def render_sidebar_popular(articles):
    """Top 4 popular articles for sidebar."""
    pop = sorted([a for a in articles if a.get('popular')],
                 key=lambda a: a['datePublished'], reverse=True)[:4]
    out = []
    for a in pop:
        c = cat_name(a['category'])
        emoji = a['coverEmoji']
        out.append(
            f'              <a href="/blog/{a["slug"]}.html" class="popular-item">\n'
            f'                <div class="popular-item-cover" style="background:{a["coverGradient"]};">{emoji}</div>\n'
            f'                <div class="popular-item-body">\n'
            f'                  <div class="popular-item-title">{a["title"]}</div>\n'
            f'                  <div class="popular-item-meta">{c}</div>\n'
            f'                </div>\n'
            f'              </a>'
        )
    return '\n'.join(out)


def render_sidebar_categories(categories, counts):
    """Category list with article counts."""
    out = []
    for c in categories:
        cnt = counts.get(c['slug'], 0)
        out.append(
            f'              <a href="/blog/{c["slug"]}/" class="category-list-item">\n'
            f'                <span>{c["name"]}</span>\n'
            f'                <span class="count">{cnt}</span>\n'
            f'              </a>'
        )
    return '\n'.join(out)


def render_category_tags(categories):
    """Hero category tag buttons — all inactive (listing JS handles active)."""
    tags = ['<a href="/blog/" class="active" role="tab" aria-selected="true">全部</a>']
    for c in categories:
        tags.append(f'<a href="/blog/{c["slug"]}/" role="tab">{c["name"]}</a>')
    return '\n'.join(tags)


def render_collection_jsonld(articles, page_url, title):
    """CollectionPage JSON-LD for a set of articles."""
    items = []
    for a in articles:
        items.append(
            f'      {{\n'
            f'        "@type": "BlogPosting",\n'
            f'        "headline": "{esc(a["title"])}",\n'
            f'        "url": "{SITE_URL}/blog/{a["slug"]}.html",\n'
            f'        "datePublished": "{a["datePublished"]}"\n'
            f'      }}'
        )
    return (
        '{\n'
        f'    "@context": "https://schema.org",\n'
        f'    "@type": "CollectionPage",\n'
        f'    "name": "{esc(title)}",\n'
        f'    "description": "AdCalcs 广告收益知识博客",\n'
        f'    "url": "{page_url}",\n'
        f'    "mainEntity": [\n'
        f'{",\n".join(items)}\n'
        f'    ]\n'
        f'  }}'
    )


def render_category_collection_jsonld(articles, cat_name, page_url):
    """CollectionPage JSON-LD for a category page."""
    items = []
    for a in articles:
        items.append(
            f'      {{\n'
            f'        "@type": "BlogPosting",\n'
            f'        "headline": "{esc(a["title"])}",\n'
            f'        "url": "{SITE_URL}/blog/{a["slug"]}.html",\n'
            f'        "datePublished": "{a["datePublished"]}"\n'
            f'      }}'
        )
    return (
        '{\n'
        f'    "@context": "https://schema.org",\n'
        f'    "@type": "CollectionPage",\n'
        f'    "name": "{esc(cat_name)} - 广告收益知识",\n'
        f'    "description": "AdCalcs {esc(cat_name)}相关文章",\n'
        f'    "url": "{page_url}",\n'
        f'    "mainEntity": [\n'
        f'{",\n".join(items)}\n'
        f'    ]\n'
        f'  }}'
    )


def render_footer_links(articles):
    """All article links for footer."""
    return '\n'.join(
        f'<li><a href="/blog/{a["slug"]}.html">{a["title"]}</a></li>'
        for a in articles
    )


def render_sitemap_urls(articles, categories, total_pages):
    """All blog-related sitemap URLs."""
    urls = []

    # Blog listing pages
    urls.append(f'''  <url>
    <loc>{SITE_URL}/blog/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>''')
    for p in range(2, total_pages + 1):
        urls.append(f'''  <url>
    <loc>{SITE_URL}/blog/page/{p}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>''')

    # Category pages
    for c in categories:
        urls.append(f'''  <url>
    <loc>{SITE_URL}/blog/{c["slug"]}/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>''')

    # Individual articles
    for a in articles:
        urls.append(f'''  <url>
    <loc>{SITE_URL}/blog/{a["slug"]}.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>''')

    return '\n'.join(urls)


# ─── Template filler ─────────────────────────────────────

def fill_listing(template, **kw):
    """Replace all {{PLACEHOLDER}} tokens in template with values from kw."""
    html = template
    for key, val in kw.items():
        html = html.replace(f'{{{{{key}}}}}', val)
    return html


# ─── Main ────────────────────────────────────────────────

def main():
    print('=== AdCalcs Blog Build System ===')
    print('=' * 40)

    # ── Load data ──────────────────────────────────────
    data = load_json(os.path.join(DATA_DIR, 'articles.json'))
    site = data['site']
    categories = data['categories']
    articles = data['articles']

    # Sort newest first
    articles.sort(key=lambda a: a['datePublished'], reverse=True)

    per_page = site.get('perPage', 6)
    total = len(articles)
    total_pages = math.ceil(total / per_page)

    # Build category counts
    counts = {}
    for a in articles:
        counts[a['category']] = counts.get(a['category'], 0) + 1

    print(f'\n>> {total} articles, {len(categories)} categories, {total_pages} page(s)')

    # ── Generate listing pages ─────────────────────────
    print('\n>> Blog listing pages...')
    listing_tpl = load_template('blog-listing.html.tmpl')

    for page in range(1, total_pages + 1):
        beg = (page - 1) * per_page
        end_ = beg + per_page
        page_articles = articles[beg:end_]

        if page == 1:
            title = '广告收益知识博客 — CPM RPM YouTube TikTok 收益指南 | AdCalcs'
            desc = site['blogDescription']
            canonical = f'{SITE_URL}/blog/'
            og_title = '广告收益知识博客 | AdCalcs'
        else:
            title = f'AdCalcs 博客 - 第{page}页'
            desc = f'第{page}页 — {site["blogDescription"]}'
            canonical = f'{SITE_URL}/blog/page/{page}/'
            og_title = f'AdCalcs 博客 - 第{page}页'

        og_desc = (desc[:117] + '…') if len(desc) > 120 else desc

        html = fill_listing(listing_tpl,
            PAGE_TITLE=title,
            PAGE_DESCRIPTION=desc,
            CANONICAL_URL=canonical,
            PREV_LINK=render_rel_links(page, total_pages),
            NEXT_LINK='',
            OG_TITLE=og_title,
            OG_DESCRIPTION=og_desc,
            HERO_TITLE=site['blogTitle'],
            HERO_DESCRIPTION=site['blogDescription'],
            BLOG_GRID='\n'.join(render_card(a) for a in page_articles),
            PAGINATION=render_pagination(page, total_pages),
            COLLECTION_JSONLD=render_collection_jsonld(page_articles, canonical, title),
            SIDEBAR_POPULAR=render_sidebar_popular(articles),
            SIDEBAR_CATEGORIES=render_sidebar_categories(categories, counts),
            CATEGORY_TAGS=render_category_tags(categories),
            FOOTER_BLOG_LINKS=render_footer_links(articles),
        )

        if page == 1:
            write_file('blog/index.html', html)
        else:
            write_file(f'blog/page/{page}/index.html', html)

    # ── Generate category pages ────────────────────────
    print('\n>> Category pages...')
    cat_tpl = load_template('blog-category.html.tmpl')

    for cat in categories:
        slug = cat['slug']
        name = cat['name']
        intro = cat.get('intro', f'{name}相关文章')
        cat_articles = [a for a in articles if a['category'] == slug]

        if not cat_articles:
            print(f'  !! Skipping {slug} (no articles)')
            continue

        page_title = f'{name} — 广告收益知识 | AdCalcs'
        desc = cat['description']
        canonical = f'{SITE_URL}/blog/{slug}/'

        html = fill_listing(cat_tpl,
            PAGE_TITLE=page_title,
            PAGE_DESCRIPTION=desc,
            CANONICAL_URL=canonical,
            PREV_LINK='',
            NEXT_LINK='',
            OG_TITLE=f'{name} — 广告收益知识',
            OG_DESCRIPTION=(desc[:117] + '…') if len(desc) > 120 else desc,
            CATEGORY_NAME=name,
            CATEGORY_INTRO=intro,
            ARTICLE_COUNT=str(len(cat_articles)),
            BLOG_GRID='\n'.join(render_card(a) for a in cat_articles),
            PAGINATION=render_pagination(1, 1),
            COLLECTION_JSONLD=render_category_collection_jsonld(cat_articles, name, canonical),
            SIDEBAR_POPULAR=render_sidebar_popular(articles),
            SIDEBAR_CATEGORIES=render_sidebar_categories(categories, counts),
            FOOTER_BLOG_LINKS=render_footer_links(articles),
            HERO_TITLE='',
            HERO_DESCRIPTION='',
            CATEGORY_TAGS='',
        )

        write_file(f'blog/{slug}/index.html', html)

    # ── Generate sitemap.xml ───────────────────────────
    print('\n>> sitemap.xml...')
    sitemap_tpl = load_template('sitemap.xml.tmpl')
    sitemap = sitemap_tpl.replace('{{BLOG_URLS}}', render_sitemap_urls(articles, categories, total_pages))
    write_file('sitemap.xml', sitemap)

    # ── Generate robots.txt ────────────────────────
    robots = 'User-agent: *\nAllow: /\n\nSitemap: https://adcalcs.com/sitemap.xml\n'
    write_file('robots.txt', robots)

    # ── Done ───────────────────────────────────────────
    cat_count = sum(1 for c in categories if counts.get(c['slug'], 0) > 0)
    print(f'\n>> Build complete!')
    print(f'   {total_pages} listing page(s), {cat_count} category page(s), sitemap.xml, robots.txt')
    print()


if __name__ == '__main__':
    main()
