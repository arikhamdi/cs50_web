from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:title>", views.get_entry, name="get_entry"),
    path('new', views.new, name="new"),
    path('edit/<str:title>', views.edit, name="edit"),
    path('random', views.random_page, name="random_page"),
    path("search", views.search_entry, name="search_entry")
]
