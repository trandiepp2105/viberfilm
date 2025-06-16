import os
from elasticsearch_dsl import Document, Text, Date, Float, Integer
from elasticsearch_dsl.connections import connections

# Kết nối với Elasticsearch sử dụng biến môi trường
ELASTIC_HOST = os.getenv('ELASTIC_HOST', 'http://elasticsearch:9200')
ELASTIC_USERNAME = os.getenv('ELASTIC_USERNAME', 'elastic')
ELASTIC_PASSWORD = os.getenv('ELASTIC_PASSWORD', '123456')

connections.create_connection(
    hosts=[ELASTIC_HOST],
    http_auth=(ELASTIC_USERNAME, ELASTIC_PASSWORD)
)

# 🔹 MovieIndex để index phim
class MovieIndex(Document):

    # def __init__(self, **kwargs):  
    #     super().__init__(**kwargs)  
    #     self.hosts = kwargs.get('hosts', ['http://elasticsearch:9200'])  # Giá trị mặc định
    #     self.http_auth = kwargs.get('http_auth', ('elastic', '123456'))  # Giá trị mặc định
    #     self.connection = None
    #     self.connect()  

    # def connect(self):
        
    #     self.connection = connections.create_connection(
    #         hosts=self.hosts,
    #         http_auth=self.http_auth
    #     )

    #     if self.connection.ping():
    #     else:
    movie_name = Text(analyzer='standard', fields={'keyword': Text()})
    movie_id = Integer()

    class Index:
        name = 'movies'  # Tên index trong Elasticsearch

    def save(self, **kwargs):
        return super().save(**kwargs)

# 🔹 SeasonIndex để index mùa
class SeasonIndex(Document):

    # def __init__(self, **kwargs):  
    #     super().__init__(**kwargs)  
    #     self.hosts = kwargs.get('hosts', ['http://elasticsearch:9200'])  # Giá trị mặc định
    #     self.http_auth = kwargs.get('http_auth', ('elastic', '123456'))  # Giá trị mặc định
    #     self.connection = None
    #     self.connect()  

    # def connect(self):
        
    #     self.connection = connections.create_connection(
    #         hosts=self.hosts,
    #         http_auth=self.http_auth
    #     )

    #     if self.connection.ping():
    #     else:
    season_name = Text(analyzer='standard', fields={'keyword': Text()})
    season_id = Integer()

    class Index:
        name = 'seasons'  # Tên index trong Elasticsearch

    def save(self, **kwargs):
        return super().save(**kwargs)

# Tạo index nếu chưa có
if not MovieIndex._index.exists():
    MovieIndex.init()

if not SeasonIndex._index.exists():
    SeasonIndex.init()
