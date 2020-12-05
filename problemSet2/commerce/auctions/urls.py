from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("new", views.new, name="new"),
    path("listings/<int:id>", views.single_listing, name="single_listing"),
    path("watchList", views.show_watchlist, name="watchlist"),
    path('categories', views.show_categories, name="show_categories"),
    path('categories/<int:id>', views.search_by_category, name="search_by_category"),

    # user routs
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
