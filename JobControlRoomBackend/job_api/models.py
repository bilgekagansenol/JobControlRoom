from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class JobApplicationItem(models.Model):
    """
JobApplicationItem modeli, kullanıcının yaptığı iş başvurularını takip etmek için kullanılır.

Alanlar:
- user: Başvuruyu yapan kullanıcı ile ilişki (ForeignKey).
- job_title: Başvurulan iş pozisyonunun adı.
- company_name: İşveren şirketin adı.
- application_date: Başvurunun yapıldığı tarih (otomatik atanır).
- status: Başvurunun durumu (örn: Başvuruldu, Mülakat, Reddedildi, Kabul Edildi).
- cover_letter: Başvuru için yazılan ön yazı (opsiyonel).
- contact_email: İletişim için e-posta adresi (opsiyonel).
- notes: Başvuruya dair ek notlar (opsiyonel).
- last_updated: Son güncelleme zamanı (her kayıt değiştiğinde otomatik güncellenir).
- application_url: Başvurunun yapıldığı iş ilanı linki (opsiyonel).
"""
    STATUS_CHOICES = [
        ('applied', 'Başvuruldu'),
        ('interview', 'Mülakat'),
        ('rejected', 'Reddedildi'),
        ('accepted', 'Kabul Edildi'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE , 
        related_name="job_applications"
    )
    job_title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    application_date = models.DateField (auto_now_add=True )
    status = models.TextField(max_length=20 , choices=STATUS_CHOICES ,default='applied')
    cover_letter = models.TextField(blank=True ,null = True)
    contact_email = models.EmailField(null = True, blank= True)
    notes = models.TextField(blank  = True , null =True)
    last_updated = models.DateTimeField(auto_now_add=True)
    application_url =models.URLField(blank=True ,null= True)

    def __str__(self):
        return f"{self.job_title} at {self.company_name} ({self.status})"