from django.shortcuts import redirect

# Create your views here.
from django.shortcuts import render
from .forms import PhotoForm
from .models import Photo
from django.http import JsonResponse
from .transfer import Transferer
from .makeVideo import make_video


def index(request):
    return render(request, 'reactransition/index.html', {
        'form': PhotoForm(),
    })

def upload(request):
    if request.method == 'POST':
        form = PhotoForm(request.POST, request.FILES)
        print(request.FILES)
        if not form.is_valid():
            raise ValueError('invalid form')
        photo = Photo()
        photo.image = form.cleaned_data['image']
        photo.save()
        new_filename = photo.identify_new_filename()

        return JsonResponse({
            'title': new_filename
        })


def transfer(request):
    if request.method == 'POST':
        forms = request.POST
        transferer = Transferer()
        origin_dirname = forms['title']
        tag_name = forms['tag_name']
        icon_names = forms['icon_names'].split(';')
        coefficients = list(map(float, forms['coefficients'].split(';')))

        filename = transferer.save_transfered(origin_dirname, tag_name, icon_names, coefficients)

        return JsonResponse({
            'filename': filename
        })

def interp(request):
    if request.method == 'POST':
        forms = request.POST
        transferer = Transferer()
        tag_name = forms['from_src'].split(',')[0]
        from_coeffs = list(map(lambda x: float(x.replace('.jpg', '')), forms['from_src'].split(',')[1].split(';')))
        to_coeffs = list(map(lambda x: float(x.replace('.jpg', '')), forms['to_src'].split(',')[1].split(';')))
        division = int(forms['division'])+1
        img_name = forms['img_name']
        icon_names = forms['icon_names'].split(';')

        filename_list = [forms['from_src']]
        for i in range(1, division):
            coefficients = list(map(lambda x, y: round(x*(division-i)/division+y*i/division, 2), from_coeffs, to_coeffs))
            filename_list.append(transferer.save_transfered(img_name, tag_name, icon_names, coefficients))

        filename_list.append(forms['to_src'])

        return JsonResponse({
            'filenameList': filename_list
        })

def download(request):
    if request.method == 'POST':
        forms = request.POST
        save_path = make_video(forms['interpolatedList'], float(forms['periodicTime']), forms['doTurn'])
        return JsonResponse({
            'video_path': save_path
        })
