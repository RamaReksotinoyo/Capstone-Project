import tensorflow as tf
import os
import numpy as np
# Keras
from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image
from tensorflow.keras.activations import softmax
from tensorflow.keras import preprocessing
from PIL import Image
import io
# Flask utils
import flask
from flask import Flask, jsonify, redirect, url_for, request, render_template
from werkzeug.utils import secure_filename



# Define a flask app
app = Flask(__name__)

model = load_model('foo.h5')

class_names = ['3 Jam Pertama',
                '3 Jam Kedua',
                '3 Jam Ketiga', 
                '3 Jam Keempat', 
                '3 Jam Kelima']

def prepare_image(img):
    img = Image.open(io.BytesIO(img))
    img = img.resize((224, 224))
    img = image.img_to_array(img)
    img = np.true_divide(img, 255)
    img = np.expand_dims(img, axis = 0)
    return img


def predict_result(img):
    predictions = model.predict(img)
    scores = tf.nn.softmax(predictions[0])
    scores = scores.numpy()
    image_class = class_names[np.argmax(scores)]
    return image_class 

@app.route('/predict', methods=['POST'])
def infer_image():
    # Catch the image file from a POST request
    if 'file' not in request.files:
        return "Please try again. The Image doesn't exist"
    
    file = request.files.get('file')

    if not file:
        return

    # Read the image
    img_bytes = file.read()

    basepath = os.path.dirname(__file__)
    file_path = os.path.join(
        basepath, 'uploads', secure_filename(file.filename))
    file.save(file_path)

    # Prepare the image
    img = prepare_image(img_bytes)

    # Return on a JSON format
    return jsonify(prediction=predict_result(img))
    

@app.route('/', methods=['GET'])
def index():
    return 'Machine Learning Inference'



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
