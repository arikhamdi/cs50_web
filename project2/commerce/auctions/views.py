from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.db.models import Max

from .models import User, AuctionListing, WatchList, Category, Bid, Comment
from .forms import AunctionListingForm, CommentForm


def index(request):
    return render(request, "auctions/index.html", {
        'listing' : AuctionListing.objects.all(),
        'bid' : Bid.objects.all().order_by('-amount')
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
    bid = Bid.objects.filter(listing=current_listing).aggregate(Max('amount')) 
    amount = max(bid['amount__max'] if None else 0, current_listing.price)
    user = request.user
    message = None
    form = CommentForm()
    # Check if there are a logged in user and if it is give a list of user who have
    # added the current auction in ther watchlist
    watcher = ""    
    if request.user.is_authenticated:
        watcher = WatchList.objects.filter(user=user, auction=current_listing)
    if request.method == "POST":
        if 'comment' in request.POST:
            form = CommentForm(request.POST)
            if form.is_valid():
                comment = form.cleaned_data['comment']
                Comment.objects.create(comment=comment,
                                        author=user,
                                        auction=current_listing)
                return redirect('single_listing', id=id)                
        # check if requested user have added curent auction in his watch list
        # if it already exists, delete from user watchlist
        # if not it is added to watchlist 
        if 'watch' in request.POST:
            obj, created = WatchList.objects.get_or_create(user=user, auction=current_listing)
            if not created:
                obj.delete()
            return redirect('single_listing', id=id)
        # check if there is bid in post request
        # next check if the bid is not empty and bigger than current asked amout
        # if it is, add the new bid in db
        # else send an error message
        if "bid" in request.POST:
            if request.POST['bid'] not in [""] and int(request.POST['bid']) > amount:
                Bid.objects.create(amount=request.POST['bid'], listing=current_listing, buyer=user)
                current_listing.winner = request.user
                current_listing.save()
                return redirect('single_listing', id=id)
            else:
                message = f"Bid must be at least { amount + 1}"
        # check if there is active in post request
        # switch state and save in db
        if 'active' in request.POST:
            current_listing.active = 0 if current_listing.active == 1 else 1
            current_listing.save()
            return redirect('single_listing', id=id)
    return render(request, "auctions/single.html", {
        'listing' : current_listing,
        'watched' : watcher,
        'bid' : bid,
        'watcher' : WatchList.objects.filter(auction=current_listing),
        'message' : message,
        'form' : form,
        'comments': Comment.objects.filter(auction=current_listing)
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
                                        active=form.cleaned_data['active'],
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
