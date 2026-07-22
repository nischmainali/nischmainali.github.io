# Homepage design study: the sunlit field-desk frontispiece

Status: Direction A accepted and implemented on the experimental branch  
Prepared: 21 July 2026  
Implemented: 22 July 2026  
Branch studied: `experiment/toc-outside-sheet`

This document records the wide survey, close reading, rejected directions, and
recommended composition for the homepage pass. It does not supersede
`DESIGN_LANGUAGE.md`; the tested result is now recorded there as the current
Home grammar.

The accepted implementation follows Direction A with five deliberate edits made
during visual review: it preserves the site's original crop-mark and page-padding
geometry, omits the proposed eyebrow and “At present” line, leaves the portrait
uncaptioned, omits venue and record-type labels, and makes each compact
bibliography entry invert as one complete row. The existing Lokta/sunlight field
and ink register remain authoritative.

The final ledger retains its separate year and `❡` registers, with collaborators
beneath each title. Rather than replacing the removed venue column, the text
measure stops just before the right edge and the rules taper into the paper; the
remaining space therefore reads as an intentional outer margin.

## Decision in one sentence

Keep the homepage's present ingredients, but compose them as a **sunlit
field-desk frontispiece**: an exact statement of intellectual purpose, a portrait
registered like a printed plate, and an annotated bibliography of selected
work.

The research does not support turning the page into a larger portfolio. The
Lokta sheet, crop marks, changing light, portrait, and bibliography already form
a rare identity. The next step is to make their relationships feel authored at
every width and to let a little more of the person and present research appear.

The desired result should feel like the first leaf of a scholar's field notebook,
not a résumé template, product landing page, moodboard, or imitation of a design
gallery.

## What should remain true

The current homepage has the right basic proposition:

- Nischal's name is the first fact.
- A brief introduction explains the research.
- The portrait makes the page personal without becoming a hero image.
- The CV is easy to find.
- Selected publications establish the work directly.
- Navigation, sunlight, paper, crop marks, and the ink register remain global
  rather than becoming homepage novelties.

The redesign should preserve all six points. It should not add a service pitch,
client logos, metrics, testimonials, skills, a résumé timeline, a newsletter
form, or a wall of recent posts.

## Audit of the current page

### What is already distinctive

1. **A real material premise.** The homepage occupies the same changing Lokta
   field as the articles. It already has more atmosphere than most portfolio
   homepages without asking its content to perform.
2. **Useful asymmetry.** The introduction and portrait do not form a centered
   hero. They resemble a text block and a printed plate sharing a sheet.
3. **A bibliography rather than project cards.** The selected works are
   appropriate to a mathematical neuroscience site and connect the home page to
   the article system.
4. **A small ornamental vocabulary.** `❧` and `❡` are enough. More stamps,
   botanical marks, tape, torn edges, or pseudo-handwriting would turn material
   character into a craft-store effect.
5. **Immediate content.** The page is ordinary HTML. Its speed and stability are
   part of its tone.

### What currently feels accidental

The composition is visually plausible but structurally brittle:

- The introduction width is `calc(100% - 22rem)`. Its relationship to the
  portrait is subtraction, not a shared grid.
- The portrait is absolutely placed with `top: 10.35em`, `right: 3.55em`, and a
  viewport-dependent width. It does not participate in the document's layout.
- The homepage inherits the theme's title ornament. At the desktop breakpoint,
  the pseudo-element is `9em` relative to a clamped title, while its position is
  based on the glyph box rather than the visible ink of `❧`.
- The ornament changes from six to nine title-em units at a breakpoint. This is
  why a placement that looks acceptable at one size can drift or jump at another.
- The publication hover uses a hard-coded blue block and white text. The ink
  register repairs much of this through later overrides, but the base component
  still thinks in fixed colors instead of semantic roles.

The durable fix is not another set of offsets. The portrait, title, introduction,
and mark need one authored layout system and one source order.

## How the research was conducted

The survey moved from broad curation to close reading. It intentionally mixed
commercially polished sites, handmade personal sites, scholarly homepages,
editorial archives, current social discussion, and micro-interaction collections.
This prevents either awards-gallery spectacle or IndieWeb nostalgia from becoming
the only lens.

