from django.urls import path
from job_api.views.job_add_view import JobAddView
from job_api.views.job_list_view import JobListView
from job_api.views.job_show_one_view import JobShowOneObjectView
from job_api.views.job_delete_view import JobDeleteView
from job_api.views.job_update_view import JobUpdateView
from job_api.views.job_filter_view import JobFilterView


urlpatterns = [
    path('add/', JobAddView.as_view(), name='job-add'),
    path('list/', JobListView.as_view(), name='job-list'),
    path('show/<int:job_id>/', JobShowOneObjectView.as_view(), name='job-show'),
    path('delete/<int:pk>/', JobDeleteView.as_view(), name='job-delete'),
    path('update/<int:pk>/', JobUpdateView.as_view(), name='job-update'),
    path('filter/', JobFilterView.as_view(), name='job-filter'),
]
