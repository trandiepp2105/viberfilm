FROM python:3.10

# Set work directory
WORKDIR /backend
ENV PYTHONPATH=/backend

# Install dependencies
COPY requirements.txt /backend/
# RUN apt-get update && apt-get install -y libpq-dev gcc
RUN apt update && apt install -y default-mysql-client
RUN apt update && apt install -y ffmpeg
# RUN apt update && apt install -y openssl

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# RUN mkdir -p /backend/ssl

# # Tạo chứng chỉ SSL self-signed
# RUN openssl req -x509 -newkey rsa:4096 -nodes \
#     -keyout /backend/ssl/selfsigned.key \
#     -out /backend/ssl/selfsigned.crt \
#     -days 365 -subj "/CN=localhost"

# COPY ../certs /certs


# Run entrypoint.sh
COPY ./entrypoint.sh /backend/entrypoint.sh
RUN sed -i 's/\r$//' /backend/entrypoint.sh
RUN chmod +x /backend/entrypoint.sh

ENTRYPOINT ["/backend/entrypoint.sh"]

# Chạy lệnh mặc định khi container khởi động
# python manage.py migrate && python manage.py runserver_plus 0.0.0.0:8000 --cert-file /certs/localhost.pem --key-file /certs/localhost-key.pem
