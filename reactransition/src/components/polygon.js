import React, { Component }  from "react";

require('./polygon.css');

export default class Polygon extends Component {
    updateCanvas = () => {
        const { canvas } = this;
        const context = canvas.getContext('2d');
        this.props.updateCanvas(context);
    };
    setStyle = (gs) => {
        this.setState({
            style            : {
                height       : gs*6,
            },
        });
    };
    componentWillMount () {
        this.setStyle(this.props.grid);
    }
    componentDidMount() {
        this.updateCanvas();
    }
    shouldComponentUpdate (nextProps) {
        if (this.props !== nextProps) {
            this.updateCanvas();
            this.setStyle(this.props.grid);
            return true;
        }else{
            return false;
        }
    }
    componentDidUpdate() {
        this.updateCanvas();
    }
    render () {
        return (
            <canvas
                ref={(e)=>{this.canvas=e;}}
                width={this.props.CW}
                height={this.props.CH}
                style={this.state.style}
                className={'polygonCanvas'}
            />
        )
    }
}