# The index and the sheet: a study

Status: prototype on `experiment/index-room`, October 2026. Not accepted; the
current rules remain in `DESIGN_LANGUAGE.md`.

## The brief

Nisch admires andrewtrousdale.com for two things: its index card, "the way it
opens and shows", and the feeling of an open space that the index controls.
The site should gain that structure while keeping what it already is: the
sunlit room, the field notes, the inks, and the printer's vocabulary.

## How it got here

1. A network map of the research was set aside; the two spaces were the point,
   not the graph.
2. The first prototype put a slip on the left and the open room on the right,
   showing one figure at a time; a note opened first as a card of figures.
   Nisch's notes on it:
   - the original's cropped page should organise the stage;
   - an opened note should be the whole post, with the index carrying its
     contents;
   - a portrait alone is not enough for the landing page.
3. A fresh-eyes critic, recording every passage, found the same weak points:
   the card squeezed into a tab on the way to the article, the controls
   jumped between corners, and long lists overflowed the card.
4. The second prototype went too far into detail: a pinned sidebar and a
   crowded home page. The third set three columns (index, cropped page,
   margin) on every page. Nisch's notes on it:
   - the card's fibre texture and rules still read as "marks"; it should be
     simpler, and learn from the reference's plain card;
   - the index column took too much of the width;
   - the crop marks sat cramped at the top edge;
   - no plate on the home page.
5. The fourth opened the home page with the latest field note beneath the
   frontispiece. Nisch wanted no post on the landing and a minimal home,
   wondered about the original's list of papers without repeating the card,
   and asked for the card closer and the whole composition centred, with space
   above and below.
6. The fifth made the home a title page and the card its list of work. Nisch's
   notes on it:
   - the card had become too plain: it should be more present, learning
     from the reference's marks, levels and styling, a little larger and
     more spacious, and not grey;
   - the columns need not be equal: the stage should have more of the width;
   - the crop marks stood too far from the content, perhaps they should fit
     around it.
7. The sixth trimmed the crop marks to the page with its margin column
   inside. Nisch, much happier, asked for one change: the frame should end
   sooner on the right, with a note's margin beginning at the page's edge, so
   the text itself can be wider, and a little more room between the card and
   the text.

## The idea now

The larger goal holds over the literal notes: a calm control index and a
spacious stage. Two pieces of paper lie in the sunlit room, the index card and
the page, and the pair is centred in the window.

- **The page is the stage.** Its crop marks are trimmed to the text it
  prints, at the opened article's own measure (37.5 rem at 1440 px). A page
  shorter than the window lies in the middle of the room, at least as tall as
  the open card; a longer one starts near the top. The light and ink controls
  stay on its upper corners.
- **The margin hangs from the page's right trim.** Sidenotes, a paper's links
  and plate caption, and the portrait begin exactly at the trim line and lie
  out in the room, as marginalia on the site always passed beyond the crop.
  Wide code and figures may run to the trim, never past it.
- **The card stands just outside the page's left trim**, at the height of the
  eye, about 104 px from the text at 1440 px. On a short page it sits inside
  the page's height.
- **The card lists and the page prints.** The card never opens the section
  the page beside it prints whole, so nothing appears twice: on the Papers and
  Field notes pages the card's sections stay closed.
- **The index card** is plain paper, a step lighter than the room by day and a
  step deeper by night, with no texture, border, shadow or radius. Like the
  reference, it has a gutter of marks, rules beneath each row, and levels;
  the marks are the site's own:
  - a leaf (❧) in the accent ink heads it, beside "Index" on the home page
    and Nisch's name, which leads home, elsewhere;
  - a pilcrow (¶) marks Papers and a section sign (§) Field notes, each over
    a rule of fine dots, with a thin + or − to open it;
  - each section opens to its years, and each year to its items: a short title
    over an italic line of record (the collaborators of a paper, the day of a
    note);
  - a pointing hand (☞) in the accent ink marks the item on the page, whose
    title turns italic; an opened note lists its sections beneath its row, on
    a dotted rule.
  Only one section is open at a time. The type is darker than before: labels
  and titles in the full ink, records at seven tenths.
- **The home page** is a title page. It prints the frontispiece as the
  current home page sets it (the name and its leaf, the proposition, the
  affiliation), centred in the page, with the portrait in the margin.
  The card beside it, open on Papers, is the list of work, so the page lists
  nothing; the curriculum vitae is in the card's foot. There is no plate and
  no post.

| Address | The page prints | The margin carries |
| --- | --- | --- |
| `/` | the frontispiece, centred | the portrait |
| `/papers/<id>/` | the paper's record, contribution and plate | links, the note alongside, the plate's caption |
| `/papers/`, `/blog/` | the section printed whole | — |
| `/blog/<slug>/` | the whole field note | its sidenotes and captions |

Short titles keep the card to one line per title at 1440 px. Papers take
`short_title` from `data/selected_works.toml`, and notes from their front
matter. The full title stays on the page itself.

## Motion

- The card keeps one name and one width across pages. Its content changes at
  once and only its flat paper glides, 800 ms on the reference's
  `cubic-bezier(0.16, 1, 0.3, 1)`; being centred, it breathes from the middle.
- The page's frame glides to its next size on the same curve, with the light
  and ink controls riding on its corners. The transition's own box draws the
  crop strokes, so the corners move without stretching. Every page names its
  frame, so a passage to the colophon glides too.
- The printing travels with the frame. The old page lifts away (150 ms)
  before the next one settles (420 ms), so two pages of type never overlap.
- A first visit from outside the site opens the card after a beat, as the
  reference does; returns within the site never replay it.
- Links prefetch on intent. Under reduced motion, passages are instant.

## Layout

- From 1180 px: the card, the page, and the margin column hanging from the
  page's right trim, centred together. At 1440 px the card is 296 px wide,
  the text 600 px, the margin 240 px, and the room shows 72 px on either side.
- 960–1179 px: the page has no margin column, and marginalia follow their
  passage.
- Below 960 px: the card waits folded above the page, so the page comes first.
  On the home page it follows the title page instead, open, since it is the
  list of work.

## Nothing authored twice

- Papers come from `data/selected_works.toml`, one page each, through a
  content adapter.
- "Read alongside" is derived: a note qualifies when the paper's own links
  point to it, or when the note cites the paper's preprint.
- Identity comes from the home page's front matter.
- An opened note's sections come from its own headings.

## Research that informed it

- The reference's card, measured from the local replica, has one motion only:
  an 800 ms height glide with the content swapped at once. A content fade was
  tried there and removed.
- Every open state needs its own address (Seeing Theory lacks one).
- Maggie Appleton and Cyd Stumpel ship cross-document view transitions in
  production. Fading the old page before the new avoids double-exposed text.
- Cross-document transitions run in Chrome and Edge 126+ and Safari 18.2+.
  Firefox ships only same-document transitions, so there pages simply
  navigate and the room's handoff frame keeps the light continuous.

## Open questions

- Two papers have no plate or summary; their pages are sparse. Plates drawn
  from Nisch's own figures would complete them.
- There are no contact links on the site; the card has room for them.
- The colophon, search and missing pages still use the old top navigation.
- At 1180 px the room shows only about 37 px either side.
