import React, { Component } from 'react';
import './index.css';
import Chart from 'react-apexcharts'

const axios = require('axios');
var ProgressBar = require('progressbar.js');


class App extends Component{
    constructor(){
        super();
        this.state = {
            hashtag: "",
            submitted: false,
            progressBar: false,
            options: {
                colors: ['#f74d4d', '#29bf58', '#fdba5e'],
                labels: ['Negative', 'Positive', 'Neutral'],
                bar: {
                    horizontal: false,
                    endingShape: 'flat',
                    columnWidth: '70%',
                    barHeight: '70%',
                    distributed: false,
                    colors: {
                        ranges: [{
                            from: 0,
                            to: 0,
                            color: undefined
                        }],
                        backgroundBarColors: [],
                        backgroundBarOpacity: 1,
                    },
                    dataLabels: {
                        position: 'top',
                        maxItems: 3,
                        hideOverflowingLabels: true,
                        orientation: 'horizontal'
                    }
                },
                series: [42, 42, 42],
                tweets: [],
                hashtag_desc: ""
            }
        }
    }

    async componentDidUpdate(){
        var positive = 0
        var negative = 0
        var neutral = 0
        var self = this;
        
        try {
            setInterval(async () => {
                axios.get('http://localhost:5000/analyzeHashtag', {
                    params: {
                        text:this.state.hashtag
                    }
                }).then(function (response) {
                    negative = response.data.negative;
                    positive = response.data.positive;
                    neutral = response.data.neutral;
                    self.setState({submited:true});
                    self.setState({series: [negative,positive,neutral]});
                });
            }, 30000);
        } catch (e) {
            console.log(e);
        }
        try {
            setInterval(async () => {
                axios.get('http://localhost:5000/getTweets', {
                    params: {
                        text:this.state.hashtag
                    }
                }).then(function (response) {
                    console.log(response);
                    self.setState({tweets: response.data.results});
                });
            }, 30000);
        } catch (e) {
            console.log(e);
        }
    }
    submitHandler = () => {
        this.setState({progressBar: true});
        this.setState({submitted: false});
        var positive = 0
        var negative = 0
        var neutral = 0
        var self = this;

        try {
            axios.get('http://localhost:5000/analyzeHashtag', {
                params: {
                    text:this.state.hashtag
                }
            }).then(function (response) {
                negative = response.data.negative;
                positive = response.data.positive;
                neutral = response.data.neutral;
                self.setState({submited:true});
                self.setState({series: [negative,positive,neutral]});
            }) ;
        }catch (e){
            console.log(e);
        }
        try {
            var url = "https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search=" + this.state.hashtag + "&limit=1&format=json"
            axios.get(url).then(function(response) {
                self.setState({hashtag_desc: response.data[2][0]});
            });
        } catch(e) {
            console.log(e);
        }
        try {
            setInterval(async () => {
                axios.get('http://localhost:5000/getTweets', {
                    params: {
                        text:this.state.hashtag
                    }
                }).then(function (response) {
                    console.log(response);
                    self.setState({tweets: response.data.results});
                });
            }, 30000);
        } catch (e) {
            console.log(e);
        }
    }

    inputHandler = (event) => {
        this.setState({hashtag: event.target.value})
    }

    showAnalysis = () => {
        if(this.state.submitted  == true){
            return(
                <div className="row">
                    <div className="col-sm-4">
                        <Chart options={this.state.options} series={this.state.series} type="bar" width="400"/>
                    </div>
                    <div className="offset-sm-1 col-sm-7">
                        <h1 className="heading_desc">{this.state.hashtag_desc}</h1>
                        <br/><br/>
                    </div>
                </div>
            );
        }
    }

    showLoadingBar = () => {
        if(this.state.progressBar){
            return(
                <div className="text-center">
                    <img src={require('./loading.gif')} width="100" height="100"/>
                    <h2 className="progressDots">Please Wait</h2>
                </div>
            );
        }
    }
    render() {
        var renderTweets  = this.state.tweets.map(function (item, i) {
            var color = "#29bf58";

            if(item.label == "Neutral"){
                color = "#fdba5e";
            }
            if(item.label == "Negative"){
                color = "#f74d4d";
            }

            return (
                <div key={i} className="tweets">
                    <h2>@{item.username}</h2>
                    <p>{item.text}</p>
                    <h3 style={{"color" : color}}> Predicted Sentiment - {item.label}</h3>
                </div>
            );
        })

        return(
            <div>
                <div className="container">
                    <h1 className="display-4 text-center" style={{'margin-top':this.state.submitted?'5%':'20%'}}>Twitter Sentiment Analysis</h1>
                    <br/><br/>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon1">#</span>
                        </div>
                        <input type="text" className="form-control" placeholder="Enter the hashtag" id="basic-url" aria-describedby="basic-addon1" onChange={this.inputHandler}/>
                    </div>
                    <br/>
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="text-center">
                                <button className="btn text-center btn-outline-secondary submit" type="button" onClick={this.submitHandler}>Analyze</button>
                            </div>
                        </div>
                    </div>
                    <br/><br/><br/>
                    {this.showAnalysis()}
                    {this.state.submitted?renderTweets:<br/>}
                    {this.showLoadingBar()}
                </div>
            </div>
        );
    }
}
export default App;
