FROM node:22-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHON_EXECUTABLE=/opt/venv/bin/python

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 python3 python3-venv \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

COPY ai_model/requirements-inference.txt ./ai_model/requirements-inference.txt
RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir -r ai_model/requirements-inference.txt

COPY package.json ./package.json
COPY backend/package.json ./backend/package.json
RUN npm install --prefix backend --include=dev

COPY ai_model/predict.py ai_model/extract_features.py ./ai_model/
COPY ai_model/output/feature_scaler.joblib ai_model/output/moocare_triage_xgboost.joblib ./ai_model/output/
RUN python -c "import joblib; joblib.load('ai_model/output/feature_scaler.joblib'); joblib.load('ai_model/output/moocare_triage_xgboost.joblib')"
COPY backend ./backend

RUN npm run build --prefix backend \
    && npm prune --prefix backend --omit=dev

EXPOSE 5000

CMD ["npm", "--prefix", "backend", "run", "start"]
