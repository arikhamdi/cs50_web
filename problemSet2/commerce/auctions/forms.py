from django import forms
from .models import AuctionListing


class AunctionListingForm(forms.ModelForm):
    class Meta:
        model = AuctionListing
        fields = ['title', 'description', 'price', 'image', 'category']
        widgets = {
            'title' : forms.TextInput(attrs={'class': 'form-control'}),
            'description' : forms.Textarea(attrs={'class': 'form-control'}),
            'price' : forms.NumberInput(attrs={'class': 'form-control'}),
            'image' : forms.URLInput(attrs={'class': 'form-control'}),
            'category' : forms.Select(attrs={'class': 'form-control'})
        }