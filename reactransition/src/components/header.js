import React from "react";

require('./header.css');

class Header extends React.Component {
    setStyle = (gs) => {
        this.setState({
            style            : {
                height       : gs*6,
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
    constructor (props) {
        super(props);
    }
    shouldComponentUpdate (nextProps, nextState) {
        if (nextProps != this.props) {
            this.props = nextProps;
            this.setStyle(this.props.grid);
            return true
        }
        else {
            return false
        }
    }
    componentWillMount () {
        this.setStyle(this.props.grid);
    }
    render () {
        let logImgs = [];
        if (this.props.logImgs) {
            for (let logImgSrc of this.props.logImgs) {
                logImgs.push(
                    <li key={logImgSrc}
                        className={"logImgLi"} >
                        <img src={logImgSrc}
                             className={'logImg'}
                             onMouseDown={(e)=>{this.props.selectImg(e.target.src);}}/>
                    </li>
                )
            }
        }
        return (
            <div className={'header'}
                 style={this.state.style}>
                <div className={'originDiv'}
                     onDragOver={(e)=>this.dragOver(e)}
                     onDragLeave={(e)=>{this.dragLeave(e)}}
                     onDrop={(e)=>{this.dropImg(e)}}>
                    <img className={'originImg'}
                         src={this.props.orgImgSrc} />
                </div>
                <div className={'logImgsDiv'}>
                    <ul className={"horizontal-list"}>
                        {logImgs}
                    </ul>
                </div>
            </div>
        )
    }
}

export default Header;
