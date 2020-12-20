from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', related_query_name='followers', related_name='followers_set')

    def __str__(self):
        return self.username

class Post(models.Model):
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post')
    created = models.DateTimeField(auto_now_add=True)
    like = models.ManyToManyField(User, related_name="user_set")

    class Meta:
        ordering = ('-created',)
    
    def serialize(self):
        return {
            "content" : self.content,
        }


