 import React, { Component } from 'react';
// import Particles from 'react-particles-js'; 

import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Navigation from './Components/Navigation/Navigation';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import './App.css';

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
    joined: ''
  }
}


class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

loadUser = (data) => {
  this.setState({
    user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries || 0,
      joined: data.joined
    }
  });
}

calculateFaceLocation = (data) => {
  try {
    const clarifaiFace = data.results[0].outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    
    const box = {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    };

    console.log("📦 Calculated face box:", box); // 👈 PLACE IT HERE

    return box;
  } catch (err) {
    console.error("❌ Error extracting face bounding box:", err);
    return null;
  }
}



  displayFaceBox = (box) => {
  console.log('🔍 Displaying box:', box); // ← debug
  this.setState({ box: box });
};

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

onButtonSubmit = () => {
  this.setState({ imageUrl: this.state.input });

  fetch('https://smartbrain-backend-yfjl.onrender.com/imageurl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: this.state.input })
  })
    .then(response => response.json())
    .then(response => {
      const box = this.calculateFaceLocation(response);
      if (box) {
        this.displayFaceBox(box);
      } else {
        console.warn('⚠️ No face box to display.');
      }

      // ✅ FIX: update entries count using the correct endpoint
      return fetch('https://smartbrain-backend-yfjl.onrender.com/image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: this.state.user.id })
      });
    })
    .then(response => response.json())
    .then(count => {
      this.setState(Object.assign(this.state.user, { entries: count }));
    })
    .catch(err => console.error('No face detected or invalid response', err));
};




onRouteChange = (route) => {
  if (route === 'signout') {
    this.setState(initialState); // ✅ Reset everything
  } else if (route === 'home') {
    this.setState({ isSignedIn: true });
  }
  this.setState({ route }); // Always update the route
}


  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
  onInputChange={this.onInputChange}
  onButtonSubmit={this.onButtonSubmit}
/>
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          : (
             route === 'signin'
             ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
             : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}

export default App;