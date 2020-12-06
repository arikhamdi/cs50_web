from django import forms
from .models import AuctionListing, Comment


class AunctionListingForm(forms.ModelForm):
    class Meta:
        model = AuctionListing
        fields = ['title', 'description', 'price', 'image', 'category', 'active']
        widgets = {
            'title' : forms.TextInput(attrs={'class': 'form-control'}),
            'description' : forms.Textarea(attrs={'class': 'form-control'}),
            'price' : forms.NumberInput(attrs={'class': 'form-control'}),
            'image' : forms.URLInput(attrs={'class': 'form-control'}),
            'category' : forms.Select(attrs={'class': 'form-control'})
        }

class CommentForm(forms.ModelForm):
   class Meta:
       model = Comment
       fields = ['comment']
       widgets = {
           'comment': forms.Textarea(attrs={'class': 'form-control'})
       }