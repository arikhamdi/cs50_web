# Generated by Django 3.1.3 on 2020-12-06 18:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0009_auctionlisting_winner'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='auction',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, related_name='list_auction', to='auctions.auctionlisting'),
            preserve_default=False,
        ),
    ]
