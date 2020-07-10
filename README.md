# Transition
深層学習を用いた画風変換が体験できるエディタ風のwebアプリケーション。好きな風景の画像をロマン主義、印象派、ゴッホ、ラドン、浮世絵の絵画調や春夏秋冬、昼夕夜に変換できたり、各生成画像の間を補完することで画風間の移り変わっていくような様を見ることができる。またそのmp4形式でのダウンロードも可能である。
This is a apprication like editor using deep learning. You can experience neural style transfer, scenery image to painting like romanticism, impressionism, by VanGogh, by Redon and Ukiyoe. Furthermore you can interpolate between two transfered images and download it in mp4. Please try it.


## Install
```bash
python3 -m venv <any directory name>
source <any directory name>/bin/activate
cd <any directory name>
pip3 install django==2.2.6
pip3 install torch==1.2.0
pip3 install torchvision==0.4.0
pip3 install opencv-python==4.1.1.26
pip3 install pillow==6.2.1
git clone https://github.com/kzkymur/transition.git transition
```

## Start
```bash
cd transition
python3 manage.py runserver
```

## Sample
[![alt](https://img.youtube.com/vi/3Nu6cqZ-x2o/0.jpg)](https://www.youtube.com/watch?v=3Nu6cqZ-x2o)

## Credit
https://arxiv.org/abs/1703.10593
https://arxiv.org/abs/1811.10515
