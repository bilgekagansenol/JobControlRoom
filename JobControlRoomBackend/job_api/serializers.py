from rest_framework import serializers
from job_api import models


class jobApplicationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.JobApplicationItem 
        fields = '__all__'
        read_only_fields = ['id','application_date','last_update','user']