import React from "react";

require('./display.css');

class Display extends React.Component {
    setStyle = (gs) => {
        this.setState({
            style            : {
                height       : gs*19,
            },
        });
    };
    dragOver = (e) => {
        e.preventDefault();
        e.target.classList.add('dragover');
    };
    dragLeave = (e) => {
        e.preventDefault();
        e.target.classList.remove('dragover');
    };
    dropImg = (e) => {
        e.preventDefault();
        e.target.classList.remove('dragenter');
        document.getElementById('img_form').children[2].files = e.dataTransfer.files;
        return this.props.uploadFunction();
    };
    mouseMoveFunc = (e) => {
        if (this.props.mouseMoveFunc) {
            this.props.mouseMoveFunc(e)
        }
    };
    constructor (props) {
        super(props);
    }
    shouldComponentUpdate (nextProps, nextState) {
        if (nextProps != this.props) {
            this.props = nextProps;
            this.setStyle(this.props.grid);
            return true
        } else {
            return false
        }
    }
    componentWillMount () {
        this.setStyle(this.props.grid);
    }
    render () {
        let loadingDisplay = {
            display     : 'none',
        };
        if (this.props.loading) {
            loadingDisplay = {
                display : 'inline-block',
            }
        }
        return (
            <div className={'display'}
                 style={this.state.style}>
                <div className={'displayDiv'}
                     onDrop={(e)=>{this.dropImg(e)}}
                     onDragOver={(e)=>this.dragOver(e)}
                     onDragLeave={(e)=>{this.dragLeave(e)}}
                     onMouseMove={(e)=>{this.mouseMoveFunc(e)}}>
                    <div className={'loader'}
                         style={loadingDisplay} />
                    <img src={this.props.imgSrc}
                         className={'displayImg'}
                         onMouseDown={(e)=>{this.props.selectImg(e.target.src);}} />
                </div>
            </div>
        )
    }
}

export default Display;
