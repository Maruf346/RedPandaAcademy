from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('progression', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assignment',
            name='sets',
            field=models.CharField(
                default='2',
                help_text='Sets to complete, or a study instruction from a missed quiz',
                max_length=255,
            ),
        ),
    ]
