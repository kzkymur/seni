from django.db import models
from pathlib import Path
import shutil
import uuid
import cv2
import os
# Create your models here.


class Photo(models.Model):
    def get_image_path(self, _):
        prefix = 'origin/'
        name = str(uuid.uuid4()).replace('-', '')
        self.new_filename = name + '.jpg'
        return prefix + self.new_filename

    def identify_new_filename(self):
        origin_path = Path(__file__).parent
        path = origin_path / '../origin'
        path = os.path.join(path, self.new_filename)
        receive_dirname = origin_path / 'static/pictures/origin'

        img = cv2.imread(os.path.join(path))
        resize_img = cv2.resize(img, (256, 256), interpolation=cv2.INTER_CUBIC)
        os.makedirs(receive_dirname, exist_ok=True)
        cv2.imwrite(os.path.join(receive_dirname, self.new_filename), resize_img)

        os.remove(path)
        return self.new_filename

    image = models.ImageField(upload_to=get_image_path)


