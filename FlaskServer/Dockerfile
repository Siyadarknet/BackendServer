# FlaskServer/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# System deps (optional if needed by numpy/pandas/scikit-learn)
RUN apt-get update && apt-get install -y --no-install-recommends     build-essential     && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code (including model5.pkl)
COPY . .

# Render provides PORT
ENV PORT=10000

# Use Gunicorn to serve Flask app (module:app)
CMD ["gunicorn", "-b", "0.0.0.0:$PORT", "app3:app"]
