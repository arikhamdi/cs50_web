from django.shortcuts import render
import random

from . import util, forms


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def get_entry(request, title):
    entry = util.get_entry(title)
    if entry == None:
        title = "Page not found"
        entry = "Page not found"
    return render(request, "encyclopedia/entry.html", {
        'title': title,
        'entry': entry
        })

def new(request):
    if request.method == 'POST':
        form = forms.NewEntryForm(request.POST)
        if form.is_valid():
            content = form.cleaned_data["content"]
            title = form.cleaned_data["title"]
            if title in [entry.lower() for entry in util.list_entries()]:
                return render(request, "encyclopedia/new.html", {
                    'form' : form,
                    'warning' : "danger",
                    'message' : "Entry already exists"
                })
            else:
                util.save_entry(title, content)
                return render(request, "encyclopedia/new.html", {
                    'form' : form,
                    'warning' : "success",
                    'message' : "Entry succesfully added"
                })
    else:
        form = forms.NewEntryForm()
    return render(request, "encyclopedia/new.html", {
        'form': form
    })

def edit(request, title):
    if request.method == 'POST':
        form = forms.EditEntryForm(request.POST)
        if form.is_valid():
            content = form.cleaned_data["content"]
            util.save_entry(title, content)
            return render(request, "encyclopedia/edit.html", {
                    'form' : form,
                    'warning' : "success",
                    'message' : "Entry succesfully added"
                })
    else:
        initial_data = {
            'content': util.get_entry(title)
        }
        form = forms.EditEntryForm(initial=initial_data)
        return render(request, "encyclopedia/edit.html", {
            'form' : form,
            'title' : title
            })

    return render(request, "encyclopedia/edit.html", {
        'form' : form
    })

def random_page(request):
    title = random.choice([entry for entry in util.list_entries()])
    return render(request, "encyclopedia/entry.html", {
        'title': title,
        'entry': util.get_entry(title)
        })

def search_entry(request):
    if request.GET.get('query'):
        query = request.GET.get('query')
        entry = util.get_entry(query)
        if entry == None:
            result = []
            for entry in util.list_entries():
                if entry.lower().find(query) != -1:
                    result.append(entry)

            return render(request, "encyclopedia/search.html", {
            "entries": result
            })
        return render(request, "encyclopedia/entry.html", {
            'title': query,
            'entry': entry
            })
    else:
        return render(request, "encyclopedia/index.html", {
            "entries": util.list_entries()
            })