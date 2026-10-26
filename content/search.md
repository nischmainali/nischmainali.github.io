+++
title = 'Search'
# The field and its results are part of the layout, beside the index card.
layout = 'search'
# Hidden for now: kept here, neither built nor listed.
[build]
  list = 'never'
  render = 'never'
+++

Separate words require every term. A vertical bar separates alternatives, and
double quotes preserve an exact phrase. For example, `R Markdown` requires both
words, `R | Markdown` accepts either word, and `"R Markdown"` finds the phrase.
