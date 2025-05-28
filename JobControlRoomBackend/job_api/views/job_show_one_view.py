from rest_framework.views import APIView
from rest_framework import status 
from rest_framework.response import Response

from rest_framework import permissions
from job_api import serializers
from job_api import models



class JobShowOneObjectView(APIView):

    permission_classes = [permissions.IsAuthenticated]


    def get(self , request , job_id):
        try:
            job = models.JobApplicationItem.objects.get(user = request.user , id = job_id)
        except models.JobApplicationItem.DoesNotExist:
            return Response({"error":"job is not found"},status=status.HTTP_404_NOT_FOUND)
        serializer =serializers.jobApplicationItemSerializer(job)
        return Response(serializer.data , status=status.HTTP_200_OK)
    
    