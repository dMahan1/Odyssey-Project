FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir \
    flask \
    flask-socketio \
    pybind11 \
    python-dotenv \
    empyrebase

COPY . .

RUN make clean && make

WORKDIR /app/src
EXPOSE 5000

CMD ["python", "pie_server.py"]