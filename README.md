# Split Your CSS Data URIs With Broccoli

Pass your tree to broccoli-css-separator and it will split all data uri's
 (eg. inline background images in foo.css) into a separate file (foo-uris.css) using [postcss-separator](https://github.com/Sebastian-Fitzner/postcss-separator).

```application-uris.css``` contains only your data-uris. This file loads asynchronously and only when it is needed. We had an initial load savings of 133.32 KB from our production css thanks to this plugin. The most obvious use-case of this plugin is custom svg icons.

```js
const CSSURISeparator = require('broccoli-css-uri-separator');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');

let appTree = app.toTree();
appTree = new Funnel(appTree, { exclude: ['**/*.css', '**/*.html'] });

const cssTree = new Funnel(appTree, { include: ['**/*.css', '**/*.html'] });
const splitTree = new CSSURISeparator(cssTree);
appTree = new MergeTrees([appTree, splitTree]);

return appTree;
```

## Notes
Be sure to select CSS files *only* in your input tree. `broccoli-caching-writer` will ensure that it can skip if the files have not changed. Be sure to disable sourcemaps (postcss doesn't handle comments) and to use it only in production (because it can be slow).

Code inspired by [broccoli-csssplit](https://github.com/aboekhoff/broccoli-csssplit)

## License
Copyright (c) 2017 Frans Twisk & Izel Nakri, GUTS Tickets. Licensed under the MIT License.
