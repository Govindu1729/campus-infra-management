**Interactive Academic Block Floor Plan Web App**

Feasibility, approach, tech stack and effort estimate for building a clickable visual interface from the PPTX floor plans linked to the Excel space allocation sheet.

# Is it possible?

Yes, this is possible, and it's a well-understood kind of project. It's moderately complicated, mainly because of the data cleanup rather than the coding.

# How it works in simple words

A PPTX file is a zipped bundle of XML files. Every shape on a slide (rectangle, polygon, room outline, text label) is stored with its position, size, and shape outline. So the coordinates you need already exist inside the file, and you only need to pull them out.

The pipeline has three steps:

1. **Extract:** A one-time script reads the PPTX and, for each shape on the academic block slides, records its ID, position, size, outline points, and any text inside it (such as a room number).
2. **Link:** Each shape is matched to a row in your Excel sheet using a shared key, usually the room number or space ID. This gives you a table of shape coordinates joined to space information (department, occupant, area, type, and so on).
3. **Display:** The web app draws those shapes as clickable regions on top of the floor plan. Hovering shows a tooltip, and clicking opens a details panel.

# Showing the plan visually

You have two options for the background:

- **Export the slide as an image (PNG or SVG)** and draw invisible clickable shapes over it. This is the easiest and looks exactly like your original.
- **Redraw the shapes yourself** as SVG from the extracted coordinates. This is cleaner, sharper when zoomed, and lets you color rooms by department or status. It takes a bit more effort.

Recommendation: the SVG route, since the hover highlighting and color-coding look much better.

# Tech stack

Your stack of React and MySQL is fine. I'd add:

- **Python** (with python-pptx and pandas/openpyxl) for the one-time extraction and for importing the Excel data into MySQL. You can use Node instead, but Python is easier for this.
- **A backend API** (Node/Express or Python/FastAPI) so React can fetch room data from MySQL.
- **SVG** for the interactive map, which needs no extra library. react-zoom-pan-pinch is useful if you want zoom and pan.

# Where the difficulty is

- **Matching shapes to Excel rows.** This is the biggest risk. If the room numbers in the PPTX labels don't exactly match the Excel sheet (typos, "Room 101" vs "101", merged cells), you'll need to clean them up. Some shapes may need manual mapping.
- **Grouped or rotated shapes.** PowerPoint nests groups and rotations, so coordinates need to be recalculated into one common system. This is solvable but fiddly.
- **Shapes drawn as images or text boxes.** If some rooms are pictures or loose text rather than real shapes, extraction is harder and you may have to redraw them.
- **Excel structure.** Merged cells and multiple header rows need to be flattened before they go into MySQL.

# Rough effort

For one developer who knows React:

| **Task**                                     | **Rough effort**  |
| -------------------------------------------- | ----------------- |
| Extraction and Excel cleanup                 | A few days        |
| Database and API                             | 1 to 2 days       |
| Interactive map with hover and click panels  | 3 to 5 days       |
| Polish (search, filters, color-coding, zoom) | About a week more |

A working prototype for one academic block floor can be done in a few days, and the rest is repeating the process for other floors.

# Next step

Review the two uploaded files to assess how clean the shapes are, identify the shared key between the PPTX and Excel, and flag problems to expect.