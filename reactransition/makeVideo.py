import cv2
import uuid

def make_video(interpolated_path_list_joined_by_sharp, periodic_time, doTurn):
    interpolated_path_list = interpolated_path_list_joined_by_sharp.split('#')
    new_uuid = str(uuid.uuid4()).replace('-', '')
    save_path = '/'.join(interpolated_path_list[0].split('/')[:4]) + '/' + new_uuid + '.mp4'

    fourcc = cv2.VideoWriter_fourcc('m', 'p', '4', 'v')
    video = cv2.VideoWriter('./reactransition'+save_path, fourcc, len(interpolated_path_list)/periodic_time, (256, 256))

    for interpolated_path in interpolated_path_list:
        interpolated_name = './reactransition' + interpolated_path
        img = cv2.imread(interpolated_name)

        video.write(img)

    if doTurn == 'true':
        interpolated_path_list.reverse()
        for interpolated_path in interpolated_path_list:
            interpolated_name = './reactransition' + interpolated_path
            img = cv2.imread(interpolated_name)

            video.write(img)

    video.release()

    return save_path