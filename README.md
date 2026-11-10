# MooCare AI

MooCare AI is a cattle health monitoring app with a React frontend and a Node.js API. The app includes herd management, audio recording and analysis, health alerts, and veterinarian review screens. The backend uses MongoDB to store cattle, scan, alert, review, and dataset records.

## Prerequisites

- Node.js and npm
- MongoDB, running locally or available through a MongoDB connection URI
- Python 3 and the packages in `ai_model/requirements.txt` are required for trained audio-model inference. Uploaded audio analysis fails explicitly if the trained model cannot run; it does not report a synthetic prediction as an AI result.

## Install

From the project root, install the frontend dependencies:

```powershell
npm install
```

Install the backend dependencies:

```powershell
npm --prefix backend install
```

Install the Python model dependencies:

```powershell
python -m pip install -r .\ai_model\requirements.txt
```

The trained XGBoost model and scaler are loaded from `ai_model/output/` by default. To use another model directory, set `MOOCARE_MODEL_DIR`. If the PyTorch checkpoint is missing, regenerate the training artifacts from the bundled feature CSV:

```powershell
python .\ai_model\train_models.py
```

To use a particular Python installation from the backend, set `PYTHON_EXECUTABLE` to that interpreter's executable path before starting the API.

## Run the app

Start MongoDB first. Then open two PowerShell terminals in the project root.

In the first terminal, start the API:

```powershell
Set-Location .\backend
npm run dev
```

The backend connects to `mongodb://127.0.0.1:27017/moocare_db` by default and listens on port `5000`.

In the second terminal, start the frontend:

```powershell
npm run dev
```

Open the local URL printed by Vite (by default, [http://localhost:8443](http://localhost:8443)). The frontend proxies `/api` and `/uploads` requests to the backend on port `5000`.

Microphone recording in a mobile browser requires the site to be served over HTTPS. Browsers allow HTTP microphone access only on the same device via `localhost`; opening a plain HTTP network-IP address on a phone will block access. Use the deployed HTTPS address on mobile.

To use a different MongoDB URI or backend port, set these variables in the backend terminal before starting the API:

```powershell
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/moocare_db"
$env:PORT = "5000"
npm run dev
```

The API health endpoint is [http://localhost:5000/api/health](http://localhost:5000/api/health). The API overview is available at [http://localhost:5000/api](http://localhost:5000/api).

## Build

Build the frontend:

```powershell
npm run build
```

Build the backend:

```powershell
npm --prefix backend run build
```

## Deploy with Render

Deploy the backend as a Render Web Service using the Docker runtime:

- Dockerfile path: `backend/Dockerfile`
- Docker build context: repository root (`.`)
- Leave the Docker command override empty; the image starts the API automatically.
- Environment variables: `MONGODB_URI` (Atlas URI) and `CLIENT_ORIGIN` (the public frontend origin)

The backend image installs Python and the XGBoost inference dependencies alongside Node.js. Do not use the old native Node build command for the backend; it does not install the Python model dependencies.

Deploy the frontend as a Render Static Site from the repository root with:

- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL` set to the backend origin, such as `https://moocare-api.onrender.com`

Set `CLIENT_ORIGIN` to the exact static-site origin, including `https://` and without a trailing slash. The frontend uses the Vite development proxy for local `/api` requests and `VITE_API_URL` for deployed requests.

## Dataset import

The backend includes sample CSV and JSON datasets in `backend/data/`. To import the sample CSV into MongoDB, run this from the backend directory:

```powershell
npm run dataset:import -- --file=data/sample-dataset.csv
```

You can also pass a custom dataset name or prevent imported records from being synchronized to the cattle herd:

```powershell
npm run dataset:import -- --file=data/sample-dataset.json --name="My dataset" --no-sync
```

## Project structure

- `src/` — React application, screens, components, and frontend data access
- `backend/src/` — Express API, MongoDB models, routes, and services
- `backend/data/` — Sample datasets
- `ai_model/` — Python audio-analysis scripts and model artifacts
