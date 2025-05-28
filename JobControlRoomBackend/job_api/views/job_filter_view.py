from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from job_api import serializers, models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.pagination import PageNumberPagination

class JobPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

class JobFilterView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = JobPagination

    def get(self, request):
        queryset = models.JobApplicationItem.objects.filter(user=request.user)
        
        job_title = request.query_params.get('job_title')
        company_name = request.query_params.get('company_name')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        ordering = request.query_params.get('ordering')  # örn: application_date, -status vb
        
        if job_title:
            queryset = queryset.filter(job_title__icontains=job_title)
        if company_name:
            queryset = queryset.filter(company_name__icontains=company_name)
        if start_date:
            queryset = queryset.filter(application_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(application_date__lte=end_date)
        
        if ordering:
            # Güvenlik için sadece belirli alanlara izin verilebilir.
            allowed_ordering = ['application_date', 'status', 'job_title', 'company_name']
            ordering_fields = [field.strip() for field in ordering.split(',')]
            safe_ordering = [field for field in ordering_fields if field.lstrip('-') in allowed_ordering]
            if safe_ordering:
                queryset = queryset.order_by(*safe_ordering)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = serializers.jobApplicationItemSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
