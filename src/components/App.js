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
            <h1>HELLO I'M HANZI</h1>
        </div>
        <div className="aboutMe-contianer">
          <h3 className="section-title"></h3>
         </div>
         <div className="work-container">
           <h3 className="section-title"></h3>
         </div>
         <div className="contact-container">
         </div>
      </div>
  );
}
