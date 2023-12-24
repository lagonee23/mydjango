# Generated by Django 4.2.6 on 2023-12-24 06:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('board', '0003_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='board',
            name='content',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='board',
            name='readcount',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='board',
            name='regdate',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='board',
            name='title',
            field=models.CharField(default='', max_length=50),
        ),
        migrations.AddField(
            model_name='board',
            name='writer',
            field=models.CharField(max_length=30, null=True),
        ),
    ]
