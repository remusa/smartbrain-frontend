import React, { Component } from 'react'
import Particles from 'react-particles-js'

import './App.scss'

import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import Rank from './components/Rank/Rank'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'

const particlesOptions = {
    particles: {
        number: {
            value: 50,
            density: {
                enable: true,
                value_area: 800,
            },
        },
    },
}

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: new Date(),
    },
}

class App extends Component {
    constructor(props) {
        super(props)

        this.state = initialState

        this.loadUser = this.loadUser.bind(this)
        this.onRouteChange = this.onRouteChange.bind(this)
        this.calculateFaceLocation = this.calculateFaceLocation.bind(this)
        this.displayFaceBox = this.displayFaceBox.bind(this)
        this.onInputChange = this.onInputChange.bind(this)
        this.onButtonSubmit = this.onButtonSubmit.bind(this)
    }

    loadUser = data => {
        this.setState({
            user: {
                id: data.id,
                name: data.name,
                email: data.email,
                entries: data.entries,
                joined: data.joined,
            },
        })
    }

    onRouteChange = route => {
        if (route === 'signout') {
            this.setState(initialState)
        } else if (route === 'home') {
            this.setState({
                isSignedIn: true,
            })
        }

        this.setState({
            route: route,
        })
    }

    calculateFaceLocation = data => {
        const clarifaFace =
            data['outputs'][0]['data']['regions'][0]['region_info'].bounding_box
        const image = document.querySelector('#inputImage')
        const width = Number(image.width)
        const height = Number(image.height)

        return {
            top_row: clarifaFace.top_row * height,
            left_col: clarifaFace.left_col * width,
            right_col: width - clarifaFace.right_col * width,
            bottom_row: height - clarifaFace.bottom_row * height,
        }
    }

    displayFaceBox = box => {
        this.setState({
            box: box,
        })
    }

    onInputChange = e => {
        this.setState({
            input: e.target.value,
        })
    }

    onButtonSubmit = () => {
        this.setState({
            imageUrl: this.state.input,
        })

        fetch('http://localhost:3000/imageurl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: this.state.input,
            }),
        })
            .then(response => response.json())
            .then(response => {
                if (response) {
                    fetch('http://localhost:3000/image', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: this.state.user.id,
                        }),
                    })
                        .then(res => res.json())
                        .then(count => {
                            this.setState(
                                Object.assign(this.state.user, {
                                    entries: count,
                                })
                            )
                        })
                        .catch(err => console.log(err))
                }
                this.displayFaceBox(this.calculateFaceLocation(response))
            })
            .catch(err => console.log(err))
    }

    render() {
        const { isSignedIn, imageUrl, route, box } = this.state

        return (
            <div className="App">
                <Particles className="particles" params={particlesOptions} />
                <Navigation
                    isSignedIn={isSignedIn}
                    onRouteChange={this.onRouteChange}
                />

                {route === 'home' ? (
                    <div>
                        <Logo />
                        <Rank
                            name={this.state.user.name}
                            entries={this.state.user.entries}
                        />
                        <ImageLinkForm
                            onInputChange={this.onInputChange}
                            onButtonSubmit={this.onButtonSubmit}
                        />
                        <FaceRecognition imageUrl={imageUrl} box={box} />
                    </div>
                ) : route === 'signin' ? (
                    <Signin
                        onRouteChange={this.onRouteChange}
                        loadUser={this.loadUser}
                    />
                ) : (
                    <Register
                        onRouteChange={this.onRouteChange}
                        loadUser={this.loadUser}
                    />
                )}
            </div>
        )
    }
}

export default App
