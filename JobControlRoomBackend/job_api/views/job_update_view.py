from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from job_api import serializers, models


class JobUpdateView(APIView):
    """
    JobUpdateView, iş başvurusu güncelleme işlemleri için kullanılır.

    Güncellenebilir alanlar:
    - status
    - cover_letter
    - contact_email
    - notes
    - application_url
    """

    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            job_application = models.JobApplicationItem.objects.get(pk=pk, user=request.user)
        except models.JobApplicationItem.DoesNotExist:
            return Response({"error": "Job application not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = serializers.jobApplicationItemSerializer(job_application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
