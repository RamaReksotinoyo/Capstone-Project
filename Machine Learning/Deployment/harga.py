from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import tensorflow as tf
from keras.models import load_model
import os

app = Flask(__name__)

files_model = [os.path.splitext(filename)[0] for filename in os.listdir('model_harga_tongkol')]
tempat = []

for i in files_model:
    tempat.append(i)

@app.route("/")
def index():
    return render_template('index_harga.html', tempat=tempat)

@app.route('/result', methods = ["POST"])
def result():
    if request.method == 'POST':
        lokasi = request.form["lokasi"] if request.form["lokasi"]!="" else 0
        quantity = float(request.form["jumlah"] if request.form["jumlah"]!="" else 0)
        bakul = float(request.form["bakul"] if request.form["bakul"]!="" else 0)

        model = load_model(f'model_harga_tongkol/{lokasi}.h5')
        pred_harga = float(model.predict(np.array([quantity, bakul]).reshape(1, -1))) * 1000
        if pred_harga < 10000 :
            harga = 12000
        elif pred_harga > 28000 :
            harga = 28000
        else :
            harga = pred_harga

    return jsonify(price=harga)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')