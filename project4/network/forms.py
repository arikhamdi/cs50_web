from django import forms


class NewPostForm(forms.Form):
    post = forms.CharField(label='New Post',widget=forms.Textarea(attrs={
        'class': 'form-control',
        'rows': '2'
        }))