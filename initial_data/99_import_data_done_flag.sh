#!/bin/sh

# Script này được thực thi bởi entrypoint của MySQL sau khi tất cả các file .sql
# trong /docker-entrypoint-initdb.d đã được xử lý.

echo "----------------------------------------------------"
echo "Attempting to create import completion flag..."
echo "----------------------------------------------------"

# Đường dẫn đến file cờ hiệu.
# Nên đặt nó trong volume dữ liệu của MySQL (/var/lib/mysql)
# để healthcheck có thể kiểm tra sự tồn tại của nó trong cùng volume context.
FLAG_FILE="/var/lib/mysql/initial_data_imported.flag"

# Tạo file cờ hiệu
touch "${FLAG_FILE}"

if [ -f "${FLAG_FILE}" ]; then
  echo "SUCCESS: Import completion flag created at ${FLAG_FILE}"
else
  echo "ERROR: Failed to create import completion flag at ${FLAG_FILE}"
  # Bạn có thể muốn script thoát với mã lỗi ở đây nếu việc tạo flag thất bại
  # exit 1
fi

echo "----------------------------------------------------"