import React from 'react';
import { Component } from 'react';
import { Grid } from 'react-bootstrap';
import { Image } from 'react-bootstrap';
import { Switch, Route } from 'react-router-dom';
import "./App.css"

export default function App() {
  return (
    <div className="App">
        <div className="greeting-container">
            <h1>HELLO I'M AMBER</h1>
        </div>
        <div className="aboutMe-contianer">
          <h3 className="section-title">ABOUT ME</h3>
          <div className="self-introduction">
              <Image
              src="https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAArOAAAAJGYxMWU4NzdiLWQ1MGUtNDdlMi1hOWM5LWU1ZDdhZGQ5NDQwOA.jpg" 
              circle 
              responsive
              className="self-intro-pic" />
              <h4 className="self-intro-title">DEVELOPER. ADVENTURER. FASHIONISTA.</h4>
              <h4 className="self-intro-text">
                I'm Amber Shen (沈含滋). I'm currently a senior at University of Illinois at Urbana-Champaign, majoring in mathematics and computer science and minoring in French. Interested in Human-Computer Interaction and Artificial Intelligence, I enjoy working on innovative solutions for fashion, art and social interactions. 
              </h4>
              <h4 className="self-intro-title">FUN FACTS:</h4>
              <ul className="self-intro-text">
                <li>I've lived in China, America and France.</li>
                <li>I played the piano for 14 years before I started programming.</li>
                <li>Outside work you'll find me in museumms, cafés or taking photos on the street.</li>
                <li>My favorite sport is boxing.</li>
                <li>The last museum I visited is Neue Gallerie in New York City.</li>
              </ul>
              <h4 className="self-intro-title">IN THE MEDIA</h4>
              <h4 className="self-intro-text">
                -> <a href="https://www.businessoffashion.com/articles/news-analysis/fashions-future-voices-winners-2016-revealed">BoF Fashion's Future VOICES</a>
              </h4>
          </div>
         </div>
         <div className="work-container">
           <h3 className="section-title"></h3>
         </div>
         <div className="contact-container">

         </div>
      </div>
  );
}
