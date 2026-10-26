# The index card and the page: a study

Status: accepted by Nisch on 12 October 2026 ("very good! Very excited by it!
Let's keep this direction up") on `experiment/index-room`, and revised after
Nisch's review of 26 October 2026. The accepted rules now live in
`DESIGN_LANGUAGE.md`; this study records how they were reached.
The main state it replaces is archived as `archive/pre-index-card-2026-10-12`.

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
8. The seventh was accepted. The prototype was committed (`16e5a0a`) and
   `main` archived, and a consistency pass followed, with what else to adapt
   from the reference:
   - the colophon, search, and the missing page moved onto the card and the
     trimmed page, and the theme's top bar was retired;
   - from the reference: a connections section ("Alongside") on a paper or a
     note, a section's note set after its "i.", a pointing hand that follows
     the pointer, toggles that point down or up, an arrow that leans home,
     and arrow keys inside the card;
   - left behind: the map as the home page's space, the timeline, spinning
     and blinking marks, the reference's type, orange, and rounded card, and
     its two-card stack for an opened node;
   - the old home ledger, Writing template, contents rail, and their styles
     and scripts were removed, with screenshots of both notes confirming the
     removal changed nothing on the page.
9. Two weeks later, on 26 October 2026, Nisch reviewed the accepted state:
   - bring the portrait into the frame, aligned and sized to it;
   - a better mark than the pointing hand, and the sections named "Selected
     works" and "Writing";
   - hide the colophon and search for now;
   - move the card further left to give the page more room, and make the crop
     marks stronger without letting them distract;
   - remove the empty placeholders from a paper's page;
   - remove the subtitle from the card's Field notes;
   - find the best way to reach the full lists;
   - consider moving the editorial ink into the card, off the top of the page.

   What was done, and why:
   - **The lozenge (⧫)** now marks the item on the page. Twelve marks were set
     in the card by day and by night. The lozenge is an old printer's mark,
     quiet at the card's size and distinct from the leaf at the head.
     Rejected: ✦ and ✶ (they read as the sparkle of generated interfaces, and
     ✶ is the reference's own), ❦ (too sweet), ☙ (it echoes the head's leaf),
     and plain bullets (too slight to mark a place).
   - **Selected works and Writing** name the sections in the card, on their
     own pages, and in the Writing section's title.
   - **The "i." notes went** from both sections. "Subtitle" was read as the
     italic note under a section's head, the only line in the card that read
     like one.
   - **The colophon and search are hidden**, not deleted: their pages are
     neither built nor listed, `index.json` is not generated, and their links
     left the card's foot.
   - **Full list** ends Selected works and Writing, with an arrow that leans
     toward it on hover, and is marked on the list's own page. The section's
     head cannot carry the link, since it is the control that opens the
     section, and an address beside the head would turn the index into a menu
     bar; the end of the section is where a reader who has run down the list
     looks for more.
   - **The ink moved into the card's foot**, opposite the CV. The light stayed
     on the frame's corner: the light belongs to the room, and ink is a choice
     about the printing, which belongs with the index. The frame now carries
     one instrument. A first version kept the registration mark beside the
     word "Ink" and opened the proof slip over the card on solid paper.
   - **The card stands further left.** The page and its margin keep the place
     a centred group would give them, and the card moves toward the window's
     edge by half the room there, at most 3 rem. At 1440 px it stands 87 px
     from the page's trim instead of 48 px, and 35 px from the window's edge;
     at 1180 px, 70 px from the trim and 17 px from the edge.
   - **The crop marks are firmer:** the ink at 72 % instead of 52 %, and
     strokes 1.25 em long instead of 1 em. Four strengths were compared by day
     and by night: 64 % was barely different, 82 % began to draw the eye, and
     72 % matched the page's smallest type.
   - **The portrait is printed inside the home page's frame**, beside the
     title, its top on the name's capitals and its right edge on the page's
     padding. The home page's frame takes in the width of the margin column,
     so the card and the page keep their places. At 1440 px it is 274 px
     wide.
   - **A paper's page lost its plate and the plate's caption**, both empty;
     a figure joins once there is a real one.

   Later the same day Nisch added three notes: the ink selector was too much,
   and should be simpler, elegant and not ostentatious; a post's ending was too
   glaring, with its lines, colours, formatting and placing, and might take a
   dingbat in the background; and the updated mean-field post on `main` should
   come across. Then: "remove 'ink' from the ink color choices, just the
   colors are good enough!"
   - **The ink became a printer's colour bar**, the sibling of the crop marks
     on a press sheet: six small square patches in each ink's heading colour,
     a hairline beneath the ink on the page, no label, nothing that opens.
     Five forms were set in the card's foot by day and by night. A two-tone bar
     of heading and accent was busier, read like flags, and said no more. The
     numerals 1 to 6 printed in each ink were charming but said nothing. Dots
     looked like a generic colour picker. The current ink's name, cycling on
     each press, hid the choice.
   - **The ending went quiet.** References and Notes take a small italic
     heading and one ink at seven tenths, with hanging indents, dotted
     underlines only on links, and no markers, arrows, or rules. A reference's
     way back shows only when the reader is there, and the reference a
     citation led to carries the card's lozenge. The record lost its rule and
     its grid. The title's leaf, mirrored and as faint, closes the note at the
     foot of its column. Three placings were compared: behind the References
     heading, which echoed the title but was easily missed; a small centred
     tailpiece, which was too sweet; and the foot of the column, which brackets
     the note with the title's leaf at the opposite corner. The reversed
     leaf `☙` was rejected because it falls back to a monospaced font.
   - **The nonlinear feature-learning note** now carries Nisch's update from
     `main`, copied unchanged: a new opening, a section on the setup and its
     limits, a new closing section, two more references, and a revision on 26
     October 2026.
   - **The two specimens are unlisted.** Nisch asked to hide "Level sets of a
     smooth field" and "Trying things out". Both were already drafts, which
     production never builds; they now also set `[build] list = 'never'`, so
     a preview still builds them for review but nothing lists them, and the
     card adds one only on its own page.

## Where it landed

A snapshot at acceptance; `DESIGN_LANGUAGE.md` holds the current rules. The
larger goal held over the literal notes: a calm control index and a spacious
stage. Two pieces of paper lie in the sunlit room, the index card and the
page, and the pair is centred in the window.

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
  and titles in the full ink, records at seven tenths. From the final round:
  on a paper or a note an "Alongside" section (⇄) lists what reads with it; a
  section's note follows an "i."; the hand follows the pointer to any item;
  the + and − point down or up as a section is about to open or close; the
  name's arrow leans toward home; arrow keys move through the card.
- **The home page** is a title page. It prints the frontispiece as the
  current home page sets it (the name and its leaf, the proposition, the
  affiliation), centred in the page, with the portrait in the margin.
  The card beside it, open on Papers, is the list of work, so the page lists
  nothing; the curriculum vitae is in the card's foot. There is no plate and
  no post.

| Address | The page prints | The margin carries |
| --- | --- | --- |
| `/` | the frontispiece, centred | the portrait |
| `/papers/<id>/` | the paper's record, contribution and plate | its links and the plate's caption |
| `/papers/`, `/blog/` | the section printed whole | — |
| `/blog/<slug>/` | the whole field note | its sidenotes and captions |
| `/colophon/`, `/search/`, missing pages | the register itself | — |

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

- From 1180 px: the page and the margin column hanging from its right trim
  keep the place a centred group of card, page, and margin would give them,
  and the card stands toward the window's edge by half the room there, at
  most 3 rem. At 1440 px the card is 296 px wide, the text 600 px, and the
  margin 240 px; the card stands 35 px from the window's edge and 87 px from
  the trim, and the room on the right is 70 px. Until 26 October the three
  were centred together, 72 px from either edge.
- 960–1179 px: the page has no margin column, and marginalia follow their
  passage.
- Below 960 px: the card waits folded above the page, so the page comes first.
  On the home page it follows the title page instead, open, since it is the
  list of work.

## Nothing authored twice

- Papers come from `data/selected_works.toml`, one page each, through a
  content adapter.
- "Alongside" is derived in both directions (`layouts/partials/related.html`):
  a note reads alongside a paper when the paper's own links point to it, or
  when the note cites the paper by one of its addresses.
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

- An information page (positions, education, talks, contact) is planned but
  waits on Nisch's content: the CV PDF predates the site's paper records, and
  there are no contact links on the site.
- Paper pages are sparse until their contributions and figures are written;
  nothing holds their place. Figures drawn from Nisch's own papers would
  complete them.
- Search, when it returns, needs its own query examples; its note still gives
  "R Markdown", from the base theme.
- At 1180 px the card stands 17 px from the window's edge and the margin
  column ends 35 px from the other.
