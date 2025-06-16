#!/bin/sh
echo "Waiting for MySQL to be ready..."

# Kiểm tra trạng thái của MySQL, thử lại nếu thất bại
until mysqladmin ping -h "mysql" --silent; do
  echo "MySQL is unavailable - waiting..."
  sleep 5
done

echo "MySQL is ready!"

echo "Waiting for elasticsearch to be ready..."

# Kiểm tra trạng thái của elasticsearch, thử lại nếu thất bại
until curl -s -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" "http://${ELASTICSEARCH_HOST}:9200" | grep -q cluster_name; do
  echo "Elasticsearch is unavailable - waiting..."
  sleep 5
done

echo "Elasticsearch is ready!"

echo "Starting Django migrations and server..."
# python manage.py makemigrations
# python manage.py migrate
# python manage.py create_admin
python manage.py runserver 0.0.0.0:8000


