import tensorflow as tf
from tensorflow.keras import Sequential
from tensorflow.keras.preprocessing.image import DirectoryIterator


def tongkolNet(augmentation: Sequential) -> Sequential:
    """
    Our own model for tongkol freshness prediction.
    """
    model = tf.keras.models.Sequential()
    model.add(augmentation)
    model.add(tf.keras.layers.Conv2D(32, (3, 3), activation='relu'))
    model.add(tf.keras.layers.MaxPooling2D((2, 2)))
    model.add(tf.keras.layers.Conv2D(64, (3, 3), activation='relu'))
    model.add(tf.keras.layers.MaxPooling2D((2, 2)))
    model.add(tf.keras.layers.Flatten())
    model.add(tf.keras.layers.Dense(128, activation='relu'))
    model.add(tf.keras.layers.Dense(5, activation='softmax'))

    model.compile(
        optimizer = tf.keras.optimizers.Adam(learning_rate = 0.001),
        loss = 'categorical_crossentropy',
        metrics = ['accuracy']
    )

    return model


def get_mobilenet(train_generator: DirectoryIterator):
    """
    Import base model MobileNetV2, 
    we'll freeze the base model and train only the top layers with our own tuning parameters.
    """
    mnet2 = tf.keras.applications.MobileNetV2(input_shape=train_generator.image_shape,
                                                include_top=False,
                                                weights='imagenet')

    return mnet2          
                     

def tongkolNet_MobilenetV2(augmentation: Sequential, base_model) -> Sequential:
    """
    Our own model for tongkol freshness prediction with mobilenet.
    """
    model = tf.keras.models.Sequential()
    model.add(augmentation)
    model.add(base_model)
    model.add(tf.keras.layers.Flatten())
    model.add(tf.keras.layers.Dense(128, activation='relu'))
    model.add(tf.keras.layers.Dense(5, activation='softmax'))

    model.compile(
        optimizer = tf.keras.optimizers.Adam(learning_rate = 0.0001),
        loss = 'categorical_crossentropy',
        metrics = ['accuracy']
    )

    return model

