from django.urls import path
from job_api.views.job_add_view import JobAddView
from job_api.views.job_list_view import JobListView

urlpatterns = [
    path('add/', JobAddView.as_view(), name='job-add'),
    path('list/', JobListView.as_view(), name='job-list'),
]
