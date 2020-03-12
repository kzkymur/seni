import os
import numpy as np
import PIL.Image as Image
from collections import OrderedDict
import torch
import torch.nn as nn
from torchvision import transforms


class Transferer():
    def __init__(self):
        self.MODEL_SAVE_DIR = "./reactransition/static/pictures"

    def make_img_data(self, data_filepath):
        def np_normalization(np_img, mean, std):
            img_mean = np_img.mean(keepdims=True)
            img_std = np.std(np_img, keepdims=True)
            new_img = ((np_img - img_mean) / img_std) * std + mean
            return np.array(new_img)

        with open(data_filepath, 'rb') as f:
            img = Image.open(f)
            np_img = np_normalization(np.asarray(img.convert("RGB")), 0, 0.5)
            totensor = transforms.Compose([transforms.ToTensor()])
            tensor_img = (totensor(np_img) * 2 - 1).view(1, 3, 256, 256)
            return tensor_img

    def save_transfered(self, origin_dirname, tag_name, icon_names, coefficients):

        ####################################### モデル作り ############################################

        net_list = []
        for icon_name in icon_names:
            model = CycleGANmodel()
            model.load_networks(icon_name)
            net = getattr(model, 'netGA')
            if isinstance(net, torch.nn.DataParallel):
                net = net.module
            net_weights = net.cpu().state_dict()
            if hasattr(net_weights, '_metadata'):
                del net_weights._metadata
            net_list.append(net_weights)

        interp_model = CycleGANmodel()
        interp_net = OrderedDict()

        for k, v in net_list[0].items():
            interp_net[k] = coefficients[0] * v
        for i, net in enumerate(net_list[1:]):
            for k, v in net.items():
                interp_net[k] += coefficients[i+1] * v

        _net = getattr(interp_model, 'netGA')
        if isinstance(_net, torch.nn.DataParallel):
            _net = _net.module
        #for key in list(interp_net.keys()):
        #    _net.load_state_dict(interp_net)
        _net.load_state_dict(interp_net)

        #############################################################################################

        MODEL_SAVE_DIR = os.path.join(self.MODEL_SAVE_DIR, origin_dirname)
        os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
        filename = tag_name + ',' + ';'.join(list(map(str, coefficients))) + '.jpg'


        tensor_img_data = self.make_img_data(self.MODEL_SAVE_DIR+'/origin/'+origin_dirname)

        interp_model.set_input(tensor_img_data)
        fake_tensor = interp_model.forward()

        to_pil_img = transforms.Compose([
            transforms.ToPILImage(mode='RGB')
        ])

        fake_img = to_pil_img((fake_tensor.detach().cpu().clone().squeeze()+1)/2)

        fake_img.save(MODEL_SAVE_DIR + '/' + filename, quality=95)

        return filename


class ResnetGenerator(nn.Module):
    def __init__(self):
        super(ResnetGenerator, self).__init__()
        input_channel = 3
        n_blocks = 9

        model = [
            nn.ReflectionPad2d(3),
            nn.Conv2d(input_channel, 64, kernel_size=7, padding=0, bias=True),
            nn.InstanceNorm2d(64),
            nn.ReLU(True)
        ]
        for i in range(2):
            mult = 2 ** i
            model += [
                nn.Conv2d(64 * mult, 64 * mult * 2, kernel_size=3,
                          stride=2, padding=1, bias=True),
                nn.InstanceNorm2d(64 * mult * 2),
                nn.ReLU(True)
            ]
        for i in range(n_blocks):
            model += [
                ResnetBlock()
            ]
        for i in range(2):
            mult = 2 ** (2 - i)
            model += [
                nn.ConvTranspose2d(64 * mult, 32 * mult, kernel_size=3, stride=2,
                                   padding=1, output_padding=1, bias=True),
                nn.InstanceNorm2d(32 * mult),
                nn.ReLU(True)
            ]
        model += [
            nn.ReflectionPad2d(3),
            nn.Conv2d(64, 3, kernel_size=7, padding=0),
            nn.Tanh()
        ]

        self.model = nn.Sequential(*model)

    def forward(self, Input):
        return self.model(Input)


class ResnetBlock(nn.Module):
    def __init__(self):
        super(ResnetBlock, self).__init__()
        self.model_block = self.build_block()

    def build_block(self):
        block = [
            nn.ReflectionPad2d(1),
            nn.Conv2d(256, 256, kernel_size=3, padding=0, bias=True),
            nn.InstanceNorm2d(256),
            nn.ReLU(True),
            nn.ReflectionPad2d(1),
            nn.Conv2d(256, 256, kernel_size=3, padding=0, bias=True),
            nn.InstanceNorm2d(256),
        ]
        return nn.Sequential(*block)

    def forward(self, x):
        return x + self.model_block(x)

class CycleGANmodel():
    def __init__(self):
        if torch.cuda.is_available():
            self.device = torch.device("cuda")
        else:
            self.device = torch.device("cpu")

        def initialize_network(net):
            if torch.cuda.is_available():
                net = torch.nn.DataParallel(net)
                torch.backends.cudnn.benchmark = True
            else:
                net.share_memory()

            def initialize_weights(m):
                if hasattr(m, 'weight') and m.__class__.__name__.find('Conv') != -1:
                    nn.init.normal_(m.weight.data, 0.0, 0.02)

            net.apply(initialize_weights)
            return net

        self.netGA = initialize_network(ResnetGenerator())
        self.model_names = ['GA']

    def evaluate(self):
        for name in self.model_names:
            if isinstance(name, str):
                net = getattr(self, 'net' + name)
                net.eval()

    def set_input(self, data):
        self.real_A = data.type('torch.FloatTensor').to(self.device)

    def forward(self):
        return self.netGA(self.real_A)

    def load_networks(self, MODEL_SAVE_FILE):
        self.evaluate()
        for name in self.model_names:
            if isinstance(name, str):
                model_saved_dir = './reactransition/static/models'
                load_path = os.path.join(model_saved_dir, MODEL_SAVE_FILE)
                net = getattr(self, 'net' + name)
                if isinstance(net, torch.nn.DataParallel):
                    net = net.module
                state_dict = torch.load(load_path, map_location=str(self.device))
                if hasattr(state_dict, '_metadata'):
                    del state_dict._metadata
                net.load_state_dict(state_dict)

    def device_change(self):
        if self.device == torch.device("cuda"):
            self.device = torch.device("cpu")
        elif torch.cuda.is_available():
            self.device = torch.device("cuda")
