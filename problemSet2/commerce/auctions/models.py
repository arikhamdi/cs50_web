from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Category(models.Model):
    name = models.CharField(max_length=65)

    def __str__(self):
        return f"{self.name}"

class AuctionListing(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.IntegerField()
    image = models.URLField(blank=True)
    created = models.DateTimeField(auto_now=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="categories")
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="seller")

    def __str__(self):
        return f"{self.title} : {self.price}"

class WatchList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watcher")  
    auction = models.ForeignKey(AuctionListing, on_delete=models.CASCADE, related_name="auction")

    def __str__(self):
        return f"{self.user}"

class Bid(models.Model):
    amount = models.IntegerField()
    listing = models.ForeignKey(AuctionListing, on_delete=models.CASCADE, related_name="listing")
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="buyer")

    def __str__(self):
        return f"{self.amount}"

class Comment(models.Model):
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="author")

    def __str__(self):
        return f"{self.content}"


    