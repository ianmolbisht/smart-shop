import sqlite3
db = r"C:\Users\anmol\OneDrive\Desktop\dbms\smart-shop\SmartShop_Gen_3\database\my_database.db"
conn = sqlite3.connect(db)
rows = conn.execute("SELECT product_name, stock_left, updated_at FROM my_table ORDER BY updated_at DESC LIMIT 5;").fetchall()
for r in rows: print(r)
conn.close()
