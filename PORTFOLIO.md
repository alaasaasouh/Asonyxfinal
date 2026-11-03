# The Work Collection

The portfolio is a buildless page: open `portfolio.html` from a static server. It uses its own stylesheet, scripts and locally hosted Latin font subsets. No packages, external font service or build step are needed for deployment. Font licenses are in `fonts/`.

## Edit a project

Project content lives in `js/portfolio-data.js`. Each entry contains the title, category, description, live URL, optional working Vercel URL, tags, technologies, features and related repository links.

- `url` is the preferred working website and the embedded preview destination.
- `type` groups work by format: `website`, `store`, `menu` or `portfolio`. The `types` list defines the visible format buttons. Keep restaurant menus separate from full restaurant websites.
- `category` is a secondary industry filter, independent of project format.
- `vercel` enables the Vercel filter and provides an alternate link when the main URL is a custom domain. Omit it when a working Vercel deployment is not known.
- `sources` collects the published source, earlier versions, archives and supporting assets under one project. Keep these as resources rather than duplicate gallery cards.
- `date` is the latest known repository activity, used for sorting. It is not a launch date.
- `note` provides a short clarification when an experience includes demo functionality.
- `id` must be unique and match a thumbnail filename in `images/portfolio/`.

This page explicitly presents a small selection from the studio’s wider portfolio, with more projects available on request. The selection contains 23 projects across four formats (11 websites, six online stores, four digital menus and two photography portfolios), five industries and 14 known working Vercel deployments. Studio order starts with The Scent, Beauty Lounge, Otium Group, The High Life, Sweet Clouds and Farah Foundation, followed by GLAÇON, FTA Management and MASKLAB. Removed entries remain excluded: Yehya.O Tools, Asonyx, FlyMedia, Samer Madi, We Leaders, M.D. Official and Marketing Agency. Interface counts and spotlight choices are derived from the data.

## Images and previews

Thumbnails are captures of the actual websites. The gallery serves local WebP versions at 480 and 960 pixels wide through responsive image sources. Original JPEG captures are retained as source assets. Below-the-fold images load lazily, missing images have a branded fallback, and the portfolio favicon is a small version of the existing logo. The Scent is also the static HTML hero image, avoiding an initial request for a different project before JavaScript runs.

The preferred live URLs for The Scent, Beauty Lounge, Sweet Clouds, Farah Foundation, GLAÇON, FTA Management, The High Life and MASKLAB are the links supplied by the owner. All eight responded with HTTP 200 when checked. These are page-availability checks, not order or form-submission tests.

Only a project explicitly opened by the visitor loads in an iframe. The preview includes desktop/mobile widths, a brief About view, next/previous navigation and direct website links. Cards keep only a short description, a domain link and a preview control. Some external sites may restrict embedding; direct links remain available.

## Browsing and accessibility

Format, industry, search, Vercel filter, sorting and layout combine. Their state is reflected in the URL so selections can be shared, including `?type=menu#collection` for digital menus. Hero shortcuts go directly to websites, stores or menus. Changing formats resets the industry filter; the more specific search remains available. The optional Vercel filter is under Filters. Search includes titles, descriptions, formats, industries, tags, technologies and repository names. `/` focuses search when the visitor is not typing.

Native dialogs handle focus containment and Escape dismissal. Closing a preview clears its iframe and restores focus. Preview navigation stays within the filtered selection. Format buttons wrap on phones so Digital menus and the other formats remain visible. The original oversized serif typography, cyan accents and orbital details are retained with new title reveals, short gallery transitions, pointer-responsive hero depth and a reading-progress line. Continuous hero motion pauses out of view. Motion respects `prefers-reduced-motion`, and scrolling stays native.

## Validation

Browser checks covered the selected-work copy, preserved project order and removals, all four format filters, industry filters, search, empty-state reset, alphabetical sorting, gallery/index views, shared format URLs under a repository subpath, hero shortcuts, menu-only preview navigation, device width, Escape dismissal and mobile navigation. Layout checks passed at 320, 390, 768, 1024 and 1440 pixels without horizontal page overflow. Both normal and reduced-motion modes were checked, including title completion, visible cards after format transitions and hero animation. The portfolio made no external requests before opening a live preview. No portfolio JavaScript errors or missing local assets were observed.

The legacy `portfolio.js` remains because the home page references it. The redesigned portfolio uses `js/portfolio-gallery.js` instead, so it does not initialize the old placeholder gallery or testimonial carousel.
