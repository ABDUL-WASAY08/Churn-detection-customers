# Universal Base Image: Linux OS + Python 3.10 installation pre-configured
FROM python:3.10-slim

# Universal / Custom Hybrid: Container ke andar internal directory set kar raha hai
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY train_model.py .

EXPOSE 8000

CMD ["uvicorn", "train_model:app", "--host", "0.0.0.0", "--port", "8000"]