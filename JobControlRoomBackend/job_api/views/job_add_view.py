from rest_framework.views import APIView
from rest_framework import filters
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions

from job_api import serializers
from job_api import models



class JobAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self , request):
        serializer = serializers.jobApplicationItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user = request.user)
            return Response(serializer.data , status=status.HTTP_200_OK)
        return Response(serializer.errors , status=status.HTTP_400_BAD_REQUEST)
    
    
        