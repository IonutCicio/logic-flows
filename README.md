# Logic Flows

## Usage

> [!WARNING]
> Read this instructions before using to use it in the best way.


## Contributing

Please use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commits.


### Developing

Once you've installed dependencies with `npm install`, start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

### TODO

(non si possono editare i messaggi dopo 48 ore)

1. [x] handle associations creation
2. [x] handle generalization creation 
3. [ ] handle association classes 
4. [x] snap classes dimensions to grid
    - [x] the `width` and `height` are multiples of `conf.gridSize * 2`
    - [x] the `width` is at least the length necessary to show the attributes / operations and at most the `width` choosen by the user (and snapped) 
5. [x] handle import and export of JSON
6. [x] when creating a class, open the menu of the class 
7. [x] add icons tooltips
8. [ ] adjust UI (font sizes of stuff etc...) 
9. [x]  add GitHub action that compiles the website to HTML and publishes it to GitHub Pages
10. [x] add shortcuts lik Ctrl+S to save JSON, and shortcuts for tools 
11. [ ] make it work offline (with a ServiceWorker or something, if it's enough to download the html even better)
12. [ ] better operations and attributes handling (specify name, type, multiplicty, whether it has id or not etc...); the goal i s to show different info with different styles (bold for type, italics for {id} etc...)
13. [x] create a `conf` global object 
    - [x] `FONT_SIZE`, `GRID_SIZE`,
    - [ ] `FONT_FAMILY`, `DEFAULT COLORS` for stuff, DEFAULT styles for stuff), add a menu to edit the config 
14. [ ] if the rectangles of two classes overlap, move them in order to not overlap anymore 
15. [x] option to move an attribute from one class to another 
16. [x] filter empty attributes 
17. [x] ability to change attributes order 
18. [x] ability to select multiple objects
    - [ ] and change common properties
19. [x] update paper size when window is resized
20. [x] use `localStorage` in order to remember diagram JSON
21. [ ] keep history of changes in order to go back and forth
22. [x] instead of moving when clicking with mouse, start selection (in selection mode)! In selection mode move only when mouse wheel is clicked (this second part is missing)
23. [x] association delete button (or something) when association is selected (and is only one)
24. [x] add fixed points to associations (and generalizations)
25. [x] TODO: when resizing graph disappears (fixed: I didn't have to call .render() after setting the new dimensions, it did that autmatically)
26. [ ] validated UML (no two attributes with same name, no two classes with same name etc...)
27. [x] cancel button not working 
28. [ ] add README description, otherwise people don't know how to use it correclty
29. [x] allow copy, paste + delete key (or backspace) shotcut to remove object
    - [ ] when pasting, paste on mouse position
30. [ ] "is identifier" isn't enough, you need to be able to specify an optional id number
31. [x] remove grid and stuff when exporting JSON (and export just the graph components)
32. [ ] create icon for project, change name to something nicer (rebranding) 
33. [ ] when pressing Esc, all stuff closes and deselects
