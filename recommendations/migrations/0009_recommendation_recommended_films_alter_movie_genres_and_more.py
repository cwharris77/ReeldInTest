# Generated by Django 4.2.10 on 2024-04-22 20:38

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recommendations', '0008_alter_recommendation_runtime_span_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='recommendation',
            name='recommended_films',
            field=models.ManyToManyField(blank=True, related_name='recommendations', to='recommendations.movie'),
        ),
        migrations.AlterField(
            model_name='movie',
            name='genres',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('Action', 'Action'), ('Adventure', 'Adventure'), ('Animation', 'Animation'), ('Comedy', 'Comedy'), ('Crime', 'Crime'), ('Documentary', 'Documentary'), ('Drama', 'Drama'), ('Family', 'Family'), ('Fantasy', 'Fantasy'), ('History', 'History'), ('Horror', 'Horror'), ('Music', 'Music'), ('Mystery', 'Mystery'), ('Romance', 'Romance'), ('Science Ficti', 'Science Fiction'), ('Thriller', 'Thriller'), ('War', 'War'), ('Western', 'Western')], max_length=13), size=None),
        ),
        migrations.AlterField(
            model_name='recommendation',
            name='genres',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('Action', 'Action'), ('Adventure', 'Adventure'), ('Animation', 'Animation'), ('Comedy', 'Comedy'), ('Crime', 'Crime'), ('Documentary', 'Documentary'), ('Drama', 'Drama'), ('Family', 'Family'), ('Fantasy', 'Fantasy'), ('History', 'History'), ('Horror', 'Horror'), ('Music', 'Music'), ('Mystery', 'Mystery'), ('Romance', 'Romance'), ('Science Ficti', 'Science Fiction'), ('Thriller', 'Thriller'), ('War', 'War'), ('Western', 'Western')], max_length=13), blank=True, null=True, size=None),
        ),
        migrations.AlterField(
            model_name='recommendation',
            name='possible_films',
            field=models.ManyToManyField(blank=True, related_name='possible_recommendations', to='recommendations.movie'),
        ),
    ]