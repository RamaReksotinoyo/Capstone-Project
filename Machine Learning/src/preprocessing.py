import tensorflow as tf
from  tensorflow.keras import Sequential
from tensorflow.keras.preprocessing.image import DirectoryIterator


def augmentation(train_generator: DirectoryIterator) -> Sequential:
    """
    Preprocessing image data for training.
    This means that we will apply the following preprocessing:
    """
    data_augmentation = tf.keras.models.Sequential([
        tf.keras.layers.RandomFlip(
            "horizontal",
            input_shape=(train_generator.image_shape)
        )
    ])
    
    return data_augmentation