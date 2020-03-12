# Transition
This is a apprication like editor using deep learning. You can experience neural style transfer, scenery image to painting like romanticism, impressionism, by VanGogh, by Redon and Ukiyoe. Furthermore you can interpolate between two transfered images and download it in mp4. Please try it.

## Install
```bash
python3 -m venv <any directory name>
source <any directory name>/bin/activate
cd <any directory name>
pip3 install django==2.2.6
pip3 install torch
pip3 install torchvision
pip3 install opencv-python
git clone https://github.com/kzkymur/transition.git transition

```

## Start
```bash
python3 transition/manage.py runserver
```
