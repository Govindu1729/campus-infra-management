How to Edit the IITGN Space Allocation App

(Simple step-by-step guide for beginners)

This document tells you exactly how to change data, add rooms, change floor plans, and update what people see on the screen.



1. How to change room data (allocation, type, add new rooms, etc.)

All the room information comes from one Excel file.

Step-by-step:





Open the Excel file:

CD Office Master Space Allocation.xlsx

(It is usually in the project root or in the attachments / data folder.)



Find the sheet for the building you want to change (for example AB3, AB4, AB5…).



Edit any cell you want:





Room number



Type (Office, Lab, Classroom, Utility, Meeting Room, etc.)



Allocation



Intended allocation



To add a completely new room:





Go to the correct floor section inside that building sheet.



Add a new row with Building, Room, Type, Allocation, Intended allocation.



Save the Excel file.



Re-generate the data file that the website uses:





Open a terminal in the project folder.



Run the parser script (the exact command depends on your setup, usually):

python data-scripts/parse_excel.py

or

python parse_excel.py



This will update the file public/all_spaces.json (or all_spaces.json).



Refresh the website in the browser (press F5 or Ctrl+R).
The new data should now appear.



Important: After changing the Excel, you must run the parser script. Just saving the Excel is not enough.



2. How to change / add a floor plan image (blueprint)

The visual map shows a background image for each building + floor.

Naming rule (very important):

The image file must be named like this:

ab3_floorplan.png
ab4_floorplan.png
ab5_floorplan.png
...





Use lowercase building code



Always end with _floorplan.png

Where to put the image:

Put the image file inside the public folder of the frontend:

frontend/public/ab3_floorplan.png

Steps:





Prepare your new floor plan image (PNG is best).



Rename it correctly, for example: ab3_floorplan.png



Copy / paste the file into the public folder.



If an old file with the same name exists, replace it.



Refresh the website.



Click “Show Blueprint” if it is hidden.

That’s it. The map will now use the new image.



3. How to move / resize the room boxes on the visual map

Only admin users can do this.





Click the Login button (top right).



Use the default admin account (or any admin account you created):





Username: admin



Password: admin123



After login you will see “admin” next to your name.



Go to Visual Layout.



Drag any room box to move it.



Hover over a box → a small blue circle appears at the bottom-right corner → drag that circle to resize.



When you are happy with the positions, click the blue Save Layout button.



The positions are saved permanently for that building + floor.

Guests (people who are not logged in, or logged in as guest) can only look and click on rooms. They cannot move or save anything.



4. How to add more admin users





Login as an existing admin.



Click the + Admin button (next to your username).



Type a new username and password (password must be at least 6 characters).



Click Create Admin.



The new person can now login with those details and will also be able to edit layouts.



5. Where important files live







What you want to change



File / Folder





Room data (Excel source)



CD Office Master Space Allocation.xlsx





Data the website actually reads



public/all_spaces.json





Floor plan images



public/abX_floorplan.png





Saved box positions



public/layouts/AB3_Ground_Floor.json (etc.)





Admin usernames & passwords



data/users.json (passwords are encrypted)





Login & save code



app/api/... and lib/auth.ts



6. Common problems & fixes

I changed the Excel but nothing changed on the website
→ You forgot to run the Python parser script. Run it and refresh the browser.

The floor plan image does not appear
→ Check the file name is exactly ab3_floorplan.png (lowercase) and it is inside the public folder.

I cannot drag the boxes
→ You are not logged in as admin. Click Login and use an admin account.

Save Layout button says error
→ Make sure you are logged in as admin. Also check that the public/layouts folder exists and the server can write files.

I want to change the default admin password
→ Easiest way: login as admin → create a new admin with a strong password → then delete the old admin entry from data/users.json (or ask a developer to do it).



Quick checklist for adding a brand-new building





Add a new sheet in the Excel with the building data.



Run the parser script → all_spaces.json updates.



Put a floor plan image named abXX_floorplan.png into public/.



Refresh the website → the new building tab appears.



Login as admin → arrange the room boxes → click Save Layout.

Done!