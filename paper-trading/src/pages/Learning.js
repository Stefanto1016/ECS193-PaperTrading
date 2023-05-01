import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { Navigate } from 'react-router-dom';
import "./learning.scss";
import bc4 from "../images/bc4.jpeg"
import bc1 from "../images/BC1.webp"
import bc2 from "../images/bc2.webp"
import bc3 from "../images/bc3.webp"
import bc5 from "../images/bc5.webp"
import bc6 from "../images/bc6.webp"
import bc7 from "../images/bc7.jpeg"
import bc8 from "../images/bc8.jpeg"

const bc4desc = "This is the homepage for Investopedia's articles surrounding stocks, investment, and more! On this page you'll find articles written about the many different aspects of the stock market that'll help introduce you to the current market.";
const bc1desc = "This is an Investopedia's article that aims to guide beginners in investing. It covers topics such as the Investment Risk Ladder, how to invest sensibly, suitably, and simply, and more!";
const bc2desc = "This is an Investopedia's article that aims to guide beginners in investing. It covers topics such as steps to get started investing, account minimums, costs, and more!";
const bc3desc = "This is an Investopedia's article that aims to describe the fundamentals about stocks including terminology such as cash flow, return on assets, conservative gearing, history of profit retention, and more!";
const bc5desc = "This is an article by the balance that is aimed at guiding beginners in investing. It goes through investing in stocks, bonds, and real estate as well as explaining frequently asked questions.";
const bc6desc = "This is an article from bankrate that intends to provide useful tips for beginners in the stock market. It provides descriptions of the stock market and its features as well as provides 9 tips for when you first start out."
const bc7desc = "This is a youtube video from Oliver Elfenbaum in collaboration with Ted-Ed that aims to describe how the stock market actually functions. It provides some history surrounding stock markets and how businesses use it today."
const bc8desc = "This is a youtube video from Nate O'Brien that guides beginners to the stock market in making their first investments. It entails a step-by-step guide that provides information and recommendations."


function newsClick(news){
    window.open(news);
}

function Learning() {
    const profile = localStorage.getItem("profile");

    useEffect(() => {
      document.body.style.overflow = "scroll";
  })

    return (
        <div>
            {profile ? (
        <div>
            <NavBar/> 
            <div className="page-container">
                <BlogCard url="https://www.investopedia.com/investing-4427685" img={bc4} title="Investopedia: Investing" desc={bc4desc}/>
                <BlogCard url="https://www.investopedia.com/articles/basics/11/3-s-simple-investing.asp" img={bc1} title="Investing: An Introduction" desc={bc1desc}/>
                <BlogCard url="https://www.investopedia.com/articles/basics/06/invest1000.asp" img={bc2} title="How to Invest in Stocks: Beginners" desc={bc2desc}/>
                <BlogCard url="https://www.investopedia.com/articles/fundamental/03/022603.asp" img={bc3} title="What Are Stock Fundamentals?" desc={bc3desc}/>
                <BlogCard url="https://www.thebalancemoney.com/investing-for-beginners-4802693" img={bc5} title="Investing for Beginners" desc={bc5desc}/>
                <BlogCard url="https://www.bankrate.com/investing/stock-market-basics-for-beginners/" img={bc6} title="Stock market basics: 9 tips" desc={bc6desc} />
                <BlogCard url="https://www.youtube.com/watch?v=p7HKvqRI_Bo" img={bc7} title="How does the stock market work?" desc={bc7desc}/>
                <BlogCard url="https://www.youtube.com/watch?v=dFAiChOmoGI" img={bc8} title="Stock Market For Beginners" desc={bc8desc}/>

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
  
          <Front img={this.props.img} title={this.props.title}/>
          <Back url={this.props.url} title={this.props.title} desc={this.props.desc}/>
        </div>
  
      )
    }
  }
  
  function Front({img, title}){
      return (
        <div className="front">
          <ImageArea img={img} title={title}/>
        </div>
      )
  }
  
  function Back({url, title, desc}){
      return (
        <div className="back">
          <p>{title}</p>
          <p>{desc}</p>
          <button className='newsButton' onClick={() => newsClick(url)}>Open this article!</button>
        </div>
      )
  }
  
  function ImageArea({img, title}){
      return (
        <div className="image-container">
          <img className="card-image" src={img}></img>
          <h1 className="title">{title}</h1>
        </div>
      )
  }
  
  
export default Learning