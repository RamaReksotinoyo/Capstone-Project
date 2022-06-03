import tensorflow as tf
from src.preparation import train_val_generator
from src.model import tongkolNet, tongkolNet_MobilenetV2, get_mobilenet
from src.load_data import get_data_paths
from src.preprocessing import augmentation
import pathlib


data_dir = get_data_paths('Dataset/data')

image_width, image_height = 224,224

train_generator, val_generator = train_val_generator(
    data_dir=data_dir, 
    image_width=image_width, 
    image_height=image_height
)

data_augmentation = augmentation(train_generator)

# model = tongkolNet(data_augmentation)
mnet2 = get_mobilenet(train_generator)
model = tongkolNet_MobilenetV2(data_augmentation, mnet2)


if __name__ == '__main__':
    model.fit(
        train_generator, 
        steps_per_epoch = train_generator.samples // train_generator.batch_size,
        validation_data = val_generator,
        validation_steps = val_generator.samples // val_generator.batch_size,
        epochs = 1,
    )

    model.save('foo.h5')
