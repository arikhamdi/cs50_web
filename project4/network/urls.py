
from django.urls import path

from . import views

urlpatterns = [
    # pages
    path("", views.index, name="index"),
    path("profile", views.show_profile, name="show_profile"),
    path("following", views.show_following, name="show_following"),

    # users
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
