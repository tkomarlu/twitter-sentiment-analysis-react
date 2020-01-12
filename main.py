import json
import jsonify
import tweepy
from math import expm1
import joblib
import pandas as pd
from flask import Flask, jsonify, request
from tensorflow import keras
import tensorflow as tf
from keras.models import load_model
from keras.preprocessing.sequence import pad_sequences
from keras.preprocessing.text import Tokenizer
from config import consumer_key, consumer_secret, access_token, access_token_secret
import pickle

# Keras stuff
global graph
graph = tf.compat.v1.get_default_graph()
model = keras.models.load_model("Sentiment_LSTM_model.h5")
MAX_SEQUENCE_LENGTH = 300

# Twitter
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)
api = tweepy.API(auth,wait_on_rate_limit=True)

from flask import Flask
app = Flask(__name__)

with open('tokenizer.pickle', 'rb') as handle:
    tokenizer = pickle.load(handle)

def predict(text, include_neutral=True):
    # Tokenize text
    x_test = pad_sequences(tokenizer.texts_to_sequences([text]), maxlen=MAX_SEQUENCE_LENGTH)
    # Predict
    score = model.predict([x_test])[0]
    if(score >=0.4 and score<=0.6):
        label = "Neutral"
    if(score <=0.4):
        label = "Negative"
    if(score >=0.6):
        label = "Positive"

    return {"label" : label,
        "score": float(score)}


@app.route('/getSentiment')
def getsentiment(request):
    data = {"success": False}
    # if parameters are found, echo the msg parameter
    if (request.get_json() != None):
        with graph.as_default():
            data["predictions"] = predict(request.get_data())
        data["success"] = True
    return JsonResponse(data)

@app.route('/getTweets')
def analyzehashtag(request):
    positive = 0
    neutral = 0
    negative = 0
    for tweet in tweepy.Cursor(api.search,q="#" + request.get_data() + " -filter:retweets",rpp=5,lang="en", tweet_mode='extended').items(100):
        with graph.as_default():
            prediction = predict(tweet.full_text)
        if(prediction["label"] == "Positive"):
            positive += 1
        if(prediction["label"] == "Neutral"):
            neutral += 1
        if(prediction["label"] == "Negative"):
            negative += 1
    return JsonResponse({"positive": positive, "neutral": neutral, "negative": negative});

@app.route('/analyzeHashtag')
def gettweets(request):
    tweets = []
    for tweet in tweepy.Cursor(api.search,q="#" + request.get_data()+ " -filter:retweets",rpp=5,lang="en", tweet_mode='extended').items(50):
        temp = {}
        temp["text"] = tweet.full_text
        temp["username"] = tweet.user.screen_name
        with graph.as_default():
            prediction = predict(tweet.full_text)
        temp["label"] = prediction["label"]
        temp["score"] = prediction["score"]
        tweets.append(temp)
    return JsonResponse({"results": tweets});
