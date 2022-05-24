from regex import R
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.preprocessing.image import DirectoryIterator


datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    validation_split=0.4, 
    rescale=1./255
)


def train_val_generator(data_dir: str, 
                        image_width: int, 
                        image_height: int) -> DirectoryIterator:

    """
    This function contains the train and val generator.
    """

    train_generator = datagen.flow_from_directory(
        data_dir, 
        subset='training',
        batch_size=32,
        class_mode='categorical',
        color_mode="rgb",
        target_size=(image_width, image_height),
        shuffle=True
    )

    val_generator = datagen.flow_from_directory(
        data_dir,
        subset='validation',
        batch_size=32,
        class_mode='categorical',
        color_mode="rgb",
        target_size=(image_width, image_height),
        shuffle=True
    )
    
    return train_generator, val_generator