### Broad curation

- [Typewolf's 2026 personal portfolio survey](https://www.typewolf.com/portfolio-sites)
  began with more than 2,500 featured sites and reduced them to 40. Its most useful
  current observation is a move among established designers toward a concise
  about-and-experience page instead of a conventional case-study portfolio.
- [Collected](https://collected.li/) currently draws each visit from a pool of
  more than 5,300 sites. It was useful for spotting repeated visual conventions,
  particularly oversized type, card mosaics, smooth scroll, and theatrical
  transitions.
- [SiteInspire](https://www.siteinspire.com/) and
  [Httpster](https://httpster.net/) provided large, tagged archives of typographic,
  minimal, print-derived, unusual-layout, and personal work.
- [Refs.Gallery's experimental collection](https://www.refs.gallery/collections/experimental-web-design)
  was useful for studying pacing and section sequence.
- [Hoverstates](https://www.hoverstat.es/) and
  [Design Spells](https://www.designspells.com/) isolate specific interactions.
  They are better sources for one well-made detail than for an entire homepage
  identity.

### The personal and poetic web

- [The Index](https://theindex.fyi/) maps independent-web directories rather
  than pretending one gallery can represent the field.
- [PersonalSit.es](https://personalsit.es/),
  [Personal Websites](https://personalwebsites.org/), and the
  [Hacker News Personal Websites Directory](https://hnpwd.github.io/) supplied a
  broad pool of personal, academic, technical, and writing-led sites.
- The [Internet Phone Book](https://internetphonebook.net/) is the clearest
  2025–2026 record of the poetic personal web: an annual printed and online
  directory of hundreds of designers, developers, writers, curators, and
  educators.
- [Naive Weekly](https://www.naiveweekly.com/archive) and the
  [Tiny Awards](https://tinyawards.net/) supplied newer, small, handmade, and
  non-commercial work that larger awards systems overlook.
- [Special Fish](https://special.fish/), [HTML Energy](https://html.energy/),
  [Gossip's Web](https://gossipsweb.net/submit), and
  [Poetic Web](https://poeticweb.com/) helped distinguish lived-in sites from
  merely retro-looking ones.

### Design arguments and current conversation

- Laurel Schwulst's
  [“My website is a shifting house”](https://laurelschwulst.com/e/my-website-is-a-shifting-house/)
  treats a website as a world shaped by its maker rather than a profile supplied
  by a platform.
- Frank Chimero's
  [“The Web's Grain”](https://frankchimero.com/blog/2015/the-webs-grain/)
  argues for fluidity, vertical flow, and arrangements built from content rather
  than a fixed canvas. That argument applies directly to the current portrait
  offsets.
- [The Creative Independent's practical guide](https://thecreativeindependent.com/guides/how-to-make-a-website-for-your-creative-work/)
  begins with a specific purpose and treats each evolution of a site as a way to
  shape how the work is experienced.
- Dan Mall's
  [2025 content-strategy account](https://danmall.com/posts/content-strategy-for-a-200-page-personal-website/)
  makes a useful distinction between content, information architecture, and art
  direction. A site's structure should follow its actual aim, not the default
  portfolio format.
- [Are.na](https://www.are.na/about) and independent newsletters yielded more
  useful current link chains than publicly indexed X searches. X results were
  dominated by Framer launches, template products, and portfolio promotion.
  The useful public exception was the discussion around durable, content-rich
  personal redesigns. This is a description of this research sample, not a claim
  that design conversation has left X altogether.
- The public [Read.cv account](https://x.com/read_cv/highlights) is a useful
  cautionary case. Its attractive hosted Sites product arrived as a fashionable
  personal-web format and then disappeared with the service. The lesson for this
  project is architectural: keep the durable identity, content, and design system
  in the site Nischal owns.
- Several 2025 essays independently describe particularity as a response to
  generic machine-made polish: Ana Rodrigues's
  [defence of unpolished personal sites](https://ohhelloana.blog/in-defense-of-unpolished-websites/),
  Piri's [Human Tools Era](https://pketh.org/the-human-tools-era.html), Dave
  Rupert's [Ubertheme](https://daverupert.com/2025/04/ubertheme/), and Jeffrey
  Inscho's [A Dream for the Web](https://staticmade.com/2025/06/11/a-dream-for-the-web/).
  Their shared point is not to imitate old web aesthetics. It is to let a site's
  choices reveal an actual author.

## What the strongest sites now have in common

### 1. The homepage is an inhabited index

It says who lives here, what occupies their attention, and where a visitor can
go. It does not try to summarize an entire life or convert a visitor.

### 2. One precise intellectual sentence beats a broad professional label

“Researcher,” “designer,” or “PhD candidate” supplies context, but the memorable
line names the actual question or territory. The best homepages make the visitor
understand the person's attention before listing credentials.

### 3. Present tense supplies life without animation

A current question, location, object on the desk, or dated “now” note makes a
static page feel inhabited. Continuous interface motion is not required.

### 4. The work is edited into temporal depths

The clearest sites distinguish some version of:

- what is being considered now;
- what has appeared recently;
- what remains defining or enduring.

This is more useful than one reverse-chronological feed and calmer than a
dashboard.

### 5. One personal mark is enough

A drawing, signature, bit of ASCII, ornamental character, or unusual phrase can
carry authorship. The mark works when its placement and recurrence have intent.
It fails when it floats like a logo pasted over a template.

### 6. Visible curation reads as human

One outside paper, book, image, or link with a sentence of context says more than
an automatically populated feed. As generic content becomes cheaper, selection
and explanation become stronger signs of attention.

### 7. Incompleteness can be honest

“Working notes,” “proposed rooms,” “last rearranged,” and dated shelves show a
practice developing. This should be used sparingly here. The page must still be
academically useful and cannot hide scholarship behind poetic vagueness.

### 8. Speed is part of the aesthetic

The strongest text-led examples reveal their hierarchy before enhancement runs.
They feel like documents, not applications waiting to initialize. This matches
the site's existing division: the environmental plane may live and move, while
the document plane appears immediately.

## Longlist: sites and the mechanisms worth retaining

The “retain” column records a mechanism, not a request to copy the site's look.

| Reference | What it demonstrates | Retain here | Leave behind |
|---|---|---|---|
| [Nikhil Anand](https://nikhil.io/) | A drawn portrait, humane introduction, and scholarship within a whole life | Portrait as authorship; warmth without self-promotion | The full media dashboard on our home |
| [Maggie Appleton](https://maggieappleton.com/) | A precise identity statement followed by described shelves | Clear names and one-line explanations for content territories | Illustrated cards and literal garden language |
| [Andy Matuschak](https://andymatuschak.org/) | Research focus, major projects, working notes, and letters are distinct | Current, recent, and enduring intellectual depths | The enormous archive on the first page |
| [Linus Lee](https://thesephist.com/) | Biography as a linked intellectual map | A research statement whose links reveal the actual territory | Dense credential paragraphs |
| [Jordan Matelsky](https://jordan.matelsky.com/) | Computational neuroscience described plainly and personally | Domain clarity and a small human aside | Generic résumé sectioning |
| [Julia Evans](https://jvns.ca/) | Direct welcome and a durable content archive | Web-native directness and immediate access | Every category expanded on the homepage |
| [Patrick Collison](https://patrickcollison.com/) | A bare index can still express a mind through its categories | Confidence in concise link language | An unexplained index as the whole identity |
| [Bret Victor](https://worrydream.com/) | Work grouped into intellectual territories | Territories based on questions rather than medium | Archive density and tiny scanning targets |
| [Craig Mod](https://craigmod.com/) | Sustained books and projects lead, followed by biography and essays | Enduring work before exhaustiveness | Commerce and subscription machinery |
| [Robin Sloan](https://www.robinsloan.com/) | Compact authorial frontispiece followed by a directory | Conversational authority and a clear threshold | A comprehensive directory on this home |
| [Frank Chimero](https://frankchimero.com/) | Radical concision and strong editorial ordering | Confidence, quiet hierarchy, and whitespace | Portfolio categories unrelated to research |
| [Derek Sivers](https://sive.rs/) | “Me in ten seconds,” new work, projects, now, and random discovery | Immediate orientation and an honest now layer | The number of utilities and routes |
| [Steph Ango](https://stephango.com/) | Latest work, topic index, and chronology in a restrained system | A small current register and durable typographic order | Topic expansion before enough content exists |
| [Jacky Zhao](https://jzhao.xyz/) | Identity, selected writing, and marginal annotation share an intentionally unequal composition | Let one present-tense research trace inhabit the portrait margin | A permanent sidebar or dense personal knowledge map |
| [Tom Critchlow](https://tomcritchlow.com/) | Direct introduction, current work, and recent writing | Plain present tense | Consulting-site calls to action |
| [Jim Nielsen](https://www.jim-nielsen.com/) | Repeated “I'm …” sections make a life legible | First-person specificity and visible ongoing practice | Testimonials, proof metrics, and total inventory |
| [Mindy Seu](https://mindyseu.com/) | An evolving page can be both practice record and current announcement | A dated, openly maintained page | Density, press proof, and project promotion |
| [Laurel Schwulst](https://laurelschwulst.com/home/) | Writing, websites, worlds, teaching, and today coexist | Interconnection and one present-tense door | Literal house, garden, or world metaphors |
| [Elliott Cost](https://home.elliott.computer/) | Dated, annotated rooms include unfinished and proposed areas | “Last rearranged” and tolerance for a live practice | Domain proliferation and deliberate sprawl |
| [Maisa Imamović](https://maisaimamovic.eu/) | A research life, current work, place, and domestic image coexist | A short NOW line and unpolished humanity | Filter controls and exhaustive career log |
| [Chia Amisola](https://chia.design/) | Tiny ASCII mark, exact cultural position, and deliberate abundance | Cultural and intellectual particularity; one small mark | Overwhelming proof-of-work index |
| [Connie Liu](https://connie.surf/) | A small umbrella mark acts as authorship | Ornament as an optical hinge, not background debris | Desktop dependence and unexplained links |
| [Brennan Brown](https://brennan.day/) | Signature, lucky-cat drawing, “start here,” and current status | Warmth and a recognizably personal trace | Crowded metadata and repeated badges |
| [Everest Pipkin](https://everest-pipkin.com/home) | Handmade HTML/CSS and clear work territories | Visible authorship with graceful no-JS behavior | Artist-portfolio navigation categories |
| [Kelli Anderson](https://kellianderson.com/) | Paper is used to explain physics and mechanism | Treat the paper premise as conceptual, not decorative | Additional folds, cutouts, and paper tricks |
| [Lynn Fisher](https://lynnandtonic.com/) | A bookplate and table of contents establish identity through one exact typographic conceit | Resolve the dingbat as a printer's mark belonging to the name | Blackletter costume, folio pastiche, and novelty for its own sake |
| [Max Böck](https://mxb.dev/) | Multiple themes coexist with a stable writing hierarchy | Stable identity beneath ink variation | Theme novelty becoming the main content |
| [Dan Mall](https://danmall.com/) | A personal motif grows from content strategy and art direction | One motif used consistently | Marketing modules and floral spectacle |
| [Low-tech Magazine](https://solar.lowtechmagazine.com/) | Infrastructure, page weight, and dithered images become material identity | Performance made visible through restraint | Server statistics and dither as borrowed style |
| [Special Fish](https://special.fish/) | Tiny present-tense traces make a web space feel inhabited | One small, hand-edited trace | A communal stream on the homepage |
| [anaiis](https://www.anaiis.world/) | A typographic rosette opens into layered navigation | A mark can quietly unfold meaning | Concealed primary navigation and poetic delay |
| [Lona Lih](https://lonalih.com/) | Content stacks like a cairn with lightly distorted SVG texture | Irregularity can remain balanced | Decorative distortion on reading text |
| [Typohypergraphic Object](https://www.typohypergraphicobject.page/) | Images arrive through print-like hue and saturation stages | Materially meaningful image treatment | Type-out delay and staged first paint |
| [Three Zero Five](https://threezerofive.studio/) | Live wind subtly changes typography | Ambient data can create presence | A second environmental system competing with sunlight |
| [Nicky Case](https://ncase.me/) | Verbs such as play, read, and watch invite active exploration | Human route names when the content supports them | Illustrative spectacle unrelated to this work |
| [Maya Man](https://mayaontheinter.net/) | An evolving index can remain visibly authored | Permission to revise openly | Playfulness that would dilute the scholarly tone |
| [Chad Mazzola](https://chad.is/) | A very small personal page can still carry reading and side projects | Concision | Generic “About Me” and project-list structure |

## The shortlist

Ten references survive the fit test. Each contributes one part of the proposed
homepage.

1. **Nikhil Anand:** the portrait introduces a person, not a personal brand.
2. **Maggie Appleton:** each content territory explains why it exists.
3. **Andy Matuschak:** current research, working notes, and enduring projects
   have different temporal weight.
4. **Laurel Schwulst:** a homepage can be an interconnected practice without
   becoming a résumé.
5. **Elliott Cost:** a dated “last rearranged” makes maintenance visible.
6. **Chia Amisola:** cultural and intellectual specificity provide identity more
   effectively than generic polish.
7. **Craig Mod:** sustained work deserves the strongest position.
8. **Robin Sloan:** a short, conversational frontispiece can lead into a large
   body of work.
9. **Connie Liu:** the ornament should behave like a signature.
10. **Kelli Anderson:** material character should reveal the subject, not sit on
    top of it.

The visual result should not resemble any one of these sites. The combination is
specific to this site: Nikhil's human threshold, Matuschak's intellectual depths,
Mod's editorial hierarchy, Connie's authored mark, and Anderson's material
discipline, all composed inside the existing Lokta and sunlight system.

## Three composition experiments

### A. Sunlit field-desk frontispiece

**Recommended.** This keeps the present page recognizable and gives it authored
geometry.

```text
┌──────────────────────────── crop-marked Lokta sheet ────────────────────────┐
│                                                                            │
│  [quiet ❧]  Nischal Mainali                         [portrait as plate]     │
│             one exact research proposition          [                  ]     │
│             affiliation · CV                         [                  ]     │
│             AT PRESENT  one current question         [                  ]     │
│                                                                            │
│  SELECTED WORK                                                            │
│  2025  ❡ title and collaborators                         venue / record     │
│  2025  ❡ title and collaborators                         venue / record     │
│  2024  ❡ title and collaborators                         venue / record     │
│                                                                            │
│  FROM THE FIELD NOTES, only when real notes exist                          │
│  two quiet links, no cards                         last rearranged · date    │
└────────────────────────────────────────────────────────────────────────────┘
```

Why it fits:

- It preserves the name, introduction, portrait, CV, and publications.
- It makes the upper area a frontispiece and the lower area an annotated
  bibliography.
- The present-tense line adds life without a feed or animation.
- The portrait and title share a grid, so their alignment remains intentional.
- It can stop after Selected Work today and gain Field Notes only when the real
  archive is ready.

Main risk: over-designing the “At present” line into a status widget. It should
remain one dated sentence written by hand.

### B. Annotated research plate

This is the quietest option. The portrait occupies a narrow right plate; the
left side contains the full introduction. Selected works run below, with one
short marginal annotation explaining the research thread connecting them.

It would look especially rigorous and could print beautifully. It is also less
alive. Unless the research annotation is exceptional, it may read as an elegant
academic CV page rather than a personal home.

### C. Living index

This version follows the introduction with four terse doors: Research, Notes,
Selected Work, and Elsewhere. Each door carries a current or defining item. A
small “on the desk” fragment changes occasionally.

It offers the most discovery and the strongest personal-web character. It is too
early for the current content inventory. Until the real notes and personal
materials replace theme specimens, the structure would promise a richer house
than the site contains.

### Choice

Build A now. Keep the restraint of B in its typography. Allow A to grow toward C
only after the content earns the extra doors.

## Recommended page anatomy

### 1. Identity block

The first line should state the intellectual territory before the institutional
details. The current text can be edited into two functions:

1. a primary sentence about mathematical theories of cognition and the
   representational properties of biological and artificial minds;
2. a secondary sentence giving the PhD and Burak Lab context.

The exact wording needs Nischal's approval. The design should not invent a
grandiose manifesto. “Hi, I'm Nisch” can stay if its informality still feels
right, but it should not delay the strongest research sentence.

The CV remains an ordinary text link. If Google Scholar, ORCID, email, or another
record is later added, use a single quiet line of two or three links. Do not make
social icons.

### 2. Dingbat

The current `❧` should remain. The problem is its layout contract, not the
character.

Replace the inherited pseudo-element on Home with a dedicated decorative span
inside the identity grid. Give it `aria-hidden="true"`, a stable size independent
of the title's font-size, and its own grid area. This makes its visible glyph,
not its generated box, available for optical tuning.

A sensible first proof is approximately 8.5–9.5rem on the wide sheet, 7–8rem on
the middle sheet, and 5–5.75rem on a phone. These are test values rather than a
new contract. The final size should follow the visible `❧`, not its font box.

Its target placement:

- the stem aligns optically with the left edge of the name;
- its upper flourish sits slightly above the name's ascenders;
- its lower flourish ends before the introduction's first baseline;
- it does not touch the top navigation rule, portrait, or crop control;
- its opacity remains low enough that the sunlight, fibres, and ink variation
  still determine its color;
- it scales continuously rather than jumping from six to nine `em` at a
  breakpoint.

The mark may overlap the name's field, but it should never look centered behind
the name. It is an off-register printer's flourish, acting as the optical hinge
between the left crop space and the identity block.

### 3. Portrait plate

Keep the current unboxed, softly fused portrait treatment. Remove only its
absolute placement.

On a wide sheet, the portrait should occupy the final four of twelve internal
columns. Leave one full column of quiet space between it and the introduction.
Align its top to the introduction rather than to the navigation or the top of
the ornament. This makes the eyes sit within the body of the opening text rather
than above it like a masthead avatar.

The current intrinsic dimensions, responsive WebP sources, eager loading, and
reserved aspect ratio are correct for an above-the-fold image. The new layout
must preserve zero layout shift. Do not add a frame, circular crop, caption badge,
or hover treatment.

On a narrow sheet, the portrait enters the document flow after the introduction
and current note. Its width should be limited by the reading measure, not set to
100 percent of the viewport. Centering is acceptable on a phone; a slight
rightward bias can be tested only if it remains calm across portrait and
landscape orientations.

### 4. “At present” register

This is the one recommended content addition. It is not a live status, automatic
feed, or “now playing” widget. It is one sentence, revised when there is something
worth saying and dated honestly.

Good subjects include:

- the research question currently occupying the PhD;
- a paper or mathematical problem being worked through;
- a talk, draft, or experiment that has reached a meaningful stage.

The label uses quiet Jost small caps. The sentence remains Linden Hill. If the
entry has not changed in months, the date makes it a historical trace rather than
fake liveness.

### 5. Selected work as an annotated bibliography

Keep four entries and the `❡` mark. Recompose each entry into three readable
parts:

1. year;
2. title and compact collaborator line;
3. venue or record type.

The title carries the primary link. The venue may link separately when useful.
Small `doi`, `arXiv`, journal, or preprint suffixes can reuse the article system's
external-record vocabulary. Avoid abstracts, thumbnails, pills, citation counts,
and “featured” badges.

On wide screens, years occupy a narrow left register and venues a quiet right
register. On smaller screens, venue and collaborator information fold under the
title. The source order remains year, title, metadata.

Preserve the characteristic ink event on hover and focus, but confine the fill to
the linked title rather than flooding a whole multi-line citation. The transition
can combine an ink shift, a firmer underline, and a faint transparent wash that
lets the paper show through. It must use the current ink's semantic tokens rather
than fixed blue and white.

### 6. Field notes, later

Do not show recent writing until the public archive contains the intended work
rather than theme specimens and private test material. When that threshold is
met, add exactly two recent or chosen notes below the bibliography. The heading
should be “From the field notes” or similarly plain, not “Latest insights.”

Each entry needs a title, date, and one restrained line of context. No thumbnail,
read time, tag cloud, or carousel.

### 7. Maintenance trace

A tiny “last rearranged · 21 July 2026” line may sit at the lower edge of the
home composition. It should describe an actual editorial change, not update on
every build. The phrase suits the handmade web without pretending the homepage
is unfinished.

## Responsive geometry

The layout should build up from source order, following the web's grain.

### Wide sheet

Within the existing 992-pixel body, the usable Home area becomes a twelve-column
grid. A practical starting relationship is:

- identity: columns 1–7;
- quiet interval: column 8;
- portrait: columns 9–12;
- selected work: columns 1–10, close to the established 720-pixel reading
  measure, with the final two columns left quiet;
- bibliography year: a narrow fixed register;
- bibliography body: the flexible center;
- bibliography venue: a restrained right register.

The proportions matter more than a fashionable twelve-column label. The test is
whether the whitespace between identity and portrait feels related to the outer
crop spaces and whether the bibliography can be scanned without line fragments.

### Middle sheet

At the first width where the portrait makes the introduction measure cramped,
move to an eight-column relationship rather than continuously squeezing both:

- identity: columns 1–5;
- interval: half to one column;
- portrait: final two to three columns;
- works: full width, with venue beneath the title.

The breakpoint should be chosen by collision in real content, not by the name of
a device. The title, portrait, and `❧` should not jump visibly when crossing it.

### Narrow sheet

Use one source-ordered column:

1. name and mark;
2. primary research sentence;
3. affiliation and CV;
4. present note;
5. portrait;
6. selected work;
7. later, field notes;
8. maintenance trace.

The crop controls already claim the upper corners. The title block must clear
their real hit areas, not merely their visible icons.

## Type, color, and surface

No new typeface is needed.

- Linden Hill continues to hold identity, prose, titles, and publication text.
- Jost holds labels, years, venues, and compact record metadata.
- The dingbat remains part of the Linden Hill/ornamental vocabulary.
- Mathematics remains in the established math face and does not enter the home
  title.

No new palette is needed. Every new role must map to the ink register:

- primary ink;
- secondary ink;
- link ink;
- accent/active ink;
- hairline;
- translucent wash;
- portrait veil.

The page must be checked in Lokta Hybrid, Ef Arbutus, Ef Elea Light, Ef Arcadia,
Ef Cyprus, and Modus Operandi Tinted, in both shade and sunset. No element should
depend on a particular blue, red, green, or amber value to establish hierarchy.

The paper should remain visible through hover states and ornaments. Do not add
opaque paper-colored panels. The background already supplies depth, texture, and
movement.

## Motion and interaction

The background owns continuous motion. The homepage document should remain
still.

Allowed:

- the existing shade/sunset and ink-register transitions;
- short color or underline transitions on links;
- the existing slow portrait treatment during a light-mode change;
- immediate focus states with no animation dependency.

Not allowed:

- scroll reveal;
- typewriter text;
- parallax portrait;
- hover-dependent descriptions;
- animated counters;
- draggable papers;
- wind-reactive type;
- cursor effects;
- a second ambient scene.

The most novel choice here is restraint: live sunlight behind a document that
appears and responds immediately.

## Cultural specificity without decoration

The Lokta surface is already a Nepal-related material reference. It should not be
reinforced with generalized Himalayan silhouettes, prayer flags, mountain icons,
postal stamps, or decorative Devanagari chosen only for atmosphere.

Stronger forms of specificity would be content supplied by Nischal:

- an exact place or institution when relevant;
- a research question shaped by his actual work;
- a correctly written name in another script if he uses it himself;
- a photograph, book, plant, or field observation with a real story;
- one outside paper or object selected with personal context.

These belong because they are true, not because they make the site look more
Nepali.

## What the wide survey tells us not to do

- No bento grid.
- No oversized 12–20vw name filling the first viewport.
- No centered hero with a pill-shaped “available for work” badge.
- No portrait in a circle or rounded card.
- No skill chips, technology logos, publication statistics, or citation counters.
- No glass panels over the Lokta paper.
- No project carousel or horizontal scroll.
- No black cursor blob, magnetic buttons, or WebGL introduction.
- No page-load veil, staged text reveal, or delayed image for atmosphere.
- No literal desktop, desk, folder, paper stack, or corkboard interface.
- No extra foliage, coffee rings, tape, torn paper, folds, or faux ink smudges.
- No automatic “currently listening/reading” APIs.
- No generic social icon row.
- No claims such as “exploring the intersection of” or “passionate about” when a
  concrete research sentence can do the work.

Awards galleries over-reward spectacle because spectacle is easy to judge in a
thumbnail. The personal-web sources sometimes over-reward eccentricity for its
own sake. This homepage should take production care from the first group and
authorship from the second, while accepting neither group's excess.

## Implementation sequence after approval

### Pass 1: geometry only

- Preserve the existing content and visual treatment.
- Replace the Home-specific absolute portrait and calculated intro width with a
  shared grid.
- Replace the inherited Home title pseudo-element with a dedicated decorative
  mark.
- Establish one source order for all widths.
- Verify the page before adding content or changing publication typography.

This isolates the user's known problems: dingbat placement, portrait registration,
and responsive gaps.

### Pass 2: frontispiece typography

- Tune name size, line length, intro hierarchy, CV link, and portrait alignment.
- Use optical rather than box alignment for `❧`.
- Test all inks and both light conditions.
- Confirm that the top controls and crop marks remain clear.

### Pass 3: annotated bibliography

- Split selected works into year, title/collaborators, and venue/record roles.
- Replace hard-coded hover colors with semantic ink roles.
- Tune wraps using the longest current title, not placeholder copy.
- Keep the entire list useful without JavaScript.

### Pass 4: one sign of life

- Add the manually written “At present” sentence after Nischal supplies or
  approves the wording.
- Add a genuine “last rearranged” date.
- Do not add recent notes yet.

### Pass 5: optional growth gate

After real notes exist, decide whether two of them improve the home. If not, the
frontispiece and bibliography are complete without them.

## QA and acceptance criteria

### Visual matrix

Inspect at approximately 1440, 1280, 1180, 1024, 820, 768, and 390 pixels:

- shade and sunset;
- all six selectable inks;
- default, hover, focus, visited, and active states;
- long and short publication titles;
- portrait loaded and temporarily unavailable;
- reduced motion, increased contrast, and forced colors;
- screen and print.

### Composition gates

- The ornament stays registered to the name without a breakpoint jump.
- The portrait never overlaps text, nav, crop controls, or the palette control.
- The identity-to-portrait gap feels deliberate at every intermediate width.
- On wide screens, inner whitespace relates to both outer crop spaces.
- On phones, the source order reads naturally without duplicated content.
- Selected works wrap as bibliography entries, not isolated fragments.
- No element becomes a card accidentally in one ink or mode.

### Performance gates

- The home content requires no new JavaScript.
- Complete identity text and selected work exist in the first HTML response.
- The portrait keeps explicit intrinsic dimensions and responsive local sources.
- No new font, remote image, analytics request, or third-party embed is added.
- Layout shift remains effectively zero.
- Fast scrolling never reveals blank document regions.
- The background continues independently and does not delay the home document.

### Accessibility gates

- The visual mark is hidden from assistive technology.
- The heading order contains one clear page-level name.
- Links retain visible focus in every ink and light mode.
- No information exists only on hover, color, motion, or marginal placement.
- The portrait has useful alternative text without duplicating the whole intro.
- Touch targets near the crop controls do not overlap.

## Final recommendation

The best successor is not a reinvention. It is a more exact version of what the
homepage already wants to be.

Build the frontispiece grid, fix the dingbat structurally, register the portrait
to the introduction, and typeset selected work as an annotated bibliography.
Stop there and live with it before adding a present-tense research line or recent
notes; visual review showed that the current content does not yet need either.

The sunlight makes the place alive. The paper makes it particular. The portrait
makes it human. The research sentence and bibliography should make it Nischal's.
