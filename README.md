# Songs App

A full-stack project using **Flask (Python)** as backend and **React (JavaScript)** as frontend.  
The app lets you explore songs, search by title, sort, paginate, rate songs, and visualize features like danceability, tempo, and duration.

---

##  Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/atul114/assignment_vivpro.git
cd assignment_vivpro
```
### 2. Start the backend
```bash
# (Optional but recommended) create a virtual environment
python -m venv venv
venv\Scripts\activate or venv/Scripts/activate  # On Windows 
source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run Flask backend
python -m vivpro.app #Backend will start on http://127.0.0.1:5000/
```

### 4. Test the backend APIs
```bash
#GET request on below endpoint to view normalized data in a table
http://localhost:5000/songs/table

#GET request on below endpoint to view song by title=3am
http://localhost:5000/songs/search?title=3am

#POST request on below endpoint to rate a song with id=38td8VabuKlQt72Q2VnhbO
http://localhost:5000/songs/38td8VabuKlQt72Q2VnhbO/rate
#POST request should have Content-Type : application/json
#POST request should have body in json in the format : {"rating": 2}


```

### 3. Start the frontend
```bash

#Open a new terminal at the same location
cd assignment_vivpro

#Frontend Setup (React)
cd frontend
npm install
npm start #Frontend will start on http://127.0.0.1:3000/
```
