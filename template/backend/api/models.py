from django.db import models


class Entry(models.Model):
    title = models.CharField(max_length=200)

    def __str__(self):
        return self.title
