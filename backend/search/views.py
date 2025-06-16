from django.http import JsonResponse
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import api_view
from elasticsearch_dsl import Q
from search.search_indexes import MovieIndex, SeasonIndex

@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'q', openapi.IN_QUERY, description="Search query.", type=openapi.TYPE_STRING, required=True
        )
    ],
    responses={200: openapi.Response(
        description="List of matching movies or seasons",
        examples={
            "application/json": {
                "results": [
                    {"type": "movie", "id": 1},
                    {"type": "season", "id": 2}
                ]
            }
        }
    )}
)
@api_view(['GET'])
def search_movies(request):
    ''' Query to search for movies and seasons '''
    query = request.GET.get('q', '').strip()
    if not query:
        return JsonResponse({'error': 'Missing query'}, status=400)

    search_query = Q(
        "bool",
        should=[
            Q("multi_match", query=query, fields=["movie_name^3", "season_name^2"], fuzziness="AUTO", prefix_length=2),
            Q("wildcard", movie_name=f"*{query}*"),  
            Q("wildcard", season_name=f"*{query}*"),
            Q("match_phrase", movie_name=query),  
            Q("match_phrase", season_name=query)
        ],
        minimum_should_match=1
    )

    # 
    movie_results = MovieIndex.search().query(search_query)[:50].execute()
    season_results = SeasonIndex.search().query(search_query)[:50].execute()

    results = [{"type": "movie", "id": hit.meta.id} for hit in movie_results] + \
              [{"type": "season", "id": hit.meta.id} for hit in season_results]

    return JsonResponse({'results': results[:50]})
