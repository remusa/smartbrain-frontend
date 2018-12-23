import React, { Component } from 'react'
import Clarifai from 'clarifai'

import './App.scss'

import Navigation from './components/navigation/Navigation'
import Logo from './components/logo/Logo'
import Rank from './components/rank/Rank'
import ImageLinkForm from './components/imagelinkform/ImageLinkForm'
import FaceRecognition from './components/facerecognition/FaceRecognition'
import Particles from 'react-particles-js'

const app = new Clarifai.App({ apiKey: 'b212ac37878b4ea7b55a70ba0bdc5010' })

const particlesOptions = {
  particles: {
    number: {
      value: 50,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      input: '',
      imageUrl: '',
      box: {}
    }

    this.calculateFaceLocation = this.calculateFaceLocation.bind(this)
    this.displayFaceBox = this.displayFaceBox.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.onButtonSubmit = this.onButtonSubmit.bind(this)
  }

  calculateFaceLocation = (data) => {
    const clarifaFace = data['outputs'][0]['data']['regions'][0]['region_info'].bounding_box
    const image = document.querySelector('#inputImage')
    const width = Number(image.width)
    const height = Number(image.height)

    return {
      "top_row": clarifaFace.top_row * height,
      "left_col": clarifaFace.left_col * width,
      "right_col": width - (clarifaFace.right_col * width),
      "bottom_row": height - (clarifaFace.bottom_row * height)
    }
  }

  displayFaceBox = box => {
    console.log(box)
    this.setState({
      box: box
    })
  }

  onInputChange = e => {
    this.setState({
      input: e.target.value
    })
  }

  onButtonSubmit = () => {
    this.setState({
      imageUrl: this.state.input
    })

    app.models
      .predict("a403429f2ddf4b49b307e318f00e528b", this.state.input)
      .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
      .catch(err => console.log(err))
  }

  render() {
    return (
      <div className='App' >
        <Particles
          className='particles'
          params={particlesOptions} />
        <Navigation />
        <Logo />
        <Rank />
        <ImageLinkForm
          onInputChange={this.onInputChange}
          onButtonSubmit={this.onButtonSubmit}
        />
        <FaceRecognition
          imageUrl={this.state.imageUrl}
          box={this.state.box}
        />
      </div>
    )
  }
}

export default App
