from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post
from .forms import NewPostForm


def pagination(paginator, page):
    # This snippet comes from the book "django by example 2"
    # Receive paginator object and current page
    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer deliver the first page
        posts = paginator.page(1)
    except EmptyPage:
        # If page is out of range deliver last page of results
        posts = paginator.page(paginator.num_pages)
    return posts

def index(request):
    form = NewPostForm()
    posts = Post.objects.all().order_by('-created')

    paginator = Paginator(posts, 2) # Change here for more posts in each page
    page = request.GET.get('page')

    if request.user.is_authenticated:
        if request.method == 'POST':
            form = NewPostForm(request.POST)
            if form.is_valid():
                content = form.cleaned_data['post']
                author = request.user
                Post.objects.create(content=content, author=author)
                return HttpResponseRedirect(reverse('index'))
    return render(request, "network/index.html",{
        'form' : form,
        'posts': pagination(paginator, page)
    })

@login_required
def show_profile(request):
    posts = Post.objects.filter(author=request.user).order_by('-created')

    paginator = Paginator(posts, 10) # Change here for more posts in each page
    page = request.GET.get('page')

    return render(request, 'network/profile.html', {
        'posts' : pagination(paginator, page)
    })

@login_required
def show_following(request):
    posts = Post.objects.filter(author=request.user).order_by('-created')

    paginator = Paginator(posts, 10) # Change here for more posts in each page
    page = request.GET.get('page')

    return render(request, 'network/following.html', {
        'posts' : pagination(paginator, page)
    })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
