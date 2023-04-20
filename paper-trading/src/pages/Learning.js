import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { Navigate } from 'react-router-dom';
import "./learning.scss";

function newsClick(news){
    window.open(news);
}

const url = "https://www.amakella.com/resources-for-beginners-to-learn-how-the-stock-market-works/";
function Learning() {
    const profile = localStorage.getItem("profile");

    return (
        <div>
            {profile ? (
        <div>
            <NavBar/> 
            <div className="page-container">
                <div >
                  <BlogCard />
                </div>
                <BlogCard />
                <BlogCard />
                <BlogCard />
                <BlogCard />
                <BlogCard />
                <BlogCard />
                <BlogCard />

            </div>
        </div>
            ) : (
                <Navigate to="/login"/>
            )}
        </div>
    )
}





  
  class BlogCard extends React.Component {
    constructor(props) {
      super(props);
      this.state = { flipped: false };
      this.flip = this.flip.bind(this);
    }
  
    flip = () => {
      this.setState({ flipped: !this.state.flipped });
    }
    render() {
      return (
  
  
        <div onMouseEnter={this.flip} onMouseLeave={this.flip} className={"card-container" + (this.state.flipped ? " flipped" : "")}>
  
          <Front />
          <Back />
        </div>
  
      )
    }
  }
  
  class Front extends React.Component {
    render() {
      return (
        <div className="front">
          <ImageArea />
          <MainArea />
        </div>
      )
    }
  }
  
  class Back extends React.Component {
    
    render() {
      return (
        <div className="back">
          <p>Stocks Stocks Stocks</p>
          <p>noun: stock market; plural noun: stock markets; noun: stockmarket; plural noun: stockmarkets a stock exchange. "he plans to invest in the stock market"</p>
          <button onClick={() => newsClick(url)}>Open this article!</button>
        </div>
      )
    }
  }
  
  class ImageArea extends React.Component {
    render() {
      return (
        <div className="image-container">
          <img className="card-image" src="https://78.media.tumblr.com/d98fb931adb117c70f0dbced9e947520/tumblr_pe582mbWip1tlgv32o1_1280.png"></img>
          <h1 className="title">Intro to Stocks</h1>
        </div>
      )
    }
  
  }
  
  class MainArea extends React.Component {
    render() {
      return (
        <div className="main-area">
          <div className="blog-post">
            <p className="date">{new Date().toLocaleDateString()}</p>
            <p className="blog-content">
              This ia an article about the Stock Market!
              </p>
            <p className="read-more">Hover to read more...</p>
  
          </div>
  
        </div>
      )
    }
  }
  
export default Learning