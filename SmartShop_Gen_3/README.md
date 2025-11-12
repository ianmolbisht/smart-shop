🧰 2. Set Up the Python Backend
Step 1️⃣ – Create and Activate Virtual Environment
cd smartshop
python -m venv venv


Activate it:

Windows:

venv\Scripts\activate


Mac/Linux:

source venv/bin/activate

Step 2️⃣ – Install Dependencies

If you have a requirements.txt file:

pip install -r requirements.txt


Otherwise, manually install:

pip install fastapi uvicorn pandas scikit-learn


Step 4️⃣ – Start Backend Server
uvicorn backend.ml_api:app --reload --port 8000


Expected output:

INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.


✅ Test in browser:
http://127.0.0.1:8000/predict

If it returns

{"error": "No data found in database."}


— that’s fine, it just means the DB is empty.

💻 3. Set Up the React Frontend
Step 1️⃣ – Create React App

If not already created:

npx create-react-app frontend-react


(or use Vite for faster setup)

npm create vite@latest frontend-react -- --template react


Then:

cd frontend-react
npm install


Step 3️⃣ – Start Frontend
npm start


Expected output:

You can now view your React app in the browser.
Local: http://localhost:3000


🧩 5. Testing the Full Pipeline

Run Backend

uvicorn backend.ml_api:app --reload --port 8000


Run Frontend

npm start


In the Browser

Visit: http://localhost:8000

Click “Run ML Prediction”

React → Fetches from FastAPI → Runs ML → Displays forecast results 🎯

🧼 6. Common Commands
Task	Command
Reinstall dependencies	pip install --upgrade -r requirements.txt
Check installed packages	pip freeze
Stop backend / frontend	Ctrl + C
Deactivate virtual environment	deactivate
Run backend only	uvicorn backend.ml_api:app --reload --port 8000
Run frontend only	npm start
✅ 7. Folder Structure
smartshop/
│
├── backend/
│   └── ml_api.py
│
├── frontend-react/
│   ├── src/
│   │   ├── App.js
│   │   └── components/
│   └── package.json
│
├── database/
│   └── my_database.db
│
├── requirements.txt
└── README.md
