from rest_framework.views import APIView
from rest_framework import filters
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions

from job_api import serializers
from job_api import models



class JobDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self , request , pk):
        try:
            job = models.JobApplicationItem.objects.get(user = request.user ,  id = pk)
        except models.JobApplicationItem.DoesNotExist:
            return Response({"error":"there is no job"}, status=status.HTTP_404_NOT_FOUND)
        job.delete()
        return Response({"deleted":"object deleted"}, status=status.HTTP_200_OK)
    
    
