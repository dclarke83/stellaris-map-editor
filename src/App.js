import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.mapArea = React.createRef();
    this.state = {
      gridSize: 600,
      offsetX: 0,
      offsetY: 0,
      current: {
        x: 0,
        y: 0,
      },
      converted: {
        x: 0,
        y: 0,
      },
      stars:[],
      currentStar: {}
    };
  }

  updateStar = (starValues) => {
    const stars = this.state.stars.slice();
    const starIndex = stars.map((star) => star.id).indexOf(starValues.id);
    const coordinates = this.invertCoordinates(starValues.mapX, starValues.mapY, this.state.gridSize);
    const newStar = {
      id: starValues.id,
      mapX: starValues.mapX,
      mapY: starValues.mapY,
      x: coordinates.x,
      y: coordinates.y,
      initialiser: starValues.initialiser,
    };

    stars[starIndex] = newStar;

    this.setState({
      stars: stars,
      currentStar: newStar,
    });
  }

  setCurrentStar = (targetStar) => {
    const stars = this.state.stars.slice();

    stars.forEach((star) => {
      if(star.id === targetStar.id){
        star.selected = true;
      } else {
        star.selected = false;
      }
    });

    this.setState({
      currentStar: targetStar,
      stars: stars,
    });
  }

  adjustRelativeCoords = () => {
    if(this.mapArea.current){
      const coords = this.mapArea.current.getBoundingClientRect();
      this.setState({
        offsetX: coords.left,
        offsetY: coords.top,
      });
    }
  }

  handleClick = (event) => {
    const x = event.clientX - this.state.offsetX;
    const y = event.clientY - this.state.offsetY;
    const mapX = this.convertCoordinates(x, y, this.state.gridSize).x;
    const mapY = this.convertCoordinates(x, y, this.state.gridSize).y;
    const stars = this.state.stars.slice(); //get copy of stars array
    const existing = stars.find(star => star.x === x && star.y === y); //see if star already exists at these coords

    stars.forEach((star) => {
      if(star.x === x && star.y === y){
        star.selected = true;
      } else {
        star.selected = false;
      }
    });

    if(existing){
      this.setState({
        stars: stars,
        currentStar: existing
      });      
    } else {
      const newStar = {
        x: x,
        y: y,
        mapX: mapX,
        mapY: mapY,
        selected: true,
        initialiser: 'None',
        id: '_' + Math.random().toString(36).substr(2, 9)
      };
      this.setState({
        stars: stars.concat([newStar]),
        currentStar: newStar
      });
    }
  }

  handleMouseMove = (event) => {
    this.adjustRelativeCoords();
    const converted = this.convertCoordinates(event.clientX - this.state.offsetX, event.clientY - this.state.offsetY, this.state.gridSize);
    this.setState({
      current: {
        x: event.clientX - this.state.offsetX,
        y: event.clientY - this.state.offsetY,
      },
      converted: converted
    });
  }

  convertCoordinates = (x, y, size) => {
    const half = Math.floor(size / 2);
    return {
      x: (x === half) ? 0 : half - x,
      y: (y === half) ? 0 : y - half,
    };
  }

  invertCoordinates = (mapX, mapY, size) => {
    const half = Math.floor(size / 2);
    const iMapX = parseInt(mapX, 10);
    const iMapY = parseInt(mapY, 10);
    return {
      x: (iMapX === half) ? 0 : (iMapX*-1) + half, //
      y: (iMapY === half) ? 0 : iMapY + half,
    };
  }

  render() {
    return (
      <div className='container'>
        <div className='coords'>
          Current coordinates: 
          ({this.state.current.x}, {this.state.current.y}) => ({this.state.converted.x}, {this.state.converted.y})
        </div>
        <div className='map-area' style={{ height: this.state.gridSize, width: this.state.gridSize }} onMouseMove={this.handleMouseMove} ref={this.mapArea}>
          <svg height={this.state.gridSize} width={this.state.gridSize} onClick={this.handleClick}>
            <line x1={this.state.gridSize / 2} y1='0' x2={this.state.gridSize / 2} y2={this.state.gridSize} stroke='white' strokeWidth='1'></line>
            <line x1='0' y1={this.state.gridSize / 2} x2={this.state.gridSize} y2={this.state.gridSize /2} stroke='white' strokeWidth='1'></line>
            <g>
              {this.state.stars.map((star) => (
                <Star key={star.id} x={star.x} y={star.y} selected={star.selected}></Star>
              ))}
            </g>
          </svg>
        </div>
        <StarList stars={this.state.stars} onClick={this.setCurrentStar}></StarList>
        <StarEditor star={this.state.currentStar} onClick={this.updateStar}></StarEditor>
      </div>
    );
  }
}

class Star extends Component {
  render() {
    return (
      <circle cx={this.props.x} cy={this.props.y} r={2} fill={ this.props.selected ? 'yellow' : 'white' }></circle>
    );
  }
}

class StarList extends Component {
  render() {
    return (
      <div className='star-list'>
        <ul>
          {this.props.stars.map((star) => (
            <StarItem x={star.x} y={star.y} mapX={star.mapX} mapY={star.mapY} key={star.id} selected={star.selected} initialiser={this.props.initialiser} onClick={this.props.onClick}></StarItem>
          ))}
        </ul>
      </div>
    );
  }
}

class StarItem extends Component {
  render() {
    return (
      <li>
        <span onClick={() => this.props.onClick(this.props)} style={ this.props.selected ? { fontWeight: 'bold' } : null }>
          ({this.props.x}, {this.props.y}) ({this.props.mapX}, {this.props.mapY})
        </span>
      </li>
    );
  }
}

class StarEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: '',
      mapX: '',
      mapY: '',
      initialiser: ''
    };

  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.star.mapX){
      this.setState({
        id: nextProps.star.id,
        mapX: nextProps.star.mapX,
        mapY: nextProps.star.mapY,
        initialiser: nextProps.star.initialiser
      });
    }
  }

  handleSubmit = (event) => {
    this.props.onClick(this.state);
    event.preventDefault();
  }

  handleInputChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  render() {

    //console.log(this.props, this.state);

    return (
      <div className='star-editor'>
        <form onSubmit={this.handleSubmit}>
          <div className='control'>
            <label htmlFor='initialiser'>Initialiser</label>
            <input id='initialiser' name='initialiser' type='text' value={this.state.initialiser} onChange={this.handleInputChange}></input>
          </div>
          <div className='control'>
            <label htmlFor='mapX'>X</label>
            <input id='mapX' name='mapX' type='number' value={this.state.mapX} onChange={this.handleInputChange}></input>
          </div>
          <div className='control'>
            <label htmlFor='mapY'>Y</label>
            <input id='mapY' name='mapY' type='number' value={this.state.mapY} onChange={this.handleInputChange}></input>
          </div>
          <div className='control'>
            <button type='submit'>Update</button>
          </div>
        </form>
      </div>
    );
  }
}

export default App;
