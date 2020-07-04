# art.pprice.me

> Creative coding experiments for pen plotters

This repository contains the sources to [art.pprice.me](https://art.pprice.me/). It is a personal website and mostly a weekend project, so quality of this repository may leave a little to be desired.

## Goals

- Generate content (SVG) that is designed to be plotted using Evil Mad Scientist's [AxiDraw V3](https://axidraw.com), mostly via their [Inkscape Plugin](https://wiki.evilmadscientist.com/Axidraw_Software_Installation)
- Reduce the amount of boiler-plate code and setup required for plotting (paper sizes, alignment, layers)
- Enable live previews while hacking

## Future improvements

- Move canvas interactions to web-workers, these have a tendency to be computationally expensive and will hang the UI thread
- Support multiple single pass aggregations against image data (e.g. luminance AND hue in a single pass)
- Refactor `<RenderContainer />` into smaller components, its too big!
- Add support for [Hershey Text](https://wiki.evilmadscientist.com/Hershey_Text) svg fonts
- Transition between configuration states instead of clear and redraw (current approach)

## Installation

This repository uses `yarn` (classic) for package management, if you do not have it installed, follow instructions at [yarnpkg.com](https://classic.yarnpkg.com/lang/en/).

After cloning

```
yarn install
yarn dev
```

And visit http://localhost:3000/

## Plotting

Generated SVGs are designed to be plotted using a pen plotter, specifically an [AxiDraw V3](https://axidraw.com). SVGs contain meta-data to be compatible with Inkscapes attribute namespace for layers, which can be used for plotting different colors (or whatever you wish).

- Click the Settings Icon toggle on a page
- Download an SVG
- Open in inkscape
- All layers added to an artwork will have a sequential id in front of them
  - Default Layers
    - `0` - Contains all drawn layers
    - `1` - Attribution
    - `2` - Container overlay (border)
  - Custom layers `3..n` as child layers of `0`
- To plot specific layers, within the AxiDraw software, navigate to the Layers, tab and enter the layer prefix you wish to draw (e.g. `4` for `4-my-cool-name`)

## Shoutouts

A few shoutouts to some of the packages used for this project.

- [flatten-js](https://github.com/alexbol99/flatten-js) - 2d geometry
- [d3](https://d3js.org/) - Data Driven Documents, SVG munging
- [typescript](https://www.typescriptlang.org/) - Typed javascript
- [react](https://reactjs.org/) - User interface
- [next.js](https://nextjs.org/) - Serving, page rendering, fast-refreshing
- [material-ui](https://material-ui.com/) - UI Components
- [file-saver](https://github.com/eligrey/FileSaver.js/) - SVG Savin'
