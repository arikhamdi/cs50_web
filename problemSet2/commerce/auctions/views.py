from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.db.models import Max

from .models import User, AuctionListing, WatchList, Category, Bid
from .forms import AunctionListingForm


def index(request):
    return render(request, "auctions/index.html", {
        'listing' : AuctionListing.objects.all()
    })

def show_categories(request):
    return render(request, "auctions/category.html",{
        'category' : Category.objects.all()
    })

def search_by_category(request, id):
    return render(request, "auctions/search_category.html", {
        'list_auction' : AuctionListing.objects.filter(category_id=id)
    })


def single_listing(request, id):
    current_listing = AuctionListing.objects.get(id=id)
    user = request.user
    # Check if there are a logged in user and if it is give a list of user who have
    # added the current auction in ther watchlist
    watcher = ""    
    if request.user.is_authenticated:
        watcher = WatchList.objects.filter(user=user, auction=current_listing)
    if request.method == "POST":
        # check if requested user have added curent auction in his watch list
        # if it already exists, delete from user watchlist
        # if not it is added to watchlist 
        obj, created = WatchList.objects.get_or_create(user=user, auction=current_listing)
        if not created:
            obj.delete()
        if "bid" in request.POST and request.POST['bid'] not in ['', 0]:
            b = Bid.objects.create(amount=request.POST['bid'], listing=current_listing, buyer=user) 
    return render(request, "auctions/single.html", {
        'listing' : current_listing,
        'watched' : watcher,
        'bid' : Bid.objects.filter(listing=current_listing).aggregate(Max('amount')),
        'watcher' : WatchList.objects.filter(auction=current_listing)
    })

@login_required(login_url='login')
def show_watchlist(request):
    return render(request, "auctions/watchlist.html", {
        'list' : WatchList.objects.filter(user=request.user)
    })

@login_required(login_url='login')
def new(request):
    form = AunctionListingForm()
    if request.method == "POST":
        form = AunctionListingForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data['title']
            description = form.cleaned_data['description']
            price = form.cleaned_data['price']
            image = form.cleaned_data['image']
            category = form.cleaned_data['category']
            seller = request.user
            AuctionListing.objects.create(title=title,
                                        description=description,
                                        price=price,
                                        image=image,
                                        category=category,
                                        seller=seller)
            
            return HttpResponseRedirect(reverse('index'))
    return render(request, "auctions/new.html",{
        'form' : form
    })


# Login parts

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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
