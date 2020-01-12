import json
import jsonify
import tweepy
# from keras.models import load_model
# from keras.preprocessing.sequence import pad_sequences
# from keras.preprocessing.text import Tokenizer
# import pickle
# import tensorflow as tf
from config import consumer_key, consumer_secret, access_token, access_token_secret

# Keras stuff
# global graph
# graph = tf.get_default_graph()
# model = load_model('main_app/Sentiment_LSTM_model.h5')
# MAX_SEQUENCE_LENGTH = 300

# Twitter
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)
api = tweepy.API(auth,wait_on_rate_limit=True)

from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'
