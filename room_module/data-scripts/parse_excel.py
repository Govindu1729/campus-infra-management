import pandas as pd
from sqlalchemy import create_engine

# Uses SQLite - creates a local file 'iitgn_spaces.db' automatically with ZERO setup!
engine = create_engine('sqlite:///iitgn_spaces.db')

excel_path = './CD Office Master Space Allocation.xlsx'
xls = pd.ExcelFile(excel_path)

all_data = []

for sheet_name in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet_name)
    
    current_floor = "Unknown Floor"
    
    for index, row in df.iterrows():
        val_a = str(row.iloc[0]) if pd.notna(row.iloc[0]) else ""
        val_b = str(row.iloc[1]) if pd.notna(row.iloc[1]) else ""
        
        if "Floor" in val_a or "Floor" in val_b or "Floor" in str(row.values):
            for item in row.values:
                if pd.notna(item) and "Floor" in str(item):
                    current_floor = str(item).strip()
            continue
            
        if pd.notna(row.get('Room')) and str(row.get('Room')).strip() != 'nan':
            all_data.append({
                'sheet': sheet_name,
                'floor': current_floor,
                'building': row.get('Building', sheet_name),
                'room': str(row.get('Room')),
                'type': row.get('Type'),
                'allocation': row.get('Allocation'),
                'intended_allocation': row.get('Intended allocation')
            })

final_df = pd.DataFrame(all_data)

# Save to SQLite database file
final_df.to_sql('clean_spaces', con=engine, if_exists='replace', index=False)

# ALSO save directly to a single JSON file for easy frontend access
final_df.to_json('frontend/public/all_spaces.json', orient='records', indent=2)

print(f"Done! Successfully parsed {len(final_df)} rooms into local SQLite database & frontend JSON!")