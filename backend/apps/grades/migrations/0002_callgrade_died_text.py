from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('grades', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='callgrade',
            name='died',
            field=models.TextField(blank=True, help_text='KPI X at Step Y — why'),
        ),
    ]
