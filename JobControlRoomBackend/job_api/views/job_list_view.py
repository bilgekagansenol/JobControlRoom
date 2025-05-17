from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from job_api import serializers
from job_api import models


class JobListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        jobs = models.JobApplicationItem.objects.filter(user=request.user)
        serializer = serializers.jobApplicationItemSerializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
