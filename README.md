# JobControlRoom
![ANA SAYFA](https://github.com/user-attachments/assets/005b325b-d179-4229-ac6b-bf3a3b353581)
![GİRİŞ EKRANI](https://github.com/user-attachments/assets/e6d243e0-5493-40ea-b5c8-cad338839819)
![İŞİNCELEMESİ](https://github.com/user-attachments/assets/a4ed214a-872a-44c5-9b18-debf9185daba)

İş başvurularınızı takip etmek, yönetmek ve güncel durumlarını görüntülemek için geliştirilmiş modern bir Django REST Framework tabanlı backend ve React tabanlı frontend uygulamasıdır.

## Özellikler

- Kullanıcı kayıt, giriş ve profil yönetimi
- JWT veya Token bazlı kimlik doğrulama
- İş başvurusu ekleme, listeleme, güncelleme ve silme
- Başvuruların durumu takibi (Başvuruldu, Mülakat, Kabul Edildi, Reddedildi)
- Başvuru detay sayfası ile ayrıntılı bilgi görüntüleme
- Profil resmi yükleme ve güncelleme
- Swagger ile API dokümantasyonu
- Responsive ve kullanıcı dostu React tabanlı arayüz

## Teknolojiler

- Python 3.10+
- Django 5.x
- Django REST Framework
- React
- drf-yasg (Swagger)
- PostgreSQL / SQLite (İhtiyaca göre)
- Docker (Opsiyonel)

## Kurulum

### Backend

1. Repoyu klonlayın:
    ```bash
    git clone https://github.com/kullanici_adi/JobControlRoom.git
    cd JobControlRoomBackend
    ```

2. Sanal ortam oluşturun ve aktif edin:
    ```bash
    python3 -m venv myenv
    source myenv/bin/activate  # Linux / MacOS
    myenv\Scripts\activate     # Windows
    ```

3. Gerekli paketleri yükleyin:
    ```bash
    pip install -r requirements.txt
    ```

4. Veritabanı migrasyonlarını yapın:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

5. Süper kullanıcı oluşturun:
    ```bash
    python manage.py createsuperuser
    ```

6. Sunucuyu başlatın:
    ```bash
    python manage.py runserver
    ```

### Frontend

- Frontend React projesinin klasörüne gidin ve:
    ```bash
    npm install
    npm start
    ```

## Kullanım

- Tarayıcıda `http://localhost:8000/swagger/` adresinden API dökümantasyonunu inceleyebilirsiniz.
- React arayüzü ile iş başvurularınızı kolayca yönetebilirsiniz.
- Giriş yaparak sadece kendi başvurularınızı görebilir ve düzenleyebilirsiniz.
